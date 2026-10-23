
"""Découpe les textes réglementaires en chunks traçables par article.

Entrée :
    rag/data/processed/regulations.json

Sorties :
    rag/data/processed/chunks.json
    rag/data/processed/chunks_review.json

Usage :
    py rag/scripts/chunk_regulations.py [entrée.json] [sortie.json]
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INPUT_PATH = ROOT / "rag" / "data" / "processed" / "regulations.json"
OUTPUT_PATH = ROOT / "rag" / "data" / "processed" / "chunks.json"

MAX_CHARS = 2400

HEADER_LINES = [
    re.compile(r"^JOURNAL OFFICIEL DE LA REPUBLIQUE ALGERIENNE", re.I),
    re.compile(
        r"^\d{1,2}(?:er)?(?:\s+[^\W\d_]+){1,3}\s+\d{4}$",
        re.I,
    ),
]
SEPARATOR = re.compile(r"^[—–\-_\s]*\w?[—–\-_\s]*$")
HEADER_ZONE = 6

ARTICLE_RE = re.compile(
    r"(?im)^[ \t]*(?:Article|Art\.?)[ \t]*"
    r"(1er|premier|\d+)[ \t]*\.?[ \t]*[—–-]"
)

CHAPTER_LINE = re.compile(
    r"^(?:CHAPITRE|TITRE)[ \t]+(?:\d+|1er|[IVX]+)[ \t]*$",
    re.I,
)
SECTION_LINE = re.compile(
    r"^(?:Sous-)?[Ss]ection[ \t]+(?:\d+|1re|première)[ \t]*$",
    re.I,
)
HEADING_START = re.compile(
    r"(?im)^[ \t]*(?:(?:CHAPITRE|TITRE)[ \t]+(?:\d+|1er|[IVX]+)"
    r"|(?:Sous-)?[Ss]ection[ \t]+(?:\d+|1re|première))[ \t]*$"
)
ANNEX_RE = re.compile(r"(?im)^[ \t]*Annexe\b")
CLOSING_RE = re.compile(r"(?im)^[ \t]*Fait[ \t]+à(?:[ \t]|$)")


def clean_page(text):
    """Remove repeated page headers and decorative separators."""
    lines = text.replace("\r", "").split("\n")
    kept = []

    for index, line in enumerate(lines):
        stripped = line.strip()

        # Remove a page number only when it directly precedes
        # the official gazette header at the top of the page.
        if (
            stripped.isdigit()
            and index < HEADER_ZONE
            and index + 1 < len(lines)
            and re.match(
                r"^\s*JOURNAL OFFICIEL DE LA REPUBLIQUE ALGERIENNE",
                lines[index + 1],
                re.I,
            )
        ):
            continue

        if (
            index < HEADER_ZONE
            and any(pattern.match(stripped) for pattern in HEADER_LINES)
        ):
            continue

        if (
            stripped
            and len(stripped) >= 3
            and SEPARATOR.match(stripped)
            and not stripped.isalnum()
        ):
            continue

        kept.append(line)

    return "\n".join(kept).strip()


def compact(text):
    """Normalize whitespace without removing paragraph boundaries."""
    text = text.replace("’", "'").replace("\u00a0", " ")
    text = re.sub(
        r"(?<=[a-zà-ÿ])-\n(?=[a-zà-ÿ])",
        "-",
        text,
        flags=re.I,
    )
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_long_text(text, max_chars=MAX_CHARS):
    """Split long text near paragraph or word boundaries."""
    parts = []
    remaining = text.strip()

    while len(remaining) > max_chars:
        limit = remaining.rfind("\n", 0, max_chars + 1)

        if limit < max_chars // 2:
            limit = remaining.rfind(" ", 0, max_chars + 1)

        if limit < max_chars // 2:
            limit = max_chars

        parts.append(remaining[:limit].strip())
        remaining = remaining[limit:].strip()

    if remaining:
        parts.append(remaining)

    return parts


def parse_heading_block(block, chapter, section):
    """Update chapter/section context from headings after an article."""
    lines = [line.strip() for line in block.splitlines() if line.strip()]
    index = 0

    while index < len(lines):
        line = lines[index]
        is_chapter = bool(CHAPTER_LINE.match(line))
        is_section = bool(SECTION_LINE.match(line))
        index += 1

        if not (is_chapter or is_section):
            continue

        title_lines = []
        while index < len(lines) and not (
            CHAPTER_LINE.match(lines[index])
            or SECTION_LINE.match(lines[index])
        ):
            title_lines.append(lines[index])
            index += 1

        label = line
        if title_lines:
            label += " — " + " ".join(title_lines)

        if is_chapter:
            chapter, section = label, None
        else:
            section = label

    return chapter, section


def split_trailing_heading(body):
    """Separate a trailing chapter/section heading from the preceding article."""
    match = HEADING_START.search(body)
    if not match:
        return body, ""
    return body[:match.start()], body[match.start():]


def build_chunks(regulation):
    warnings = []

    # Assemble pages and retain exact character spans for provenance.
    text_parts = []
    spans = []
    position = 0

    for page in regulation["pages"]:
        page_text = clean_page(page["text"])
        if not page_text:
            continue

        if text_parts:
            text_parts.append("\n")
            position += 1

        start = position
        text_parts.append(page_text)
        position += len(page_text)
        spans.append((start, position, page["page"]))

    full_text = "".join(text_parts)

    def pages_of(start, end):
        """Return only pages overlapping the requested character range."""
        if end <= start:
            return []

        return sorted({
            page_number
            for page_start, page_end, page_number in spans
            if page_start < end and page_end > start
        })

    meta = {
        "document_id": regulation["id"],
        "document_number": regulation["document_number"],
        "title": regulation["title"],
        "source_file": regulation["source_file"],
        "language": regulation.get("language", "fr"),
        "segmentation_status": regulation.get(
            "segmentation_status", "needs_review"
        ),
        "review_status": "pending",
    }

    if not full_text:
        warnings.append("Texte vide après nettoyage.")
        return [], warnings

    heads = []
    expected = 1

    for match in ARTICLE_RE.finditer(full_text):
        label_number = match.group(1).lower()
        number = 1 if label_number in ("1er", "premier") else int(label_number)

        if number == expected:
            heads.append((number, match))
            expected += 1
        elif number > expected:
            warnings.append(
                f"Saut de numérotation : article {expected} attendu, "
                f"{number} trouvé."
            )
            heads.append((number, match))
            expected = number + 1
        else:
            warnings.append(
                f"Titre ignoré (numéro {number} déjà vu) : "
                f"{match.group(0).strip()!r}"
            )

    if not heads:
        warnings.append(
            "Aucun article détecté : texte conservé hors index, "
            "vérification manuelle nécessaire."
        )
        return [{
            "chunk_id": f'{regulation["id"]}:full-text',
            "type": "full_text",
            **meta,
            "source_pages": pages_of(0, len(full_text)),
            "index": False,
            "article_number": None,
            "text": compact(full_text),
        }], warnings

    chunks = []
    chapter = None
    section = None

    def add_non_indexed(kind, body, start, end, chunk_id):
        body = compact(body)
        if not body:
            return

        chunks.append({
            "chunk_id": chunk_id,
            "type": kind,
            **meta,
            "source_pages": pages_of(start, end),
            "index": False,
            "article_number": None,
            "text": body,
        })

    # Preserve the preamble, but exclude it from indexing.
    first_article_start = heads[0][1].start()
    preamble, heading_block = split_trailing_heading(
        full_text[:first_article_start]
    )
    chapter, section = parse_heading_block(
        heading_block, chapter, section
    )
    add_non_indexed(
        "preamble",
        preamble,
        0,
        first_article_start,
        f'{regulation["id"]}:preamble',
    )

    tail_chunks = []

    for index, (number, match) in enumerate(heads):
        start = match.start()
        end = (
            heads[index + 1][1].start()
            if index + 1 < len(heads)
            else len(full_text)
        )
        body = full_text[start:end]

        # Separate the final article from annex/signature material.
        if index == len(heads) - 1:
            boundaries = []

            for kind, pattern in (
                ("annexe", ANNEX_RE),
                ("closing", CLOSING_RE),
            ):
                found = pattern.search(body)
                if found:
                    boundaries.append((found.start(), kind))

            boundaries.sort()

            if boundaries:
                first_boundary = boundaries[0][0]
                original_body = body
                body = original_body[:first_boundary]

                for boundary_index, (boundary_start, kind) in enumerate(boundaries):
                    boundary_end = (
                        boundaries[boundary_index + 1][0]
                        if boundary_index + 1 < len(boundaries)
                        else len(original_body)
                    )
                    tail_chunks.append((
                        kind,
                        original_body[boundary_start:boundary_end],
                        start + boundary_start,
                        start + boundary_end,
                    ))

        content, heading_block = split_trailing_heading(body)

        if heading_block.count("\n") > 8:
            warnings.append(
                f"Article {number} : bloc de titre très long, "
                "texte peut-être mal séparé."
            )

        content_end = start + len(content.rstrip())
        article_label = match.group(0).strip().rstrip("—–-").strip()
        embed_context = " — ".join(
            item for item in (regulation["title"], chapter, section) if item
        )

        content = compact(content)
        parts = split_long_text(content) or [""]

        for part_number, part in enumerate(parts, start=1):
            suffix = f":p{part_number}" if len(parts) > 1 else ""
            part_id = f'{regulation["id"]}:art-{number}{suffix}'

            chunks.append({
                "chunk_id": part_id,
                "type": "article",
                **meta,
                "article_number": number,
                "article_label": article_label,
                "chapter": chapter,
                "section": section,
                "source_pages": pages_of(start, content_end),
                "index": True,
                "part": part_number if len(parts) > 1 else None,
                "text": part,
                "embedding_text": f"{embed_context} — {article_label}\n{part}",
            })

        chapter, section = parse_heading_block(
            heading_block, chapter, section
        )

    for kind, body, start, end in tail_chunks:
        add_non_indexed(
            kind,
            body,
            start,
            end,
            f'{regulation["id"]}:{kind}',
        )

    return chunks, warnings


def main():
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else INPUT_PATH
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else OUTPUT_PATH

    if not input_path.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {input_path}")

    regulations = json.loads(
        input_path.read_text(encoding="utf-8")
    )

    all_chunks = []
    review = {}

    for regulation in regulations:
        chunks, warnings = build_chunks(regulation)
        all_chunks.extend(chunks)

        article_count = len({
            chunk["article_number"]
            for chunk in chunks
            if chunk.get("type") == "article"
        })

        review[regulation["id"]] = {
            "articles": article_count,
            "chunks": len(chunks),
            "warnings": warnings,
        }

        print(
            f'{regulation["document_number"]}: '
            f'{article_count} articles, {len(chunks)} chunks, '
            f'{len(warnings)} avertissement(s)'
        )

        for warning in warnings:
            print("  ATTENTION :", warning)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(all_chunks, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    review_path = output_path.with_name("chunks_review.json")
    review_path.write_text(
        json.dumps(review, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    oversized = [
        chunk for chunk in all_chunks
        if len(chunk["text"]) > MAX_CHARS
    ]
    empty_pages = [
        chunk for chunk in all_chunks
        if not chunk.get("source_pages")
    ]

    print(f"\nFichier créé : {output_path} ({len(all_chunks)} chunks)")
    print(f"Fichier de revue créé : {review_path}")
    print(f"Chunks dépassant {MAX_CHARS} caractères : {len(oversized)}")
    print(f"Chunks sans pages sources : {len(empty_pages)}")


if __name__ == "__main__":
    main()
