
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
TOP_DOCUMENTS = 2
TOP_CHUNKS = 10
RRF_K = 60

TESTS = [
    {
        "question": "Quelle loi fixe le statut de l'auto-entrepreneur en Algérie ?",
        "target_docs": {"JORADP-2022-085"},
        "target_chunks": {"JORADP-2022-085:art-1"},
    },
    {
        "question": "Quelles activités sont autorisées pour un auto-entrepreneur ?",
        "target_docs": {"JORADP-2023-197"},
        "target_chunks": {
            "JORADP-2023-197:art-2",
            "JORADP-2023-197:art-4",
            "JORADP-2023-197:art-7",
        },
    },
    {
        "question": "Quel est le modèle de la carte de l'auto-entrepreneur ?",
        "target_docs": {"JORADP-2023-198"},
        "target_chunks": {
            "JORADP-2023-198:art-2",
            "JORADP-2023-198:art-3",
        },
    },
]


def tokenize(text):
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )
    return re.findall(r"[a-z0-9]+", text)


def main():
    with (DATA_DIR / "chunks.json").open(encoding="utf-8") as f:
        chunks = [c for c in json.load(f) if c.get("index") is True]

    with (INDEX_DIR / "metadata.json").open(encoding="utf-8") as f:
        metadata = json.load(f)

    vectors = np.load(INDEX_DIR / "vectors.npy")

    if len(metadata) != len(vectors) or len(metadata) != len(chunks):
        raise ValueError("Chunks, métadonnées et vecteurs ont des tailles différentes.")

    chunk_ids = [c["chunk_id"] for c in chunks]
    metadata_ids = [m["chunk_id"] for m in metadata]

    if chunk_ids != metadata_ids:
        raise ValueError("Les chunks et les métadonnées ne sont pas alignés.")

    if len(set(metadata_ids)) != len(metadata_ids):
        raise ValueError("Des chunk_id sont dupliqués.")

    documents = {}
    for chunk in chunks:
        doc_id = chunk["document_id"]
        documents.setdefault(
            doc_id,
            {"title": chunk.get("title", ""), "chunks": []}
        )["chunks"].append(chunk)

    doc_ids = list(documents)
    doc_texts = [
        documents[doc_id]["title"] + " " +
        documents[doc_id]["title"] + " " +
        " ".join(c.get("text", "") for c in documents[doc_id]["chunks"])
        for doc_id in doc_ids
    ]

    document_bm25 = BM25Okapi([tokenize(t) for t in doc_texts])
    chunk_bm25 = BM25Okapi([tokenize(m.get("text", "")) for m in metadata])

    print("Chargement du modèle...")
    model = SentenceTransformer(MODEL_NAME, device="cpu")

    summary = []

    for test in TESTS:
        question = test["question"]
        query_tokens = tokenize(question)

        doc_scores = document_bm25.get_scores(query_tokens)
        doc_order = np.argsort(doc_scores)[::-1]
        selected_doc_ids = [doc_ids[i] for i in doc_order[:TOP_DOCUMENTS]]

        query_vector = model.encode(
            ["query: " + question],
            normalize_embeddings=True,
            convert_to_numpy=True,
        )[0]

        vector_scores = vectors @ query_vector
        lexical_scores = chunk_bm25.get_scores(query_tokens)

        candidates = [
            i for i, item in enumerate(metadata)
            if item["document_id"] in selected_doc_ids
        ]

        vector_order = sorted(
            candidates, key=lambda i: vector_scores[i], reverse=True
        )
        lexical_order = sorted(
            candidates, key=lambda i: lexical_scores[i], reverse=True
        )

        vector_rank = {idx: rank for rank, idx in enumerate(vector_order, 1)}
        lexical_rank = {idx: rank for rank, idx in enumerate(lexical_order, 1)}

        rrf = {
            idx: (
                1 / (RRF_K + vector_rank[idx])
                + 1 / (RRF_K + lexical_rank[idx])
            )
            for idx in candidates
        }

        ranking = sorted(candidates, key=lambda i: rrf[i], reverse=True)
        ranked_ids = [metadata[i]["chunk_id"] for i in ranking]
        top_ids = ranked_ids[:TOP_CHUNKS]

        target_chunk_ranks = {
            target: ranked_ids.index(target) + 1 if target in ranked_ids else None
            for target in test["target_chunks"]
        }

        retrieved_targets = [
            target for target in test["target_chunks"] if target in top_ids
        ]

        selected_target_docs = (
            test["target_docs"] & set(selected_doc_ids)
        )

        print("\n" + "=" * 80)
        print("QUESTION :", question)
        print("Documents sélectionnés :", selected_doc_ids)
        print(
            "Document cible récupéré :",
            bool(selected_target_docs),
        )
        print("Rangs des articles cibles :", target_chunk_ranks)
        print(
            f"Articles cibles dans le Top {TOP_CHUNKS} : "
            f"{len(retrieved_targets)}/{len(test['target_chunks'])}"
        )
        print("Top résultats :")

        for rank, idx in enumerate(ranking[:TOP_CHUNKS], start=1):
            item = metadata[idx]
            marker = " <-- CIBLE" if item["chunk_id"] in test["target_chunks"] else ""
            print(
                f"{rank:2}. {item['chunk_id']} "
                f"| RRF={rrf[idx]:.5f}{marker}"
            )

        summary.append({
            "question": question,
            "document_ok": bool(selected_target_docs),
            "targets_found": len(retrieved_targets),
            "targets_total": len(test["target_chunks"]),
        })

    print("\n" + "=" * 80)
    print("BILAN")
    for item in summary:
        print(
            f"- Documents corrects : {item['document_ok']} | "
            f"Articles retrouvés : {item['targets_found']}/"
            f"{item['targets_total']} | {item['question']}"
        )

    print("\nÉvaluation terminée. Aucun fichier d'index n'a été modifié.")


if __name__ == "__main__":
    main()
