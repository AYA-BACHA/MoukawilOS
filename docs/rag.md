# MoukawilOS — Regulatory RAG System Specification

> **Status:** Canonical Specification — Sprint 0 Baseline  
> **Service:** Python 3.13 + FastAPI microservice (`rag/`)  
> **Database:** Supabase PostgreSQL with `pgvector`  
> **Source of Truth:** Aligned with [`docs/developer-handoff.md`](developer-handoff.md) and [`docs/legal-sources.md`](legal-sources.md).

---

## 1. System Vision & Objectives

The MoukawilOS Regulatory RAG system provides Algerian digital freelancers with accurate, grounded answers to legal, tax, and social security questions.

### Core Principles
1. **Zero Hallucination:** The model must never invent statutory rules, rates, article numbers, or filing dates.
2. **Strict Grounding:** Responses must derive exclusively from the curated Algerian regulatory corpus.
3. **Mandatory Citations:** Every assertion must reference the exact Article, Law/Decree number, and verification status.
4. **Intellectual Honesty Fallback:** If a topic is unindexed or ambiguous in official texts, the system explicitly admits lack of data rather than guessing.

---

## 2. Regulatory Corpus Ingestion & Boundaries

The retrieval corpus is strictly restricted to official Algerian statutes verified in [`docs/legal-sources.md`](legal-sources.md):

| Source Document | Reference | Topics Covered | Status |
| :--- | :--- | :--- | :--- |
| **Loi n° 22-23 du 18 décembre 2022** | *JORA n° 85* | Auto-Entrepreneur status, rights, obligations, 5M DZD ceiling, 3-year radiation rule | `verified-official` |
| **Décret exécutif n° 23-196** | *JORA n° 37* | ANAE registration, card issuance, portal procedures | `verified-official` |
| **Décret exécutif n° 23-197** | *JORA n° 37* | 7 approved activity sectors, activity codes | `verified-official` |
| **Code des Impôts Directs (CIDTA)** | *Loi de Finances 2024* | IFU 0.5% rate (*art. 282 sexies*), 10,000 DA floor (*art. 365 bis*), G12 filing dates | `verified-official` |
| **Décret exécutif n° 26-257** | *JORA n° 12* | CASNOS 24,000 DA flat contribution for auto-entrepreneurs | `verified-official` |
| **Décret exécutif n° 05-468** | *JORA n° 80* | Mandatory invoice mentions (*art. 10*), credit notes (*art. 11*) | `verified-official` |
| **Code de Commerce** | *Article 12* | 10-year invoice archiving requirement | `verified-official` |

---

## 3. Ingestion Pipeline & Legal Chunking Strategy

Standard character-count chunking corrupts legal articles. MoukawilOS uses a specialized **Article-Aware Chunking Strategy**:

```text
Raw Legal PDF / Gazette
         │
         ▼
[Legal Text Normalizer] ──► Removes line wraps, standardizes arabic/french characters
         │
         ▼
[Article-Boundary Chunker] ──► Splits by "Article X" / "المادة X" headers
         │
         ▼
[Metadata Enricher] ──► Injects Law number, Article ref, Official URL, Verification Status
         │
         ▼
[Embedding Generator] ──► text-embedding-3-small (1536 dim) / multilingual MiniLM
         │
         ▼
[pgvector Upsert] ──► Stores in public.rag_embeddings with HNSW index
```

### Chunking Rules
- **Boundary Invariant:** Chunks are split strictly by Article boundaries. An article under 800 tokens is never fragmented.
- **Section Grouping:** For exceptionally long articles, chunks are split by subparagraphs or numbered clauses, preserving the parent Article header in each chunk's metadata.
- **Metadata Structure:**
  ```json
  {
    "document_title": "Loi n° 22-23 du 18 décembre 2022 portant statut de l'auto-entrepreneur",
    "law_number": "Loi 22-23",
    "article": "Article 13",
    "section": "Dispositions financières et radiation",
    "official_url": "https://www.joradp.dz/FTP/JO-FRANCAIS/2022/F2022085.pdf",
    "verification_status": "verified-official"
  }
  ```

---

## 4. Vector Storage & Cosine Similarity Search

Chunks and embeddings are stored in Supabase PostgreSQL using `pgvector`.

### Database Match Function
```sql
CREATE OR REPLACE FUNCTION match_legal_chunks (
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.70,
    match_count int DEFAULT 4
)
RETURNS TABLE (
    id uuid,
    document_title text,
    article_reference text,
    content text,
    official_url text,
    verification_status source_verification_status,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        d.title AS document_title,
        e.article_reference,
        e.content,
        d.official_url,
        d.verification_status,
        1 - (e.embedding <=> query_embedding) AS similarity
    FROM public.rag_embeddings e
    JOIN public.rag_documents d ON d.id = e.document_id
    WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

---

## 5. LLM Prompt Guardrails & Attribution Format

### System Prompt
```text
Tu es l'assistant réglementaire officiel de MoukawilOS, expert du statut de l'Auto-Entrepreneur en Algérie (Loi n° 22-23).

RÈGLES ABSOLUES DE CONDUITE :
1. Tu dois répondre EXCLUSIVEMENT à partir des extraits de textes juridiques fournis dans le CONTEXTE.
2. Si le contexte ne contient pas l'information juridique exacte pour répondre à la question, tu DOIS répondre mot pour mot avec le message de repli officiel :
   "Cette disposition n'est pas précisée de manière unifiée dans les textes légaux vérifiés. Veuillez consulter directement les services de la DGI (mfdgi.gov.dz), de l'ANAE (anae.dz) ou de la CASNOS (casnos.dz)."
3. N'invente JAMAIS d'articles de loi, de taux d'imposition, de montants de cotisations ou de délais administratifs.
4. Toute affirmation légale doit impérativement citer l'Article précis et le texte de référence (ex: "Article 282 sexies du CIDTA").
5. Les alertes préventives de MoukawilOS (ex: alerte à 80% du plafond / 4 000 000 DA) doivent être clairement distinguées des plafonds légaux stricts (5 000 000 DA).
```

### JSON Response Schema
```json
{
  "query": "Quel est le montant de la cotisation CASNOS pour un auto-entrepreneur ?",
  "answer": "Pour un auto-entrepreneur en Algérie, la cotisation annuelle de sécurité sociale CASNOS sous le régime forfaitaire spécifique est fixée à 24 000 DA par an.",
  "sources": [
    {
      "document": "Décret exécutif n° 26-257",
      "article": "Article 2",
      "official_reference": "Journal Officiel de la République Algérienne",
      "status": "verified-official",
      "url": "https://www.joradp.dz"
    }
  ],
  "confidence_score": 0.96,
  "fallback_triggered": false
}
```

---

## 6. Evaluation Benchmark (Golden Test Suite)

Before deployment, the RAG service must pass a 25-query benchmark evaluation (`rag/tests/benchmark_eval.py`):
1. **Turnover Ceiling & Radiation:** Verifies 5M DZD ceiling and 3-consecutive-years radiation rule (*Loi 22-23 art. 13-14*).
2. **IFU Tax Rate & Floor:** Verifies 0.5% rate and 10,000 DZD statutory floor (*CIDTA art. 282 sexies & 365 bis*).
3. **CASNOS Contribution:** Verifies 24,000 DZD flat fee and June 30 deadline.
4. **Mandatory Invoicing Mentions:** Verifies NIF, ANAE card, TVA exemption clause, and RC exemption clause.
5. **Out-of-Scope Queries (Adversarial Testing):** Queries regarding non-eligible commercial activities, SARL corporate tax, or crypto regulations must trigger the standardized fallback without hallucination.
