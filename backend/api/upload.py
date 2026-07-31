import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from agents.document_agent import DocumentAgent

router = APIRouter(tags=["Document Upload"])
document_agent = DocumentAgent()


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts PDF or text document upload, extracts text, chunks, embeds,
    stores in SQLite & ChromaVectorStore, and returns document_id + chunk_count.
    """
    filename = (file.filename or "uploaded_syllabus.pdf").strip()
    filename_lower = filename.lower()
    
    # 1. Extension & Format Validation (reject non-PDF/non-TXT with 400)
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF (.pdf) or text (.txt) files are supported."
        )

    # 2. File Size Validation (reject > 15MB with 413)
    MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({file_size / (1024*1024):.2f}MB) exceeds maximum allowed limit of 15MB."
        )


    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    uploads_dir = os.getenv("UPLOADS_DIR", os.path.join(backend_dir, "uploads"))
    os.makedirs(uploads_dir, exist_ok=True)

    saved_filepath = os.path.join(uploads_dir, filename)

    try:
        with open(saved_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}"
        )

    try:
        result = document_agent.process_document(db, saved_filepath, filename)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )
