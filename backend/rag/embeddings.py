import math
import re
from typing import List

try:
    from sentence_transformers import SentenceTransformer
    _ST_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    _ST_MODEL = None


def _hashed_vector(text: str, dim: int = 384) -> List[float]:
    """Fallback deterministic feature vectorizer for text when heavy model is absent."""
    vec = [0.0] * dim
    clean_text = text.lower()
    words = re.findall(r"\w+", clean_text)
    
    if not words:
        return vec

    for word in words:
        # Generate hash buckets for word and n-grams
        h1 = hash(word) % dim
        h2 = hash(word[::-1]) % dim
        vec[h1] += 1.0
        vec[h2] += 0.5

    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec


def get_embedding(text: str) -> List[float]:
    """Generates embedding vector for input text."""
    if _ST_MODEL:
        try:
            return _ST_MODEL.encode(text).tolist()
        except Exception:
            pass
    return _hashed_vector(text)


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Generates embedding vectors for list of texts."""
    if _ST_MODEL:
        try:
            return _ST_MODEL.encode(texts).tolist()
        except Exception:
            pass
    return [_hashed_vector(t) for t in texts]


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
