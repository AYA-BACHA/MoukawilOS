
import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer


ROOT = Path(__file__).resolve().parents[2]
INDEX_DIR = ROOT / "rag" / "data" / "processed" / "embeddings"
MODEL_NAME = "intfloat/multilingual-e5-small"
TOP_K = 5


def load_index():
    vectors = np.load(INDEX_DIR / "vectors.npy")
    metadata = json.loads(
        (INDEX_DIR / "metadata.json").read_text(encoding="utf-8")
    )
    info = json.loads(
        (INDEX_DIR / "index_info.json").read_text(encoding="utf-8")
    )

    if info["model"] != MODEL_NAME:
        raise ValueError("Le modèle ne correspond pas à celui de l'index.")

    if vectors.shape != (len(metadata), info["dimensions"]):
        raise ValueError("Incohérence entre vecteurs et métadonnées.")

    if not np.isfinite(vectors).all():
        raise ValueError("L'index contient des valeurs non finies.")

    return vectors, metadata


def main():
    vectors, metadata = load_index()

    print(f"Index chargé : {len(metadata)} passages")
    print("Chargement du modèle...")
    model = SentenceTransformer(MODEL_NAME, device="cpu")

    while True:
        question = input(
            "\nPose une question juridique (ou 'exit' pour quitter) : "
        ).strip()

        if question.lower() in {"exit", "quit", "q"}:
            print("Fin de la recherche.")
            break

        if not question:
            continue

        query_vector = model.encode(
            ["query: " + question],
            convert_to_numpy=True,
            normalize_embeddings=True,
        )[0]

        scores = vectors @ query_vector
        top_indices = np.argsort(scores)[::-1][:TOP_K]

        print("\n=== Passages les plus pertinents ===")

        for rank, idx in enumerate(top_indices, start=1):
            item = metadata[int(idx)]
            score = float(scores[idx])

            print(f"\n--- Résultat {rank} | Score : {score:.4f} ---")
            print(f"Titre : {item.get('title', 'Non renseigné')}")
            print(f"Document : {item.get('document_number', 'Non renseigné')}")
            print(f"Article : {item.get('article_number', 'Non renseigné')}")
            print(f"Pages source : {item.get('source_pages', [])}")
            print(f"Chunk ID : {item.get('chunk_id', 'Non renseigné')}")
            print("\nExtrait juridique :")
            print(item.get("text", "")[:1200])


if __name__ == "__main__":
    main()
