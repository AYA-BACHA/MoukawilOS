import json
from pathlib import Path

import pymupdf


# Paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "rag" / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
MANIFEST_PATH = DATA_DIR / "manifest.json"


def load_manifest():
    """Load and validate the regulatory document manifest."""
    with MANIFEST_PATH.open("r", encoding="utf-8") as file:
        manifest = json.load(file)

    if "documents" not in manifest:
        raise ValueError("The manifest must contain a 'documents' list.")

    return manifest


def extract_pdf_text(pdf_path):
    """Extract text page by page, preserving PDF page numbers."""
    pages = []

    with pymupdf.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf, start=1):
            text = page.get_text("text").strip()

            if text:
                pages.append({
                    "page": page_number,
                    "text": text
                })

    return pages


def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()

    results = []

    # Process each unique PDF only once.
    filenames = sorted({
        document["filename"]
        for document in manifest["documents"]
    })

    for filename in filenames:
        pdf_path = RAW_DIR / filename

        if not pdf_path.exists():
            print(f"WARNING: PDF not found: {filename}")
            continue

        pages = extract_pdf_text(pdf_path)

        results.append({
            "filename": filename,
            "source_url": next(
                (
                    document.get("source_url")
                    for document in manifest["documents"]
                    if document["filename"] == filename
                    and document.get("source_url")
                ),
                None
            ),
            "page_count_extracted": len(pages),
            "pages": pages
        })

        print(f"{filename}: {len(pages)} pages extracted")

    output_path = PROCESSED_DIR / "extracted_text.json"

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(results, file, ensure_ascii=False, indent=2)

    print(f"\nExtraction complete: {output_path}")


if __name__ == "__main__":
    main()
