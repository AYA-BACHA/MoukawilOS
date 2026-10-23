
import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

BASE = Path("rag/data/processed")
QUERY = "Quelles activités sont autorisées pour un auto-entrepreneur ?"
TARGETS = {
    "JORADP-2023-197:art-2",
    "JORADP-2023-197:art-4",
    "JORADP-2023-197:art-7",
}

with (BASE / "embeddings" / "metadata.json").open(
    encoding="utf-8"
) as f:
    metadata = json.load(f)

vectors = np.load(BASE / "embeddings" / "vectors.npy")

assert len(metadata) == len(vectors)

model = SentenceTransformer("intfloat/multilingual-e5-small", device="cpu")
query_vector = model.encode(
    ["query: " + QUERY],
    normalize_embeddings=True,
    convert_to_numpy=True,
)[0]

# Recherche vectorielle parmi les articles du décret 23-197 uniquement.
indices = [
    i for i, item in enumerate(metadata)
    if item["document_id"] == "JORADP-2023-197"
]

scores = vectors[indices] @ query_vector
order = np.argsort(-scores)

print("Question :", QUERY)
print("\nClassement vectoriel dans le décret 23-197 :")

for rank, local_index in enumerate(order, start=1):
    global_index = indices[int(local_index)]
    item = metadata[global_index]
    marker = "  <-- CIBLE" if item["chunk_id"] in TARGETS else ""

    print(
        f"{rank:2}. {item['chunk_id']} "
        f"| score={scores[int(local_index)]:.4f}{marker}"
    )
    if rank == 10:
        break
