
import json
import re
import unicodedata
from pathlib import Path

import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer


ROOT = Path(__file__).resolve().parents[1]
INDEX_DIR = ROOT / "data" / "processed" / "embeddings"

MODEL_NAME = "intfloat/multilingual-e5-small"
TOP_K = 5
RRF_K = 60

TESTS = [
    {
        "question": "Quelle loi fixe le statut de l'auto-entrepreneur en Algérie ?",
        "targets": {"JORADP-2022-085:art-1"},
    },
    {
        "question": "Quelles activités sont autorisées pour un auto-entrepreneur ?",
        "targets": {
            "JORADP-2023-197:art-2",
            "JORADP-2023-197:art-4",
            "JORADP-2023-197:art-7",
        },
    },
    {
        "question": "Quel est le modèle de la carte de l'auto-entrepreneur ?",
        "targets": {
            "JORADP-2023-198:art-2",
            "JORADP-2023-198:art-3",
        },
    },
]


def tokenize(text):
    """Normalise les accents, la casse et les séparateurs."""
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )
    return re.findall(r"[a-z0-9]+", text)


def main():
    vectors = np.load(INDEX_DIR / "vectors.npy")

    with open(INDEX_DIR / "metadata.json", encoding="utf-8") as f:
        metadata = json.load(f)

    if len(vectors) != len(metadata):
        raise ValueError("Nombre de vecteurs différent des métadonnées.")

    ids = [item["chunk_id"] for item in metadata]

    if len(ids) != len(set(ids)):
        raise ValueError("Des chunk_id sont dupliqués.")

    # BM25 porte sur le texte juridique, sans répéter le titre
    # du document dans chacun des articles.
    corpus_tokens = [
        tokenize(item.get("text", ""))
        for item in metadata
    ]
    bm25 = BM25Okapi(corpus_tokens)

    model = SentenceTransformer(MODEL_NAME, device="cpu")
    model.max_seq_length = 512

    for test in TESTS:
        question = test["question"]
        targets = test["targets"]

        query_vector = model.encode(
            "query: " + question,
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).astype(np.float32)

        semantic_scores = vectors @ query_vector
        lexical_scores = bm25.get_scores(tokenize(question))

        semantic_order = np.argsort(-semantic_scores, kind="stable")
        lexical_order = np.argsort(-lexical_scores, kind="stable")

        # Reciprocal Rank Fusion : combine les rangs plutôt que
        # d'additionner directement des scores de nature différente.
        semantic_ranks = np.empty(len(metadata), dtype=int)
        lexical_ranks = np.empty(len(metadata), dtype=int)

        semantic_ranks[semantic_order] = np.arange(1, len(metadata) + 1)
        lexical_ranks[lexical_order] = np.arange(1, len(metadata) + 1)

        hybrid_scores = (
            1 / (RRF_K + semantic_ranks)
            + 1 / (RRF_K + lexical_ranks)
        )
        hybrid_order = np.argsort(-hybrid_scores, kind="stable")

        rankings = {
            "VECTORIEL": semantic_order,
            "BM25": lexical_order,
            "HYBRIDE (RRF)": hybrid_order,
        }

        print("\n" + "#" * 85)
        print(f"QUESTION : {question}")
        print(f"Cible(s) d'évaluation : {sorted(targets)}")

        for method, order in rankings.items():
            target_ranks = [
                rank
                for rank, idx in enumerate(order, start=1)
                if ids[idx] in targets
            ]

            best_target_rank = min(target_ranks, default=None)

            print(f"\n--- {method} ---")
            print(
                "Rang de la première cible pertinente : "
                f"{best_target_rank if best_target_rank is not None else 'hors index'}"
            )

            for rank, idx in enumerate(order[:TOP_K], start=1):
                item = metadata[int(idx)]
                print(
                    f"{rank}. {item.get('chunk_id')} | "
                    f"score vectoriel={semantic_scores[idx]:.4f} | "
                    f"score BM25={lexical_scores[idx]:.4f}"
                )
                print(f"   Titre : {item.get('title')}")
                print(f"   Texte : {item.get('text', '')[:220]}")

    print("\nComparaison terminée. Aucun fichier d'index n'a été modifié.")


if __name__ == "__main__":
    main()

