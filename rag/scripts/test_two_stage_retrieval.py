
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

CHUNKS_PATH = DATA_DIR / "chunks.json"
VECTORS_PATH = INDEX_DIR / "vectors.npy"
METADATA_PATH = INDEX_DIR / "metadata.json"

MODEL_NAME = "intfloat/multilingual-e5-small"
TOP_DOCUMENTS = 2
TOP_CHUNKS = 10


def tokenize(text):
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )
    return re.findall(r"[a-z0-9]+", text)


def main():
    with CHUNKS_PATH.open("r", encoding="utf-8") as f:
        chunks = json.load(f)

    chunks = [c for c in chunks if c.get("index") is True]

    with METADATA_PATH.open("r", encoding="utf-8") as f:
        metadata = json.load(f)

    vectors = np.load(VECTORS_PATH)

    if len(metadata) != len(vectors):
        raise ValueError("Le nombre de vecteurs et de métadonnées diffère.")

    if [c["chunk_id"] for c in metadata] != [
        c["chunk_id"] for c in chunks
    ]:
        raise ValueError(
            "L'ordre des chunks diffère de celui des métadonnées."
        )

    # Regrouper les chunks par document.
    documents = {}

    for chunk in chunks:
        doc_id = chunk["document_id"]

        if doc_id not in documents:
            documents[doc_id] = {
                "title": chunk.get("title", ""),
                "chunks": [],
            }

        documents[doc_id]["chunks"].append(chunk)

    # Recherche documentaire lexicale.
    doc_ids = list(documents.keys())
    doc_texts = []

    for doc_id in doc_ids:
        doc = documents[doc_id]
        full_text = " ".join(
            chunk.get("text", "") for chunk in doc["chunks"]
        )
        doc_texts.append(
            doc["title"] + " " + doc["title"] + " " + full_text
        )

    doc_tokens = [tokenize(text) for text in doc_texts]
    document_bm25 = BM25Okapi(doc_tokens)

    # BM25 sur les chunks.
    chunk_tokens = [tokenize(c.get("text", "")) for c in metadata]
    chunk_bm25 = BM25Okapi(chunk_tokens)

    print("Chargement du modèle d'embeddings...")
    model = SentenceTransformer(MODEL_NAME, device="cpu")

    questions = [
        "Quelle loi fixe le statut de l'auto-entrepreneur en Algérie ?",
        "Quelles activités sont autorisées pour un auto-entrepreneur ?",
        "Quel est le modèle de la carte de l'auto-entrepreneur ?",
    ]

    for question in questions:
        print("\n" + "=" * 90)
        print("QUESTION :", question)

        query_tokens = tokenize(question)
        doc_scores = document_bm25.get_scores(query_tokens)
        doc_ranking = np.argsort(doc_scores)[::-1]

        candidate_ids = [
            doc_ids[i] for i in doc_ranking[:TOP_DOCUMENTS]
        ]

        print("\nÉTAPE 1 — DOCUMENTS SÉLECTIONNÉS")

        for rank, i in enumerate(doc_ranking[:TOP_DOCUMENTS], start=1):
            doc_id = doc_ids[i]
            print(
                f"{rank}. {doc_id} | "
                f"BM25={doc_scores[i]:.4f}"
            )
            print(f"   {documents[doc_id]['title']}")

        # Limiter les chunks aux documents sélectionnés.
        candidate_indices = [
            i for i, chunk in enumerate(metadata)
            if chunk["document_id"] in candidate_ids
        ]

        query_vector = model.encode(
            ["query: " + question],
            normalize_embeddings=True,
            convert_to_numpy=True,
        )[0]

        vector_scores = vectors @ query_vector
        lexical_scores = chunk_bm25.get_scores(query_tokens)

        # Fusion des classements, limitée aux documents candidats.
        candidate_vector_order = sorted(
            candidate_indices,
            key=lambda i: vector_scores[i],
            reverse=True,
        )
        candidate_lexical_order = sorted(
            candidate_indices,
            key=lambda i: lexical_scores[i],
            reverse=True,
        )

        vector_ranks = {
            idx: rank
            for rank, idx in enumerate(candidate_vector_order, start=1)
        }
        lexical_ranks = {
            idx: rank
            for rank, idx in enumerate(candidate_lexical_order, start=1)
        }

        # Reciprocal Rank Fusion (RRF).
        rrf_scores = {
            idx: (
                1 / (60 + vector_ranks[idx])
                + 1 / (60 + lexical_ranks[idx])
            )
            for idx in candidate_indices
        }

        ranking = sorted(
            candidate_indices,
            key=lambda i: rrf_scores[i],
            reverse=True,
        )

        print("\nÉTAPE 2 — TOP CHUNKS DANS LES DOCUMENTS SÉLECTIONNÉS")

        for rank, idx in enumerate(ranking[:TOP_CHUNKS], start=1):
            item = metadata[idx]
            text = " ".join(item.get("text", "").split())
            snippet = text[:450]

            print(
                f"\n{rank}. {item['chunk_id']} | "
                f"doc={item['document_id']} | "
                f"article={item.get('article_number')} | "
                f"RRF={rrf_scores[idx]:.5f} | "
                f"vector={vector_scores[idx]:.4f} | "
                f"BM25={lexical_scores[idx]:.4f}"
            )
            print(f"   {snippet}")

    print("\nTest terminé. Aucun fichier d'index n'a été modifié.")


if __name__ == "__main__":
    main()
