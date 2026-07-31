import os
import re
from typing import List, Dict, Any

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None


def extract_text_from_file(file_path: str) -> str:
    """Extract raw text from PDF or TXT file with fallback handling."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    text_content = ""

    if ext == ".pdf":
        # Try PyMuPDF first
        if fitz:
            try:
                doc = fitz.open(file_path)
                pages_text = []
                for page in doc:
                    pages_text.append(page.get_text())
                text_content = "\n\n".join(pages_text)
            except Exception:
                text_content = ""

        # Try pypdf if PyMuPDF didn't yield text
        if not text_content.strip() and pypdf:
            try:
                reader = pypdf.PdfReader(file_path)
                pages_text = []
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        pages_text.append(extracted)
                text_content = "\n\n".join(pages_text)
            except Exception:
                text_content = ""

        # Fallback if binary file read directly or plain text inside PDF
        if not text_content.strip():
            with open(file_path, "rb") as f:
                raw_bytes = f.read()
                # Basic string extraction for unencrypted text streams
                text_content = re.sub(r"[^\x20-\x7E\n\t]", " ", raw_bytes.decode("latin1", errors="ignore"))

    else:
        # Standard text file
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text_content = f.read()

    text_content = text_content.strip()
    if not text_content:
        raise ValueError("Could not extract readable text from the provided file.")

    return text_content


def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 100) -> List[Dict[str, Any]]:
    """
    Splits text into overlapping chunks.
    Returns a list of dicts with 'id', 'text', 'chunk_index'.
    """
    clean_text = re.sub(r"\s+", " ", text).strip()
    if not clean_text:
        return []

    words = clean_text.split(" ")
    chunks = []
    chunk_idx = 0

    # Approach: word-based chunking (~ 500 chars is ~ 80 words)
    words_per_chunk = max(30, chunk_size // 6)
    overlap_words = max(5, chunk_overlap // 6)

    start = 0
    total_words = len(words)

    while start < total_words:
        end = min(start + words_per_chunk, total_words)
        chunk_words = words[start:end]
        chunk_str = " ".join(chunk_words)

        if chunk_str.strip():
            chunks.append({
                "id": f"chunk_{chunk_idx}",
                "text": chunk_str,
                "chunk_index": chunk_idx,
                "page_number": (chunk_idx // 2) + 1,
                "token_count": len(chunk_words)
            })
            chunk_idx += 1

        if end >= total_words:
            break

        start += (words_per_chunk - overlap_words)

    return chunks
