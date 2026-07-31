import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Quiz, Submission

router = APIRouter(tags=["Quiz Submission"])


class AnswerItem(BaseModel):
    question_id: str = Field(..., description="ID of the question")
    selected_option: str = Field(..., description="Selected option letter (e.g. A, B, C, D)")


class SubmitRequest(BaseModel):
    quiz_id: str = Field(..., description="UUID of the quiz")
    answers: List[AnswerItem] = Field(..., description="List of submitted answers")


@router.post("/submit", status_code=status.HTTP_200_OK)
def submit_quiz(
    request: SubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Saves student quiz answers in SQLite submissions table and returns submission_id.
    """
    quiz = db.query(Quiz).filter(Quiz.id == request.quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with ID '{request.quiz_id}' not found."
        )

    submission_id = str(uuid.uuid4())
    answers_json = json.dumps([item.dict() for item in request.answers])

    db_submission = Submission(
        id=submission_id,
        quiz_id=request.quiz_id,
        answers_json=answers_json,
        evaluated=0,
        result_json=None
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)

    return {"submission_id": submission_id}


@router.get("/submission/{submission_id}", status_code=status.HTTP_200_OK)
def get_submission(
    submission_id: str,
    db: Session = Depends(get_db)
):
    """
    Allows recovering submission state by submission_id.
    """
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission with ID '{submission_id}' not found."
        )

    answers = []
    if sub.answers_json:
        try:
            answers = json.loads(sub.answers_json)
        except Exception:
            answers = []

    result = None
    if sub.result_json:
        try:
            result = json.loads(sub.result_json)
        except Exception:
            result = None

    return {
        "submission_id": sub.id,
        "quiz_id": sub.quiz_id,
        "answers": answers,
        "evaluated": bool(sub.evaluated),
        "result": result,
        "created_at": sub.created_at.isoformat() if sub.created_at else None
    }

