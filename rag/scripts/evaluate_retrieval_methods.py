import json
import re
import unicodedata
from pathlib import Path

import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer


ROOT = Path(__file__).resolve().parents[1]
INDEX_DIR = ROOT / "data" / "processed" / "embeddings"
EVAL_FILE = ROOT / "data" / "processed" / "retrieval_eval.json"

MODEL_NAME = "intfloat/multilingual-e5-small"
TOP_K = 5
RRF_K = 60


def tokenize(text):
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )
    return re.findall(r"[a-z0-9]+", text)


def reciprocal_rank(rank):
    return 1.0 / rank if rank is not None else 0.0


def load_evaluation_questions(indexed_ids):
    with EVAL_FILE.open("r", encoding="utf-8-sig") as f:
        tests = json.load(f)

    if not isinstance(tests, list) or not tests:
        raise ValueError("Evaluation JSON must contain a non-empty list.")

    question_ids = set()

    for test in tests:
        required = {"id", "question", "targets"}
        if not required.issubset(test):
            raise ValueError(
                f"Question entry is missing fields: {test}"
            )

        qid = test["id"]
        question = test["question"]
        targets = test["targets"]

        if not isinstance(qid, str) or not qid.strip():
            raise ValueError(f"Invalid question ID: {qid}")

        if qid in question_ids:
            raise ValueError(f"Duplicate question ID: {qid}")
        question_ids.add(qid)

        if not isinstance(question, str) or not question.strip():
            raise ValueError(f"Empty question text: {qid}")

        if not isinstance(targets, list) or not targets:
            raise ValueError(f"No target articles defined for {qid}")

        missing = set(targets) - indexed_ids
        if missing:
            raise ValueError(
                f"{qid}: target IDs missing from index: "
                f"{sorted(missing)}"
            )

    return tests


def main():
    vectors_path = INDEX_DIR / "vectors.npy"
    metadata_path = INDEX_DIR / "metadata.json"

    for path in (vectors_path, metadata_path, EVAL_FILE):
        if not path.exists():
            raise FileNotFoundError(f"Required file not found: {path}")

    vectors = np.load(vectors_path)

    with metadata_path.open("r", encoding="utf-8-sig") as f:
        metadata = json.load(f)

    if len(vectors) != len(metadata):
        raise ValueError("Vector count does not match metadata count.")

    if vectors.ndim != 2:
        raise ValueError("Vectors must be a 2D array.")

    ids = [item.get("chunk_id") for item in metadata]

    if any(not chunk_id for chunk_id in ids):
        raise ValueError("Some metadata entries have no chunk_id.")

    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate chunk IDs found.")

    indexed_ids = set(ids)
    tests = load_evaluation_questions(indexed_ids)

    print(f"Index chunks: {len(metadata)}")
    print(f"Evaluation questions: {len(tests)}")
    print(f"Top K: {TOP_K}")
    print(f"Evaluation file: {EVAL_FILE.name}")

    corpus_tokens = [
        tokenize(item.get("text", ""))
        for item in metadata
    ]
    bm25 = BM25Okapi(corpus_tokens)

    print("\nLoading embedding model on CPU...")
    model = SentenceTransformer(MODEL_NAME, device="cpu")

    methods = ["VECTOR", "BM25", "HYBRID_RRF"]
    metric_rows = {method: [] for method in methods}

    for test in tests:
        question = test["question"]
        targets = set(test["targets"])
        qid = test["id"]

        query_vector = model.encode(
            ["query: " + question],
            normalize_embeddings=True,
            convert_to_numpy=True,
        )[0]

        if query_vector.shape[0] != vectors.shape[1]:
            raise ValueError(
                "Query embedding dimension does not match index vectors."
            )

        vector_scores = vectors @ query_vector
        bm25_scores = bm25.get_scores(tokenize(question))

        vector_order = np.argsort(-vector_scores, kind="stable")
        bm25_order = np.argsort(-bm25_scores, kind="stable")

        vector_ranks = np.empty(len(metadata), dtype=int)
        bm25_ranks = np.empty(len(metadata), dtype=int)

        vector_ranks[vector_order] = np.arange(1, len(metadata) + 1)
        bm25_ranks[bm25_order] = np.arange(1, len(metadata) + 1)

        rrf_scores = (
            1.0 / (RRF_K + vector_ranks)
            + 1.0 / (RRF_K + bm25_ranks)
        )
        hybrid_order = np.argsort(-rrf_scores, kind="stable")

        rankings = {
            "VECTOR": vector_order,
            "BM25": bm25_order,
            "HYBRID_RRF": hybrid_order,
        }

        print("\n" + "=" * 90)
        print(f"{qid} [{test.get('category', 'uncategorized')}]")
        print("QUESTION:", question)
        print("TARGETS:", ", ".join(sorted(targets)))

        for method, order in rankings.items():
            ranked_ids = [ids[int(i)] for i in order]

            target_ranks = [
                ranked_ids.index(target) + 1
                for target in targets
            ]

            first_rank = min(target_ranks, default=None)
            hits_at_k = sum(
                chunk_id in targets
                for chunk_id in ranked_ids[:TOP_K]
            )
            recall_at_k = hits_at_k / len(targets)

            metric_rows[method].append({
                "first_rank": first_rank,
                "recall_at_k": recall_at_k,
                "rr": reciprocal_rank(first_rank),
            })

            print(f"\n--- {method} ---")
            print("First relevant rank:", first_rank)
            print(f"Recall@{TOP_K}: {recall_at_k:.3f}")

            for rank, idx in enumerate(order[:TOP_K], start=1):
                item = metadata[int(idx)]
                chunk_id = item["chunk_id"]
                marker = " [TARGET]" if chunk_id in targets else ""

                print(
                    f"{rank}. {chunk_id}"
                    f" | vector={vector_scores[idx]:.4f}"
                    f" | BM25={bm25_scores[idx]:.4f}"
                    f"{marker}"
                )

    print("\n" + "#" * 90)
    print(
        f"AGGREGATE RESULTS — averages across {len(tests)} questions"
    )
    print(
        f"{'Method':<14}"
        f"{'Mean first rank':>18}"
        f"{'Recall@' + str(TOP_K):>14}"
        f"{'MRR':>12}"
    )

    for method in methods:
        rows = metric_rows[method]
        ranks = [
            row["first_rank"]
            for row in rows
            if row["first_rank"] is not None
        ]

        mean_rank = (
            sum(ranks) / len(ranks)
            if len(ranks) == len(rows)
            else float("nan")
        )
        mean_recall = sum(
            row["recall_at_k"] for row in rows
        ) / len(rows)
        mean_mrr = sum(
            row["rr"] for row in rows
        ) / len(rows)

        print(
            f"{method:<14}"
            f"{mean_rank:>18.2f}"
            f"{mean_recall:>14.3f}"
            f"{mean_mrr:>12.3f}"
        )

    print("\nEvaluation complete. No index files were modified.")
    print("Note: metrics depend on the correctness of the target labels.")


if __name__ == "__main__":
    main()
