
import json
import re
import unicodedata
from pathlib import Path

from rank_bm25 import BM25Okapi

BASE = Path("rag/data/processed")
QUERY = "Quelles activités sont autorisées pour un auto-entrepreneur ?"
TARGET = "JORADP-2023-197:art-4"

with (BASE / "embeddings" / "metadata.json").open(
    encoding="utf-8"
) as f:
    metadata = json.load(f)


def tokenize(text):
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(
        char for char in text
        if unicodedata.category(char) != "Mn"
    )
    return re.findall(r"[a-z0-9]+", text)


# Comparaison entre texte seul et contexte juridique enrichi.
texts_only = [item["text"] for item in metadata]

texts_with_context = [
    " ".join(
        str(item.get(field) or "")
        for field in [
            "title",
            "document_number",
            "article_label",
            "section",
            "chapter",
            "part",
            "text",
        ]
    )
    for item in metadata
]

query_tokens = tokenize(QUERY)
target_index = next(
    i for i, item in enumerate(metadata)
    if item["chunk_id"] == TARGET
)


def evaluate(name, documents):
    bm25 = BM25Okapi([tokenize(text) for text in documents])
    scores = bm25.get_scores(query_tokens)
    order = scores.argsort()[::-1]
    rank = list(order).index(target_index) + 1

    print(f"\n{name}")
    print(f"Rang de l'article 4 : {rank}/{len(metadata)}")
    print("Top 10 :")

    for position, index in enumerate(order[:10], start=1):
        item = metadata[index]
        print(
            f"{position:2}. {item['chunk_id']} "
            f"| score={scores[index]:.4f}"
        )


evaluate("BM25 — TEXTE SEUL", texts_only)
evaluate("BM25 — CONTEXTE JURIDIQUE", texts_with_context)
