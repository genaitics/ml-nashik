import os
import math
import re
import requests
from typing import List

def _hashed_vector(text: str, dim: int = 3072) -> List[float]:
    """Fallback deterministic feature vectorizer for text when API fails."""
    vec = [0.0] * dim
    clean_text = text.lower()
    words = re.findall(r"\w+", clean_text)
    
    if not words:
        return vec

    for word in words:
        h1 = hash(word) % dim
        h2 = hash(word[::-1]) % dim
        vec[h1] += 1.0
        vec[h2] += 0.5

    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec

def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Generates embedding vectors for a list of texts using Gemini API."""
    if not texts:
        return []

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedContents?key={api_key}"
        headers = {"Content-Type": "application/json"}
        requests_payload = []
        for text in texts:
            requests_payload.append({
                "model": "models/gemini-embedding-2",
                "content": {"parts": [{"text": text[:5000]}]} # Basic truncation for safety
            })
        
        payload = {"requests": requests_payload}
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                embeddings = [item["values"] for item in data.get("embeddings", [])]
                if len(embeddings) == len(texts):
                    return embeddings
            else:
                print(f"[Embeddings] API Error: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"[Embeddings] Network error: {e}")

    # Fallback if API fails or key is missing
    return [_hashed_vector(t) for t in texts]

def get_embedding(text: str) -> List[float]:
    """Generates embedding vector for a single input text."""
    return get_embeddings([text])[0]

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two vectors."""
    if len(v1) != len(v2) or not v1:
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    if n1 > 0 and n2 > 0:
        return dot / (n1 * n2)
    return 0.0
