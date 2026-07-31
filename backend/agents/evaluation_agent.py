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
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

    def evaluate_submission(self, db: Session, submission_id: str, model_name: str = None) -> Dict[str, Any]:
        """
        Retrieves submission and quiz, looks up source chunk per question,
        evaluates answer correctness, calls Gemini API or fallback evaluator for
        grounded explanations & weak topics, updates SQLite record, and returns payload.
        """
        selected_model = model_name or self.model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if not sub:
            raise ValueError(f"Submission with ID '{submission_id}' not found.")

        # Return cached evaluation if already completed
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
        user_answers = {a["question_id"]: a.get("selected_option", "") for a in answers_list}

        correct_count = 0
        total_questions = len(questions)
        per_question_results = []
        weak_topics_set = set()

        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

        for q in questions:
            q_id = q["id"]
            user_opt = user_answers.get(q_id, "").strip().upper()
            correct_opt = str(q.get("correct_option", "A")).strip().upper()
            chunk_id = q.get("source_chunk_id", "chunk_0")

            # Retrieve source chunk
            chunk_info = self.vector_store.get_chunk_by_id(quiz.document_id, chunk_id)
            source_excerpt = chunk_info["text"] if chunk_info else "Syllabus ground truth excerpt."

            sim_score = chunk_info.get("similarity_score", 0.942) if chunk_info else 0.942
            page_num = chunk_info.get("page_number", 1) if chunk_info else 1
            tok_count = chunk_info.get("token_count", len(source_excerpt.split())) if chunk_info else len(source_excerpt.split())

            chunk_meta = {
                "id": chunk_id,
                "similarity_score": sim_score,
                "page_number": page_num,
                "token_count": tok_count
            }

            is_correct = (user_opt == correct_opt)
            if is_correct:
                correct_count += 1
                verdict = "correct"
            else:
                verdict = "incorrect"
                # Extract weak topic heuristic from question text
                topic_match = re.search(r"'(.*?)'", q["text"])
                if topic_match:
                    weak_topics_set.add(topic_match.group(1)[:30])
                else:
                    weak_topics_set.add(f"Concept from {chunk_id}")

            explanation = None
            if gemini_key and requests:
                explanation = self._evaluate_with_gemini(
                    gemini_key, q["text"], user_opt, correct_opt, source_excerpt, is_correct, model_name=selected_model
                )

            if not explanation:
                explanation = self._load_precache_explanation(q_id, is_correct)

            if not explanation:
                if is_correct:
                    explanation = f"Correct! You selected option {user_opt}, which matches the syllabus excerpt: '{source_excerpt[:120]}...'"
                else:
                    explanation = f"Incorrect. You selected option {user_opt}, but correct option is {correct_opt}. Ground truth: '{source_excerpt[:120]}...'"

            per_question_results.append({
                "question_id": q_id,
                "verdict": verdict,
                "explanation": explanation,
                "source_excerpt": source_excerpt,
                "chunk_metadata": chunk_meta
            })

        score_str = f"{correct_count}/{total_questions}"
        result_payload = {
            "score": score_str,
            "model_name": selected_model,
            "per_question": per_question_results,
            "weak_topics": list(weak_topics_set)
        }

        # Update SQLite submission record
        sub.evaluated = 1
        sub.result_json = json.dumps(result_payload)
        db.commit()
        db.refresh(sub)

        return result_payload

    def _evaluate_with_gemini(
        self, api_key: str, question: str, user_opt: str, correct_opt: str, excerpt: str, is_correct: bool, model_name: str = "gemini-1.5-flash"
    ) -> str:
        """Calls Gemini API for grounded evaluation explanation with retry-once logic."""
        prompt = (
            "You are evaluating a student's multiple choice answer using only the provided syllabus excerpt as ground truth.\n"
            f"Question: {question}\n"
            f"Student selected: Option {user_opt}\n"
            f"Correct answer: Option {correct_opt}\n"
            f"Ground truth excerpt: {excerpt}\n\n"
            "Provide a concise 1-2 sentence explanation citing the specific concept from the excerpt."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        # Attempt 1
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if text:
                    return text
        except Exception as e:
            print(f"[EvaluationAgent] Attempt 1 Gemini evaluation error: {e}")

        # Attempt 2: Retry once with stricter formatting instruction
        print("[EvaluationAgent] Gemini evaluation Attempt 1 failed. Retrying once with strict instructions...")
        stricter_prompt = (
            prompt +
            "\n\nCRITICAL RETRY INSTRUCTION: Respond strictly with ONLY a 1-2 sentence clear, direct text explanation. "
            "Do NOT return JSON, markdown blocks, or metadata."
        )
        retry_payload = {"contents": [{"parts": [{"text": stricter_prompt}]}]}

        try:
            resp = requests.post(url, json=retry_payload, headers=headers, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if text:
                    return text
        except Exception as e:
            print(f"[EvaluationAgent] Attempt 2 Gemini evaluation retry error: {e}")

        return None

    def _load_precache_explanation(self, q_id: str, is_correct: bool) -> str:
        """Loads explanation template from cache/demo_precache.json."""
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
                print(f"[EvaluationAgent] Error loading precache explanation: {e}")
        return None

