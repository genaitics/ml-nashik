from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from agents.evaluation_agent import EvaluationAgent

router = APIRouter(tags=["Quiz Evaluation"])
evaluation_agent = EvaluationAgent()


from pydantic import BaseModel
import uuid
import json
from db.models import Submission

class AnswerItem(BaseModel):
    question_id: int | str
    selected_option: int | str = ""
    text_answer: str = ""

class EvaluateRequest(BaseModel):
    quiz_id: str
    answers: list[AnswerItem]
    quiz_data: dict = None


@router.post("/evaluate", status_code=status.HTTP_200_OK)
def evaluate_submission(
    request: EvaluateRequest,
    db: Session = Depends(get_db)
):
    """
    Creates a submission record from user answers and triggers the evaluation agent.
    """
    try:
        sub_id = str(uuid.uuid4())
        answers_list = [
            {"question_id": a.question_id, "selected_option": a.selected_option, "text_answer": a.text_answer}
            for a in request.answers
        ]
        db_sub = Submission(
            id=sub_id,
            quiz_id=request.quiz_id,
            answers_json=json.dumps(answers_list),
            evaluated=0,
            result_json=""
        )
        db.add(db_sub)
        db.commit()
        db.refresh(db_sub)
        
        result = evaluation_agent.evaluate_submission(db, sub_id, quiz_data=request.quiz_data)
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )
