import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INPUT_PATH = ROOT / "rag" / "data" / "processed" / "extracted_text.json"
OUTPUT_PATH = ROOT / "rag" / "data" / "processed" / "regulations.json"
MANIFEST_PATH = ROOT / "rag" / "data" / "manifest.json"

# Segmentation pilote : les trois décrets du Journal officiel n° 37 de 2023.
TARGETS = [
    {"id": "JORADP-2023-196", "number": "23-196", "start_page": 6, "end_page": 9},
    {"id": "JORADP-2023-197", "number": "23-197", "start_page": 9, "end_page": 12},
    {"id": "JORADP-2023-198", "number": "23-198", "start_page": 12, "end_page": 13},
]

# En-tête du décret : en début de ligne et avec majuscule, pour ne pas
# confondre avec une citation ("Vu le décret exécutif n° 23-196 ...").
HEADER_PATTERNS = {
    t["number"]: re.compile(
        r"(?m)^[ \t]*Décret exécutif\s+n[°ºo]\s*"
        + t["number"].split("-")[0] + r"\s*[-‑–]\s*" + t["number"].split("-")[1] + r"\b"
    )
    for t in TARGETS
}


def find_header(text, number):
    """Return the character offset of a decree header, or None."""
    match = HEADER_PATTERNS[number].search(text)
    return match.start() if match else None


def main():
    for path in (INPUT_PATH, MANIFEST_PATH):
        if not path.exists():
            raise FileNotFoundError(f"Fichier introuvable : {path}")

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest_by_id = {doc["document_id"]: doc for doc in manifest["documents"]}
    documents = json.loads(INPUT_PATH.read_text(encoding="utf-8"))

    source = next((d for d in documents if d["filename"] == "F2023037.pdf"), None)
    if source is None:
        raise ValueError("F2023037.pdf absent du fichier d'extraction.")

    pages = source["pages"]
    results = []

    for target in TARGETS:
        segments = []
        missing_headers = []

        manifest_doc = manifest_by_id.get(target["id"])
        if manifest_doc is None:
            raise ValueError(f"Document absent du manifeste : {target['id']}")
        official_title = manifest_doc["title"]

        for page in pages:
            page_number = page["page"]
            if not target["start_page"] <= page_number <= target["end_page"]:
                continue

            text = page["text"]
            start, end = 0, len(text)

            # Première page du décret : commencer à son en-tête.
            if page_number == target["start_page"]:
                offset = find_header(text, target["number"])
                if offset is not None:
                    start = offset
                else:
                    # Sans en-tête, on garderait le texte du décret précédent.
                    missing_headers.append(page_number)

            # Dernière page : s'arrêter au prochain décret connu.
            if page_number == target["end_page"]:
                next_target = next(
                    (t for t in TARGETS
                     if t["start_page"] == page_number
                     and t["number"] != target["number"]),
                    None,
                )
                if next_target:
                    offset = find_header(text, next_target["number"])
                    if offset is not None:
                        end = offset
                    else:
                        missing_headers.append(page_number)

            segment_text = text[start:end].strip()
            if segment_text:
                segments.append({"page": page_number, "text": segment_text})

        results.append({
            "id": target["id"],
            "document_number": target["number"],
            "title": official_title,
            "source_file": "F2023037.pdf",
            "source_pages": [s["page"] for s in segments],
            "language": "fr",
            "segmentation_status": "needs_review" if missing_headers else "pilot",
            "warnings": [
                f"En-tête à vérifier sur la page {p}."
                for p in sorted(set(missing_headers))
            ],
            "pages": segments,
        })
        # Segmentation de la loi n° 22-23, pages 5 à 6 du JO n° 85 de 2022.
    law_id = "JORADP-2022-085"
    law_source = next(
        (d for d in documents if d["filename"] == "F2022085.pdf"),
        None,
    )
    if law_source is None:
        raise ValueError("F2022085.pdf absent du fichier d'extraction.")

    law_manifest = manifest_by_id.get(law_id)
    if law_manifest is None:
        raise ValueError(f"Document absent du manifeste : {law_id}")

    law_pages = []
    law_warnings = []

    for page in law_source["pages"]:
        page_number = page["page"]

        if page_number not in (5, 6):
            continue

        text = page["text"]
        start = 0

        if page_number == 5:
            # Éviter de récupérer la table des matières du Journal officiel.
            match = re.search(
                r"(?m)^[ \t]*Loi\s+n[°ºo]\s*22\s*[-‑–]\s*23\b",
                text,
            )
            if not match:
                raise ValueError(
                    "Titre de la loi 22-23 introuvable sur la page 5."
                )
            start = match.start()

        elif page_number == 6:
            # Écarter l'en-tête répétitif du Journal officiel.
            match = re.search(
                r"(?m)^[ \t]*(?:CHAPITRE\s+2|Art\.?\s*9\b)",
                text,
            )
            if match:
                start = match.start()
            else:
                law_warnings.append(
                    "Début du contenu juridique à vérifier page 6."
                )

        segment_text = text[start:].strip()
        if segment_text:
            law_pages.append({
                "page": page_number,
                "text": segment_text,
            })

    if [p["page"] for p in law_pages] != [5, 6]:
        raise ValueError(
            "Segmentation incomplète de la loi 22-23 : "
            f"pages obtenues = {[p['page'] for p in law_pages]}"
        )

    results.append({
        "id": law_id,
        "document_number": "22-23",
        "title": law_manifest["title"],
        "source_file": "F2022085.pdf",
        "source_pages": [5, 6],
        "language": "fr",
        "segmentation_status": (
            "needs_review" if law_warnings else "pilot"
        ),
        "warnings": law_warnings,
        "pages": law_pages,
    })
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Fichier créé : {OUTPUT_PATH}")

    for reg in results:
        chars = sum(len(p["text"]) for p in reg["pages"])
        print(f'{reg["document_number"]}: {len(reg["pages"])} pages, '
              f'{chars} caractères, statut={reg["segmentation_status"]}')
        for w in reg["warnings"]:
            print("  ATTENTION :", w)


if __name__ == "__main__":
    main()