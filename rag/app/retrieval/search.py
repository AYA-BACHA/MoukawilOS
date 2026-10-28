import json
from functools import lru_cache
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer


ROOT = Path(__file__).resolve().parents[3]
INDEX_DIR = ROOT / "rag" / "data" / "processed" / "embeddings"
MODEL_NAME = "intfloat/multilingual-e5-small"
DEFAULT_TOP_K = 5
MAX_TOP_K = 20


@lru_cache(maxsize=1)
def load_index():
    """Load and validate the saved vector index and metadata."""
    vectors = np.load(INDEX_DIR / "vectors.npy")
    metadata = json.loads(
        (INDEX_DIR / "metadata.json").read_text(encoding="utf-8")
    )
    info = json.loads(
        (INDEX_DIR / "index_info.json").read_text(encoding="utf-8")
    )

    if info.get("model") != MODEL_NAME:
        raise ValueError("The embedding model does not match the index.")

    if not isinstance(metadata, list):
        raise ValueError("Index metadata must be a list.")

    if vectors.ndim != 2 or vectors.shape != (
        len(metadata),
        info.get("dimensions"),
    ):
        raise ValueError("Inconsistency between vectors and metadata.")

    if info.get("count") != len(metadata):
        raise ValueError("The indexed count does not match the metadata.")

    if not np.isfinite(vectors).all():
        raise ValueError("The index contains non-finite values.")

    chunk_ids = [item.get("chunk_id") for item in metadata]
    if any(not chunk_id for chunk_id in chunk_ids):
        raise ValueError("Some metadata entries have no chunk ID.")

    if len(set(chunk_ids)) != len(chunk_ids):
        raise ValueError("Duplicate chunk IDs were found.")

    return vectors, metadata


@lru_cache(maxsize=1)
def load_model():
    """Load the embedding model once, using the CPU."""
    return SentenceTransformer(MODEL_NAME, device="cpu")


def search(question: str, top_k: int = DEFAULT_TOP_K) -> list[dict]:
    """Return the most relevant legal passages for a question."""
    if not isinstance(question, str) or not question.strip():
        raise ValueError("The question must not be empty.")

    if not isinstance(top_k, int) or isinstance(top_k, bool):
        raise ValueError("top_k must be an integer.")

    if not 1 <= top_k <= MAX_TOP_K:
        raise ValueError(f"top_k must be between 1 and {MAX_TOP_K}.")

    vectors, metadata = load_index()
    model = load_model()

    query_vector = model.encode(
        ["query: " + question.strip()],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )[0]

    scores = vectors @ query_vector
    top_indices = np.argsort(scores)[::-1][:top_k]

    results = []
    for idx in top_indices:
        item = metadata[int(idx)]
        results.append({
            "score": float(scores[idx]),
            "chunk_id": item.get("chunk_id"),
            "document_id": item.get("document_id"),
            "document_number": item.get("document_number"),
            "title": item.get("title"),
            "source_file": item.get("source_file"),
            "source_pages": item.get("source_pages", []),
            "language": item.get("language"),
            "type": item.get("type"),
            "article_number": item.get("article_number"),
            "article_label": item.get("article_label"),
            "review_status": item.get("review_status"),
            "segmentation_status": item.get("segmentation_status"),
            "text": item.get("text", ""),
        })

    return results
