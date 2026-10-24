
import json
import re
import unicodedata
from pathlib import Path

import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "processed"
INDEX_DIR = DATA_DIR / "embeddings"

MODEL_NAME = "intfloat/multilingual-e5-small"
DOCUMENT_ID = "JORADP-2023-197"
QUESTION = "Quelles activités sont autorisées pour un auto-entrepreneur ?"
TARGETS = {
    "JORADP-2023-197:art-2",
    "JORADP-2023-197:art-4",
    "JORADP-2023-197:art-7",
}
RRF_K = 60
TOP_K = 10


def tokenize(text):
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )
    return re.findall(r"[a-z0-9]+", text)


def print_ranking(name, order, metadata, scores=None):
    print(f"\n--- {name} ---")

    ranks = {
        int(idx): rank
        for rank, idx in enumerate(order, start=1)
    }

    for rank, idx in enumerate(order[:TOP_K], start=1):
        item = metadata[int(idx)]
        marker = " <-- CIBLE" if item["chunk_id"] in TARGETS else ""
        score_text = (
            f" | score={scores[int(idx)]:.4f}"
            if scores is not None else ""
        )
        print(f"{rank:2}. {item['chunk_id']}{score_text}{marker}")

    print("Rangs des articles attendus :")
    for idx, item in enumerate(metadata):
        if item["chunk_id"] in TARGETS:
            print(f"  {item['chunk_id']} : rang {ranks[idx]}")


def main():
    with (INDEX_DIR / "metadata.json").open(encoding="utf-8") as f:
        all_metadata = json.load(f)

    vectors = np.load(INDEX_DIR / "vectors.npy")

    if len(all_metadata) != len(vectors):
        raise ValueError("Nombre de métadonnées et de vecteurs différent.")

    if len({item["chunk_id"] for item in all_metadata}) != len(all_metadata):
        raise ValueError("Des chunk_id sont dupliqués.")

    indices = [
        i for i, item in enumerate(all_metadata)
        if item["document_id"] == DOCUMENT_ID
    ]

    metadata = [all_metadata[i] for i in indices]
    document_vectors = vectors[indices]

    if not TARGETS.issubset({item["chunk_id"] for item in metadata}):
        raise ValueError("Un ou plusieurs articles cibles sont absents.")

    model = SentenceTransformer(MODEL_NAME, device="cpu")
    query_vector = model.encode(
        ["query: " + QUESTION],
        normalize_embeddings=True,
        convert_to_numpy=True,
    )[0]

    vector_scores = document_vectors @ query_vector
    vector_order = np.argsort(-vector_scores)

    bm25 = BM25Okapi([
        tokenize(item.get("text", ""))
        for item in metadata
    ])
    bm25_scores = bm25.get_scores(tokenize(QUESTION))
    bm25_order = np.argsort(-bm25_scores)

    vector_ranks = {
        int(idx): rank
        for rank, idx in enumerate(vector_order, start=1)
    }
    bm25_ranks = {
        int(idx): rank
        for rank, idx in enumerate(bm25_order, start=1)
    }

    rrf_scores = {
        idx: (
            1 / (RRF_K + vector_ranks[idx])
            + 1 / (RRF_K + bm25_ranks[idx])
        )
        for idx in range(len(metadata))
    }
    rrf_order = sorted(
        range(len(metadata)),
        key=lambda idx: rrf_scores[idx],
        reverse=True,
    )

    print("Question :", QUESTION)
    print("Document :", DOCUMENT_ID)
    print("Nombre de chunks :", len(metadata))

    print_ranking(
        "VECTORIEL SEUL",
        vector_order,
        metadata,
        vector_scores,
    )
    print_ranking(
        "BM25 SEUL",
        bm25_order,
        metadata,
        bm25_scores,
    )
    print_ranking(
        "HYBRIDE RRF",
        rrf_order,
        metadata,
        rrf_scores,
    )

    print("\nAucun fichier du corpus ou de l'index n'a été modifié.")


if __name__ == "__main__":
    main()
