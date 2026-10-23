
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHUNKS_PATH = ROOT / "data" / "processed" / "chunks.json"


def normalize(text):
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )
    return re.findall(r"[a-z0-9]+", text)


with CHUNKS_PATH.open("r", encoding="utf-8") as file:
    chunks = json.load(file)

# Ne conserver que les chunks destinés à l'index.
chunks = [chunk for chunk in chunks if chunk.get("index") is True]

# Construire un catalogue des documents uniques.
documents = {}

for chunk in chunks:
    document_id = chunk["document_id"]

    if document_id not in documents:
        documents[document_id] = {
            "title": chunk.get("title", ""),
            "document_number": chunk.get("document_number", ""),
            "document_type": chunk.get("type", ""),
            "chunks": [],
        }

    documents[document_id]["chunks"].append(chunk)

queries = [
    "Quelle loi fixe le statut de l'auto-entrepreneur en Algérie ?",
    "Quelles activités sont autorisées pour un auto-entrepreneur ?",
    "Quel est le modèle de la carte de l'auto-entrepreneur ?",
]

print(f"Documents uniques : {len(documents)}")
print()

for query in queries:
    query_tokens = set(normalize(query))
    scores = []

    for document_id, document in documents.items():
        # Recherche dans le titre du document.
        title_tokens = set(normalize(document["title"]))
        title_score = len(query_tokens & title_tokens)

        # Recherche complémentaire dans le texte des articles.
        article_tokens = set()
        for chunk in document["chunks"]:
            article_tokens.update(normalize(chunk.get("text", "")))

        article_score = len(query_tokens & article_tokens)

        # Le titre est prioritaire pour identifier un document.
        score = 3 * title_score + article_score

        scores.append({
            "document_id": document_id,
            "title": document["title"],
            "title_score": title_score,
            "article_score": article_score,
            "score": score,
        })

    scores.sort(key=lambda item: item["score"], reverse=True)

    print("=" * 80)
    print(f"QUESTION : {query}")
    print("-" * 80)

    for rank, result in enumerate(scores, start=1):
        print(
            f"{rank}. {result['document_id']} | "
            f"score={result['score']} | "
            f"titre={result['title_score']} | "
            f"texte={result['article_score']}"
        )
        print(f"   {result['title']}")

    print()
