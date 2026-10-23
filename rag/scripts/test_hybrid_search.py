
import json
import re
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
INDEX_DIR = PROCESSED / "embeddings"

MODEL_NAME = "intfloat/multilingual-e5-small"
TOP_K = 10

QUERY = "Quelle loi fixe le statut de l'auto-entrepreneur en Algérie ?"


def tokenize(text):
    """Normalise le texte et extrait des mots comparables."""
    return set(
        re.findall(
            r"[a-zà-ÿ0-9]+",
            text.lower().replace("’", "'").replace("'", " "),
        )
    )


def main():
    vectors = np.load(INDEX_DIR / "vectors.npy")

    with open(INDEX_DIR / "metadata.json", encoding="utf-8") as f:
        metadata = json.load(f)

    if len(vectors) != len(metadata):
        raise ValueError("Le nombre de vecteurs et de métadonnées diffère.")

    model = SentenceTransformer(MODEL_NAME, device="cpu")
    model.max_seq_length = 512

    query_vector = model.encode(
        "query: " + QUERY,
        normalize_embeddings=True,
        convert_to_numpy=True,
    ).astype(np.float32)

    semantic_scores = vectors @ query_vector

    query_terms = tokenize(QUERY)
    stopwords = {
        "quelle", "quel", "quels", "quelles", "de", "du", "des",
        "la", "le", "les", "un", "une", "en", "a", "au", "aux",
        "et", "pour", "par", "sur", "dans", "l",
    }
    query_terms -= stopwords

    lexical_scores = []

    for item in metadata:
        # On utilise le texte de l'article, pas le titre répété du document.
        article_terms = tokenize(item.get("text", ""))
        matches = query_terms & article_terms

        score = len(matches) / max(len(query_terms), 1)
        lexical_scores.append((score, sorted(matches)))

    lexical_values = np.array(
        [score for score, _ in lexical_scores],
        dtype=np.float32,
    )

    # Première expérience : combinaison simple, à évaluer et non à considérer
    # comme une formule définitive.
    hybrid_scores = 0.7 * semantic_scores + 0.3 * lexical_values

    ranked = np.argsort(hybrid_scores)[::-1][:TOP_K]

    print(f"\nQuestion : {QUERY}")
    print(f"Termes retenus : {sorted(query_terms)}")
    print(f"Nombre de chunks : {len(metadata)}")
    print(f"Top {TOP_K} — recherche hybride\n")

    for rank, idx in enumerate(ranked, start=1):
        item = metadata[int(idx)]
        lexical_score, matches = lexical_scores[int(idx)]

        print("=" * 75)
        print(f"Rang : {rank}")
        print(f"Score hybride : {hybrid_scores[idx]:.4f}")
        print(f"Score sémantique : {semantic_scores[idx]:.4f}")
        print(f"Score lexical : {lexical_score:.4f}")
        print(f"Mots retrouvés : {matches}")
        print(f"Document : {item.get('document_id')}")
        print(f"Titre : {item.get('title')}")
        print(f"Article : {item.get('article_number')}")
        print(f"Chunk : {item.get('chunk_id')}")
        print(f"Texte : {item.get('text', '')[:700]}")
        print()


if __name__ == "__main__":
    main()
