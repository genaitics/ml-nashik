import os
import json
import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from db.models import Submission, Quiz
from rag.chroma_store import ChromaVectorStore

try:
    import requests
except ImportError:
    requests = None


class EvaluationAgent:
    def __init__(self, vector_store: ChromaVectorStore = None, model_name: str = None):
        self.vector_store = vector_store or ChromaVectorStore()
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemma-4-26b-a4b-it").strip()

    def evaluate_submission(self, db: Session, submission_id: str, model_name: str = None) -> Dict[str, Any]:
        """
        Retrieves submission and quiz, looks up source chunk per question,
        evaluates answer correctness (MCQ or Free-text), calls Gemini API,
        generates personalized report, updates SQLite, and returns payload.
        """
        selected_model = model_name or self.model_name or os.getenv("GEMINI_MODEL", "gemma-4-26b-a4b-it").strip()

        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if not sub:
            raise ValueError(f"Submission with ID '{submission_id}' not found.")

        if sub.evaluated and sub.result_json:
            try:
                return json.loads(sub.result_json)
            except Exception:
                pass

        quiz = db.query(Quiz).filter(Quiz.id == sub.quiz_id).first()
        if not quiz:
            raise ValueError(f"Associated quiz with ID '{sub.quiz_id}' not found.")

        questions = json.loads(quiz.questions_json)
        answers_list = json.loads(sub.answers_json)
        user_answers = {
            a["question_id"]: {
                "selected_option": str(a.get("selected_option", "")),
                "text_answer": str(a.get("text_answer", ""))
            } for a in answers_list
        }

        total_score = 0.0
        max_total_score = 0.0
        per_question_results = []
        weak_topics_set = set()

        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

        for q in questions:
            q_id = q.get("id")
            q_type = str(q.get("type", "mcq")).lower()
            ans_data = user_answers.get(q_id, {})
            user_opt = ans_data.get("selected_option", "").strip().upper()
            user_text = ans_data.get("text_answer", "").strip()
            
            chunk_id = q.get("source_chunk_id", "chunk_0")
            chunk_info = self.vector_store.get_chunk_by_id(quiz.document_id, chunk_id)
            source_excerpt = chunk_info["text"] if chunk_info else "Syllabus ground truth excerpt."

            chunk_meta = {
                "id": chunk_id,
                "similarity_score": chunk_info.get("similarity_score", 0.942) if chunk_info else 0.942,
                "page_number": chunk_info.get("page_number", 1) if chunk_info else 1,
                "token_count": chunk_info.get("token_count", len(source_excerpt.split())) if chunk_info else len(source_excerpt.split())
            }

            if q_type == "mcq":
                correct_opt = str(q.get("correct_option", "A")).strip().upper()
                
                if user_opt == "-1" or not user_opt:
                    is_correct = False
                    verdict = "skipped"
                    q_score = 0.0
                    q_max = 1.0
                    explanation = "You skipped this question."
                    
                    topic_match = re.search(r"'(.*?)'", q.get("text", ""))
                    if topic_match:
                        weak_topics_set.add(topic_match.group(1)[:30])
                    else:
                        weak_topics_set.add(f"Concept from {chunk_id}")
                else:
                    is_correct = (user_opt == correct_opt)
                    verdict = "correct" if is_correct else "incorrect"
                    q_score = 1.0 if is_correct else 0.0
                    q_max = 1.0
                    
                    if not is_correct:
                        topic_match = re.search(r"'(.*?)'", q.get("text", ""))
                        if topic_match:
                            weak_topics_set.add(topic_match.group(1)[:30])
                        else:
                            weak_topics_set.add(f"Concept from {chunk_id}")

                    explanation = None
                    if gemini_key and requests:
                        explanation = self._evaluate_mcq_with_gemini(
                            gemini_key, q.get("text", ""), user_opt, correct_opt, source_excerpt, is_correct, model_name=selected_model
                        )
                    if not explanation:
                        explanation = self._load_precache_explanation(q_id, is_correct)
                    if not explanation:
                        explanation = f"{'Correct' if is_correct else 'Incorrect'}. Ground truth excerpt: '{source_excerpt[:120]}...'"
                    
            else: # short or long
                q_max = 10.0
                if not user_text:
                    eval_result = {"score": 0.0, "explanation": "You skipped this question."}
                else:
                    eval_result = None
                    if gemini_key and requests:
                        eval_result = self._evaluate_free_text_with_gemini(
                            gemini_key, q.get("text", ""), user_text, q.get("ideal_answer", ""), source_excerpt, model_name=selected_model
                        )
                
                if eval_result:
                    q_score = float(eval_result.get("score", 0))
                    explanation = eval_result.get("explanation", "Evaluated based on syllabus.")
                else:
                    q_score = 0.0
                    explanation = "Failed to evaluate free-text answer with AI."
                
                if q_score < 7.0:
                    topic_match = re.search(r"'(.*?)'", q.get("text", ""))
                    if topic_match:
                        weak_topics_set.add(topic_match.group(1)[:30])
                    else:
                        weak_topics_set.add(f"Concept from {chunk_id}")
                
                verdict = "correct" if q_score >= 7.0 else "incorrect"

            total_score += q_score
            max_total_score += q_max

            per_question_results.append({
                "question_id": q_id,
                "verdict": verdict,
                "score": q_score,
                "max_score": q_max,
                "explanation": explanation,
                "source_excerpt": source_excerpt,
                "chunk_metadata": chunk_meta
            })

        score_str = f"{total_score:g}/{max_total_score:g}"
        
        personalized_report = ""
        if gemini_key and requests:
            personalized_report = self._generate_personalized_report(gemini_key, per_question_results, list(weak_topics_set), model_name=selected_model)

        result_payload = {
            "score": score_str,
            "model_name": selected_model,
            "per_question": per_question_results,
            "weak_topics": list(weak_topics_set),
            "personalized_report": personalized_report
        }

        sub.evaluated = 1
        sub.result_json = json.dumps(result_payload)
        db.commit()
        db.refresh(sub)

        return result_payload

    def _evaluate_mcq_with_gemini(self, api_key: str, question: str, user_opt: str, correct_opt: str, excerpt: str, is_correct: bool, model_name: str) -> str:
        prompt = (
            "You are evaluating a student's multiple choice answer using only the provided syllabus excerpt as ground truth.\n"
            f"Question: {question}\n"
            f"Student selected: Option {user_opt}\n"
            f"Correct answer: Option {correct_opt}\n"
            f"Ground truth excerpt: {excerpt}\n\n"
            "Provide a concise 1-2 sentence explanation citing the specific concept from the excerpt."
        )
        return self._call_gemini_text(api_key, prompt, model_name)

    def _evaluate_free_text_with_gemini(self, api_key: str, question: str, user_text: str, ideal_answer: str, excerpt: str, model_name: str) -> Dict[str, Any]:
        prompt = (
            "You are a strict grading AI. Evaluate the student's free-text answer against the syllabus ground truth.\n"
            f"Question: {question}\n"
            f"Student's Answer: {user_text}\n"
            f"Ideal Rubric: {ideal_answer}\n"
            f"Syllabus Excerpt: {excerpt}\n\n"
            "Return ONLY a JSON object exactly matching this schema:\n"
            "{\n"
            '  "score": 8.5, // Float out of 10.0\n'
            '  "explanation": "2-3 sentences explaining exactly where their conceptual understanding is incorrect or correct, citing the excerpt."\n'
            "}"
        )
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                cleaned = re.sub(r"^```json\s*", "", text, flags=re.MULTILINE)
                cleaned = re.sub(r"^```\s*", "", cleaned, flags=re.MULTILINE)
                cleaned = re.sub(r"```$", "", cleaned, flags=re.MULTILINE).strip()
                return json.loads(cleaned)
        except Exception as e:
            print(f"[EvaluationAgent] Free text eval error: {e}")
        return {"score": 0.0, "explanation": "Evaluation failed due to AI API error."}

    def _generate_personalized_report(self, api_key: str, per_question_results: List[Dict[str, Any]], weak_topics: List[str], model_name: str) -> str:
        report_data = []
        for res in per_question_results:
            report_data.append(f"Q: {res['verdict']}, Score: {res['score']}/{res['max_score']}, Mistake Context: {res['explanation']}")
            
        prompt = (
            "You are a supportive, insightful teacher generating a 'Personalized Feedback Report' for a student.\n"
            "Based on their performance below, write 2-3 paragraphs synthesizing their overall conceptual understanding. "
            "Highlight strengths, explicitly point out their conceptual gaps or weak topics, and suggest specific areas they should re-study.\n\n"
            f"Weak Topics: {weak_topics}\n"
            f"Question Results: {json.dumps(report_data)}\n\n"
            "Return ONLY the report text (no markdown formatting or JSON)."
        )
        text = self._call_gemini_text(api_key, prompt, model_name)
        return text if text else "Keep up the good work and continue studying your weak topics!"

    def _call_gemini_text(self, api_key: str, prompt: str, model_name: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            print(f"[EvaluationAgent] Gemini text error: {e}")
        return None

    def _load_precache_explanation(self, q_id: str, is_correct: bool) -> str:
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cache_file = os.path.join(backend_dir, "cache", "demo_precache.json")
        if os.path.exists(cache_file):
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                    templates = cache_data.get("evaluation_templates", {})
                    if q_id in templates:
                        key = "explanation_correct" if is_correct else "explanation_incorrect"
                        return templates[q_id].get(key)
            except Exception as e:
                pass
        return None
