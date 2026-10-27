
import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer


ROOT = Path(__file__).resolve().parents[2]
CHUNKS_PATH = ROOT / "rag" / "data" / "processed" / "chunks.json"
OUTPUT_DIR = ROOT / "rag" / "data" / "processed" / "embeddings"

MODEL_NAME = "intfloat/multilingual-e5-small"
BATCH_SIZE = 8


def main():
    if not CHUNKS_PATH.exists():
        raise FileNotFoundError(f"Fichier introuvable : {CHUNKS_PATH}")

    with CHUNKS_PATH.open("r", encoding="utf-8") as file:
        chunks = json.load(file)

    if not isinstance(chunks, list):
        raise ValueError("chunks.json doit contenir une liste.")

    indexable_chunks = [
        chunk for chunk in chunks
        if chunk.get("index") is True
    ]

    if not indexable_chunks:
        raise ValueError("Aucun chunk indexable.")

    for chunk in indexable_chunks:
        if not chunk.get("chunk_id"):
            raise ValueError("Un chunk indexable n'a pas de chunk_id.")
        if not isinstance(chunk.get("embedding_text"), str):
            raise ValueError(
                f"embedding_text absent ou invalide : {chunk.get('chunk_id')}"
            )
        if not chunk["embedding_text"].strip():
            raise ValueError(
                f"embedding_text vide : {chunk.get('chunk_id')}"
            )

    chunk_ids = [chunk["chunk_id"] for chunk in indexable_chunks]
    if len(chunk_ids) != len(set(chunk_ids)):
        raise ValueError("Des chunk_id sont dupliqués.")

    print(f"Chunks chargés : {len(chunks)}")
    print(f"Chunks à encoder : {len(indexable_chunks)}")
    print(f"Modèle : {MODEL_NAME}")
    print(f"Batch size : {BATCH_SIZE}")
    print("Chargement du modèle...")

    model = SentenceTransformer(
        MODEL_NAME,
        device="cpu",
    )

    model.max_seq_length = 512

    texts = [
        "passage: " + chunk["embedding_text"]
        for chunk in indexable_chunks
    ]

    print("Génération des embeddings...")

    embeddings = model.encode(
        texts,
        batch_size=BATCH_SIZE,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    embeddings = np.asarray(embeddings, dtype=np.float32)

    if embeddings.shape != (len(indexable_chunks), 384):
        raise ValueError(
            f"Dimensions inattendues : {embeddings.shape}"
        )

    if not np.isfinite(embeddings).all():
        raise ValueError("Les embeddings contiennent des valeurs non finies.")

    norms = np.linalg.norm(embeddings, axis=1)
    if not np.allclose(norms, 1.0, atol=1e-4):
        raise ValueError("Certains embeddings ne sont pas normalisés.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    metadata = [
        {
            key: chunk.get(key)
            for key in (
                "chunk_id",
                "document_id",
                "document_number",
                "title",
                "source_file",
                "source_pages",
                "language",
                "type",
                "article_number",
                "section",
                "chapter",
                "part",
                "article_label",
                "text",
                "embedding_text",
                "review_status",
                "segmentation_status",
            )
            if key in chunk
        }
        for chunk in indexable_chunks
    ]

    np.save(OUTPUT_DIR / "vectors.npy", embeddings)

    with (OUTPUT_DIR / "metadata.json").open(
        "w", encoding="utf-8"
    ) as file:
        json.dump(metadata, file, ensure_ascii=False, indent=2)

    info = {
        "model": MODEL_NAME,
        "dimensions": int(embeddings.shape[1]),
        "count": int(embeddings.shape[0]),
        "batch_size": BATCH_SIZE,
        "normalized": True,
        "source": "rag/data/processed/chunks.json",
    }

    with (OUTPUT_DIR / "index_info.json").open(
        "w", encoding="utf-8"
    ) as file:
        json.dump(info, file, ensure_ascii=False, indent=2)

    print("\nIndex créé avec succès.")
    print(f"Dimensions : {embeddings.shape}")
    print(f"Norme moyenne : {norms.mean():.6f}")
    print(f"Dossier de sortie : {OUTPUT_DIR}")
    print("Fichiers : vectors.npy, metadata.json, index_info.json")


if __name__ == "__main__":
    main()
