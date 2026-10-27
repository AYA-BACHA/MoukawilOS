
"""Migrate manifest.json to schema 1.1, preserving existing information.

Usage:
    python upgrade_manifest.py data/manifest.json data/raw
    python upgrade_manifest.py data/manifest.json
"""

import hashlib
import json
import sys
from pathlib import Path

LEGAL_NUMBERS = {
    "JORADP-2022-085": "22-23",
    "JORADP-2023-196": "23-196",
    "JORADP-2023-197": "23-197",
    "JORADP-2023-198": "23-198",
    "JORADP-AR-2025-040": "25-170",
}

PARENTS = {
    "JORADP-2023-196": "JORADP-2023-037",
    "JORADP-2023-197": "JORADP-2023-037",
    "JORADP-2023-198": "JORADP-2023-037",
}

OUT_OF_MVP = {"JORADP-AR-2025-040"}


def sha256(file_path: Path) -> str:
    """Return the SHA-256 hash of an existing file."""
    return hashlib.sha256(file_path.read_bytes()).hexdigest()


def main() -> None:
    if len(sys.argv) not in (2, 3):
        raise SystemExit(
            "Usage: python upgrade_manifest.py manifest.json [pdf_directory]"
        )

    manifest_path = Path(sys.argv[1])
    pdf_dir = Path(sys.argv[2]) if len(sys.argv) == 3 else None

    if not manifest_path.is_file():
        raise SystemExit(f"Manifest not found: {manifest_path}")

    data = json.loads(manifest_path.read_text(encoding="utf-8"))

    if not isinstance(data.get("documents"), list):
        raise SystemExit("Invalid manifest: 'documents' must be a list.")

    # Validate PDF availability before modifying the manifest.
    if pdf_dir is not None:
        if not pdf_dir.is_dir():
            raise SystemExit(f"PDF directory not found: {pdf_dir}")

        missing = [
            doc["filename"]
            for doc in data["documents"]
            if not (pdf_dir / doc["filename"]).is_file()
        ]

        if missing:
            raise SystemExit(
                "Migration stopped. Missing PDF files:\n"
                + "\n".join(f"- {name}" for name in missing)
            )

    for doc in data["documents"]:
        document_id = doc["document_id"]
        title = doc.get("title", "")
        is_gazette = title.startswith("Journal officiel")

        # Preserve the fact that the source is official separately
        # from the legal-content review status.
        if "verification_status" in doc:
            old_status = doc.pop("verification_status")
            doc.setdefault(
                "source_origin",
                "joradp_official"
                if old_status == "official_source_confirmed"
                else "pending_source_verification",
            )
        else:
            doc.setdefault("source_origin", "joradp_official")

        # Source provenance does not mean that the legal text was reviewed.
        doc.setdefault("review_status", "pending")

        doc["document_type"] = (
            "gazette_issue" if is_gazette else "legal_text"
        )

        # Do not erase existing relationships if no new mapping is defined.
        parent_id = PARENTS.get(document_id)
        if parent_id is not None:
            doc["parent_document_id"] = parent_id

        legal_number = LEGAL_NUMBERS.get(document_id)
        if legal_number is not None:
            doc["legal_text_number"] = legal_number

        # Preserve existing index decisions, except for explicit exclusions.
        if document_id in OUT_OF_MVP:
            doc["index"] = False
        else:
            doc.setdefault("index", True)

        # Preserve known page references; unknown pages remain to be checked.
        doc.setdefault("source_pages", None)

        # Calculate hashes only when the PDF directory is provided.
        if pdf_dir is not None:
            doc["sha256"] = sha256(pdf_dir / doc["filename"])
        else:
            doc.setdefault("sha256", None)

    data["schema_version"] = "1.1"

    # Write only after validation and transformation have succeeded.
    output = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    manifest_path.write_text(output, encoding="utf-8")

    print(f"OK: {len(data['documents'])} documents migrated.")
    print(f"Schema version: {data['schema_version']}")

    for doc in data["documents"]:
        hash_status = (
            "SHA-256 OK"
            if doc.get("sha256")
            else "SHA-256 pending"
        )
        print(
            f"{doc['document_id']:20} "
            f"{doc['document_type']:14} "
            f"index={str(doc['index']):5} "
            f"pages={doc.get('source_pages')} "
            f"{hash_status}"
        )


if __name__ == "__main__":
    main()
