import os
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Submission
from agents.document_agent import DocumentAgent
from agents.generation_agent import GenerationAgent
from agents.evaluation_agent import EvaluationAgent

router = APIRouter(prefix="/demo", tags=["Demo"])

document_agent = DocumentAgent()
generation_agent = GenerationAgent()
evaluation_agent = EvaluationAgent()


@router.post("/quick-run", status_code=status.HTTP_200_OK)
@router.post("/demo/quick-run", status_code=status.HTTP_200_OK)
def demo_quick_run(db: Session = Depends(get_db)):
    """
    Automatically ingests pre-loaded ML syllabus, generates a 5-question quiz,
    creates a pre-scored student submission with 1 intentional wrong answer,
    and returns full evaluation result in 1 call for instant demoing.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    syllabus_path = os.path.join(backend_dir, "uploads", "sample_syllabus.txt")
    if not os.path.exists(syllabus_path):
        syllabus_path = os.path.join(backend_dir, "uploads", "sample_syllabus.pdf")

    if not os.path.exists(syllabus_path):
        os.makedirs(os.path.join(backend_dir, "uploads"), exist_ok=True)
        syllabus_path = os.path.join(backend_dir, "uploads", "sample_syllabus.txt")
        with open(syllabus_path, "w", encoding="utf-8") as f:
            f.write(
                "EduMentor AI Machine Learning Syllabus\n"
                "Unit 1: Supervised Learning & Linear Regression. Minimizes Mean Squared Error (MSE).\n"
                "Unit 2: Logistic Regression & Classification. Uses Sigmoid activation function for probabilities.\n"
                "Unit 3: Unsupervised Learning & Clustering. K-Means optimizes cluster centroids.\n"
                "Unit 4: Retrieval-Augmented Generation (RAG). Combines vector search in ChromaDB with LLMs.\n"
                "Unit 5: Grounded Evaluation. Ensures quiz grading strictly adheres to source chunks.\n"
            )

    filename = os.path.basename(syllabus_path)

    # 1. Ingest pre-loaded syllabus
    doc_result = document_agent.process_document(db, syllabus_path, filename)
    doc_id = doc_result["document_id"]

    # 2. Generate 5-question quiz
    quiz_payload = generation_agent.generate_quiz(db, document_id=doc_id, num_questions=5)
    quiz_id = quiz_payload["quiz_id"]
    questions = quiz_payload["questions"]

    # 3. Create pre-scored student submission with 1 intentional wrong answer
    answers = []
    for idx, q in enumerate(questions):
        correct_opt = str(q.get("correct_option", "A")).strip().upper()
        if idx == 1:
            # 1 intentional wrong answer
            selected_opt = "B" if correct_opt != "B" else "A"
        else:
            selected_opt = correct_opt
        answers.append({"question_id": q["id"], "selected_option": selected_opt})

    sub_id = str(uuid.uuid4())
    db_sub = Submission(
        id=sub_id,
        quiz_id=quiz_id,
        answers_json=json.dumps(answers),
        evaluated=0,
        result_json=None
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)

    # 4. Evaluate submission
    eval_result = evaluation_agent.evaluate_submission(db, sub_id)

    # 5. Return full demo payload
    return {
        "status": "success",
        "message": "Demo quick-run completed successfully",
        "document_id": doc_id,
        "quiz_id": quiz_id,
        "submission_id": sub_id,
        "quiz": quiz_payload,
        "answers_submitted": answers,
        "evaluation": eval_result
    }
