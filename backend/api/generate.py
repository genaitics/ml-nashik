import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Quiz
from agents.generation_agent import GenerationAgent

router = APIRouter(tags=["Quiz Generation"])
generation_agent = GenerationAgent()


class GenerateRequest(BaseModel):
    doc_id: str = Field(..., description="UUID of the uploaded document")
    num_questions: int = Field(5, ge=1, le=20, description="Number of questions to generate")


@router.post("/generate", status_code=status.HTTP_200_OK)
def generate_quiz(
    request: GenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Retrieves top syllabus chunks, prompts Gemini API / fallback generator for strictly formatted MCQs,
    saves in SQLite, and returns generated quiz payload.
    """
    try:
        quiz_payload = generation_agent.generate_quiz(
            db=db,
            document_id=request.doc_id,
            num_questions=request.num_questions
        )
        return quiz_payload
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz generation failed: {str(e)}"
        )


@router.get("/quiz/{quiz_id}", status_code=status.HTTP_200_OK)
def get_quiz(
    quiz_id: str,
    db: Session = Depends(get_db)
):
    """
    Allows recovering an ongoing quiz by ID if browser refreshes.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with ID '{quiz_id}' not found."
        )

    questions = []
    if quiz.questions_json:
        try:
            questions = json.loads(quiz.questions_json)
        except Exception:
            questions = []

    return {
        "quiz_id": quiz.id,
        "doc_id": quiz.document_id,
        "questions": questions,
        "created_at": quiz.created_at.isoformat() if quiz.created_at else None
    }

