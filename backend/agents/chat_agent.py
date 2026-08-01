import os
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from db.models import Document
from rag.chroma_store import ChromaVectorStore

try:
    import requests
except ImportError:
    requests = None


class ChatAgent:
    def __init__(self, vector_store: ChromaVectorStore = None, model_name: str = None):
        self.vector_store = vector_store or ChromaVectorStore()
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

    def ask_question(self, db: Session, document_id: str, question: str, model_name: str = None) -> Dict[str, Any]:
        """
        Retrieves relevant syllabus chunks, prompts Gemini API to answer the question,
        and returns the answer along with the source chunks.
        """
        selected_model = model_name or self.model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

        # Verify document exists in DB
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document with ID '{document_id}' not found.")

        # Retrieve relevant chunks from vector store
        retrieved_chunks = self.vector_store.similarity_search(document_id, question, top_k=3)

        if not retrieved_chunks:
            retrieved_chunks = [{
                "id": "chunk_0",
                "text": "No specific context found.",
                "chunk_index": 0,
                "similarity_score": 0.0,
                "page_number": 1,
                "token_count": 0
            }]

        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

        answer = None
        if gemini_key and requests:
            answer = self._call_gemini_for_answer(gemini_key, retrieved_chunks, question, model_name=selected_model)

        if not answer:
            answer = "I'm sorry, I couldn't connect to the AI model to answer your question at this time. Please check your API key."

        return {
            "answer": answer,
            "source_chunks": retrieved_chunks,
            "model_name": selected_model
        }

    def _call_gemini_for_answer(self, api_key: str, chunks: List[Dict[str, Any]], question: str, model_name: str = "gemini-1.5-flash") -> str:
        """Prompts Gemini REST API to answer the question based strictly on chunks."""
        context_str = "\n---\n".join([f"[Chunk ID: {c['id']}]\n{c['text']}" for c in chunks])
        
        prompt = (
            "You are a helpful teaching assistant AI. Your job is to answer the student's question "
            "based strictly on the provided syllabus excerpts.\n"
            "Do NOT use outside knowledge. If the answer is not in the excerpts, say 'I cannot find the answer in the syllabus.'\n\n"
            "Excerpts:\n"
            f"{context_str}\n\n"
            f"Student's Question: {question}\n\n"
            "Answer directly and concisely in a helpful tone."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2}
        }

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                return text
            else:
                print(f"[ChatAgent] Gemini API Error: {resp.text}")
        except Exception as e:
            print(f"[ChatAgent] Gemini API connection error: {e}")

        return None
