from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from agents.evaluation_agent import EvaluationAgent

router = APIRouter(tags=["Quiz Evaluation"])
evaluation_agent = EvaluationAgent()


@router.get("/evaluate/{submission_id}", status_code=status.HTTP_200_OK)
def evaluate_submission(
    submission_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves submission and quiz, looks up ground truth source chunk per question,
    prompts Gemini API or fallback evaluator, records score, verdict, explanations,
    source excerpts, and weak topics in SQLite, and returns result JSON.
    """
    try:
        result = evaluation_agent.evaluate_submission(db, submission_id)
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
