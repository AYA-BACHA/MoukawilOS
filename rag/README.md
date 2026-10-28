# MoukawilOS — Regulatory RAG Service

## 1. Overview

MoukawilOS aims to provide an AI-powered regulatory assistant that helps Algerian auto-entrepreneurs find reliable information about their legal, administrative, and fiscal obligations.

The Regulatory RAG Service is designed to retrieve relevant passages from official Algerian legal texts and use them as evidence when answering user questions.

The project follows a retrieval-augmented generation (RAG) approach to ground answers in regulatory documents rather than relying exclusively on the language model's internal knowledge.

**Current scope:** regulatory document processing, article-aware chunking, local embedding generation, and retrieval experimentation.

**Target scope:** an evidence-grounded regulatory intelligence service with source citations, controlled answer generation, and deterministic refusal when the available evidence is insufficient.

> Implementation status is documented explicitly throughout this README. A planned feature must not be interpreted as an already implemented capability.

---

## 2. Current Implementation Status

| Component | Status | Description |
|---|---|---|
| Regulatory corpus | Implemented for the current MVP | Four target legal texts processed |
| Text extraction | Implemented | Extracted text and source metadata stored locally |
| Article-aware chunking | Implemented | Regulatory content segmented into retrievable chunks |
| Chunk review | Implemented | Review file generated for manual inspection |
| Multilingual embeddings | Implemented | `intfloat/multilingual-e5-small` |
| Local vector index | Implemented | NumPy vectors and JSON metadata |
| BM25 retrieval | Implemented experimentally | Lexical retrieval baseline |
| Reciprocal Rank Fusion (RRF) | Implemented experimentally | Combines rankings from retrieval methods |
| Two-stage retrieval | Implemented experimentally | Document selection followed by chunk retrieval |
| Retrieval evaluation | Partially implemented | Initial tests on a small set of manually defined questions |
| FastAPI health endpoint | Implemented | Basic service health check |
| Regulatory answer-generation endpoint | Not yet integrated | Requires retrieval, evidence handling, and generation |
| Source citations in generated answers | Planned | Answers should identify supporting legal provisions |
| Calibrated refusal mechanism | Planned | Requires evaluation and integration |
| Full anti-hallucination protocol | Planned | Requires end-to-end validation |

---

## 3. Regulatory Corpus

### 3.1 Currently processed legal texts

The current MVP processes four target legal texts:

| Legal text | Main subject | Processing status |
|---|---|---|
| Law No. 22-23 of 18 December 2022 | Status of the auto-entrepreneur | Processed |
| Executive Decree No. 23-196 of 25 May 2023 | Organization and functioning of ANAE | Processed |
| Executive Decree No. 23-197 of 25 May 2023 | Activities eligible for auto-entrepreneur status | Processed |
| Executive Decree No. 23-198 of 25 May 2023 | Auto-entrepreneur card model | Processed |

The repository also contains other raw regulatory PDFs. Their presence in the raw-data directory does not, by itself, mean they have been segmented, indexed, or evaluated for retrieval.

### 3.2 Current corpus statistics

| Metric | Current result |
|---|---:|
| Target legal texts processed | 4 |
| Total chunks | 79 |
| Indexable chunks | 70 |
| Structural, non-indexed chunks | 9 |
| Embedding model | `intfloat/multilingual-e5-small` |
| Embedding dimension | 384 |
| Configured maximum chunk length | 2,400 characters |

Structural chunks, such as preambles, closing sections, and annexes, are retained in the corpus but excluded from the current vector index where configured as non-indexable.

The original chunk text is preserved separately from `embedding_text`, which can include contextual information to improve retrieval.

### 3.3 Data organization

The main data files are located under `rag/data/`:

```text
rag/data/
├── raw/
│   └── Official regulatory PDF files
├── manifest.json
├── processed/
│   ├── extracted_text.json
│   ├── regulations.json
│   ├── chunks.json
│   ├── chunks_review.json
│   └── embeddings/
│       ├── vectors.npy
│       ├── metadata.json
│       └── index_info.json
└── backups/
```

- `raw/`: source PDF documents.
- `manifest.json`: source document inventory and associated metadata.
- `extracted_text.json`: extracted source text and page information.
- `regulations.json`: normalized regulatory document data.
- `chunks.json`: generated retrieval chunks.
- `chunks_review.json`: review-oriented representation of the chunks.
- `embeddings/vectors.npy`: numerical embedding vectors.
- `embeddings/metadata.json`: metadata corresponding to indexed chunks.
- `embeddings/index_info.json`: index configuration and build information.
- `backups/`: local snapshots created during data preparation.

Backup files may differ depending on the local development environment. They are not part of the runtime index.

---

## 4. Document Processing Pipeline

The current preparation pipeline transforms regulatory PDFs into structured, searchable content.

```text
Official PDF documents
        |
        v
Text extraction
        |
        v
Document normalization
        |
        v
Article-aware segmentation
        |
        v
Chunk creation and review
        |
        v
Embedding generation
        |
        v
Local vector index
        |
        v
Retrieval experiments and evaluation
```

### 4.1 Text extraction and normalization

Text is extracted from the source documents and stored with document and page information.

The pipeline retains source references so that retrieved passages can be traced back to their originating legal document.

Scanned pages, complex layouts, tables, and annexes may require additional extraction or manual verification.

### 4.2 Article-aware chunking

The segmentation process identifies article boundaries and creates chunks suitable for retrieval.

Each chunk preserves relevant document and article metadata. The pipeline also distinguishes indexable regulatory passages from structural content that should not enter the current index.

The current configuration uses a maximum chunk length of 2,400 characters. This is not equivalent to a rule that keeps every article below 800 tokens intact.

A future chunking refinement may use token-aware limits, preserve article boundaries where practical, and split exceptionally long articles into smaller passages without losing their source references.

### 4.3 Embedding generation

The project uses the multilingual embedding model:

`intfloat/multilingual-e5-small`

The model generates 384-dimensional vectors and supports multilingual retrieval, including French and Arabic content.

The implementation uses the E5 task prefixes:

- Documents: `passage: `
- User queries: `query: `

Only chunks marked `index: true` are included in the current index.

### 4.4 Local index

The current index is file-based and uses:

- NumPy for the vector matrix.
- JSON for chunk metadata and index information.
- A local embedding model for vector generation.

This is a local vector index, not a PostgreSQL or pgvector deployment.

---

## 5. Retrieval Experiments

Several retrieval strategies have been implemented and compared.

### 5.1 Semantic retrieval

Semantic retrieval compares the query embedding with the stored chunk embeddings to identify passages that are semantically relevant to the question.

This helps retrieve conceptually related passages even when the wording differs.

### 5.2 BM25 lexical retrieval

BM25 provides a lexical baseline based on term matching and term importance.

It can be particularly useful for queries containing exact article references, legal terminology, activity names, or administrative expressions.

### 5.3 Reciprocal Rank Fusion

Reciprocal Rank Fusion (RRF) combines ranked results from different retrieval methods.

The objective is to benefit from both semantic similarity and lexical matching rather than relying exclusively on one ranking method.

### 5.4 Two-stage retrieval

The two-stage experiment first identifies potentially relevant documents and then retrieves relevant chunks from the selected documents.

The current experimental configuration selects two documents and retrieves up to ten candidate chunks for further ranking.

These are experimental parameters, not final production settings.

### 5.5 Evaluation limitations

Initial evaluation scripts compare retrieval methods on a small set of manually defined questions and target chunk IDs.

This is useful for debugging and comparing approaches, but it is not sufficient to establish production-level reliability.

Further evaluation should include:

- Questions with known supporting articles.
- Questions requiring exact article or activity-code matching.
- Paraphrased questions in French and Arabic.
- Questions whose answers require passages from multiple documents.
- Questions outside the indexed corpus.
- Ambiguous questions and questions with insufficient evidence.
- Recall@k, Precision@k, MRR, and nDCG where applicable.
- Manual assessment of source relevance and legal completeness.

Retrieval quality and answer correctness must be evaluated separately.

---

## 6. Local Setup

### 6.1 Requirements

The development environment uses Python 3.12 and a CPU-compatible PyTorch installation.

The embedding model can run locally, without requiring a paid LLM API for embedding generation. Initial model downloads require access to the relevant model repository.

### 6.2 Create and activate the virtual environment

From the repository root, run:

```powershell
cd rag
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks environment activation, use the virtual environment's Python executable directly:

```powershell
.\.venv\Scripts\python.exe --version
```

### 6.3 Install dependencies

Install the dependencies listed in the project requirements file:

```powershell
python -m pip install -r requirements.txt
```

The embedding and retrieval experiments also depend on the packages used by their scripts, including `sentence-transformers`, `torch`, `numpy`, and `rank-bm25`.

Install any missing experimental dependencies in the virtual environment before running those scripts.

---

## 7. Running the Current Pipeline

Run commands from the repository root unless otherwise specified.

### 7.1 Build the embeddings

```powershell
python rag/scripts/build_embeddings.py
```

This script generates the local embeddings and associated index metadata from the prepared chunks.

Review the script's configuration and output paths before rebuilding the index, because regeneration can replace existing artifacts.

### 7.2 Run semantic retrieval

```powershell
python rag/scripts/search_index.py
```

Use this to test semantic retrieval with individual queries.

### 7.3 Compare retrieval strategies

```powershell
python rag/scripts/compare_retrieval.py
```

This compares the retrieval approaches implemented in the experiment.

### 7.4 Test two-stage retrieval

```powershell
python rag/scripts/test_two_stage_retrieval.py
```

### 7.5 Evaluate two-stage retrieval

```powershell
python rag/scripts/evaluate_two_stage.py
```

### 7.6 Compare document-level retrieval

```powershell
python rag/scripts/test_document_retrieval.py
```

### 7.7 Test metadata-enriched BM25

```powershell
python rag/scripts/test_bm25_context.py
```

### 7.8 Inspect activity retrieval

```powershell
python rag/scripts/test_activity_retrieval.py
python rag/scripts/compare_activity_rankings.py
```

The scripts above are development and evaluation utilities. They do not collectively constitute a deployed, end-to-end conversational RAG service.

---

## 8. Regulatory RAG Intelligence Service — Target Architecture

The long-term objective is a specialized regulatory intelligence microservice that answers legal and administrative questions using verified official sources.

The target architecture is:

```text
User question
      |
      v
Query processing
      |
      v
Hybrid retrieval
      |
      v
Evidence ranking and validation
      |
      +---- Insufficient evidence ----> Deterministic refusal
      |
      v
Context construction
      |
      v
LLM answer generation
      |
      v
Claim and citation validation
      |
      v
Answer with supporting legal sources
```

This is the target design, not a claim that every component is already implemented.

### 8.1 Planned corpus expansion

The broader regulatory scope may include:

| Candidate source | Intended coverage | Status |
|---|---|---|
| Law No. 22-23 | Auto-entrepreneur status, rights, and obligations | Processed |
| Executive Decree No. 23-196 | ANAE organization and procedures | Processed |
| Executive Decree No. 23-197 | Eligible activities and associated codes | Processed |
| Executive Decree No. 23-198 | Auto-entrepreneur card model | Processed |
| Finance Law No. 23-22 | Fiscal provisions relevant to auto-entrepreneurs | Additional ingestion and validation required |
| Executive Decree No. 05-468 | Invoicing and supporting-document requirements | Additional ingestion and validation required |
| Executive Decree No. 26-257 | CASNOS contribution provisions | Additional ingestion and validation required |
| Relevant provisions of the Commercial Code | Commercial record-retention requirements | Relevant official text and provisions must be identified and validated |

The additional sources must be processed, indexed, and checked against the official legal texts before being presented as searchable, verified knowledge.

A document's inclusion in the broader target corpus does not establish that every legal claim associated with it has been verified.

### 8.2 Metadata and traceability

The target system should retain, for each indexed passage:

- Stable document identifier.
- Official document title and legal reference.
- Article or provision reference.
- Source PDF and page information.
- Official source URL, when available and validated.
- Verification status and verification date.
- Original text and contextualized embedding text.

The source URL and verification status should be supported by actual source checks rather than assigned automatically without review.

### 8.3 Evidence-grounded generation

The generation component should answer from retrieved regulatory evidence.

The target response format should distinguish:

1. The direct answer to the user's question.
2. The legal provision supporting each material claim.
3. The source document and article reference.
4. Relevant limitations, exceptions, or ambiguity.
5. A refusal or request for clarification when the evidence does not support a reliable answer.

The system should not invent article numbers, statutory rates, deadlines, obligations, or exceptions.

### 8.4 Refusal behavior

A similarity threshold of `0.70` has been proposed as a possible initial refusal rule.

However, a similarity score is not, by itself, a calibrated measure of legal certainty. The threshold must be tested against answerable and unanswerable questions before it can be used as a production decision rule.

A robust refusal mechanism should consider:

- Retrieval relevance and evidence quality.
- Whether the retrieved passages actually support the requested claim.
- Conflicting or outdated provisions.
- Missing context or ambiguous questions.
- Questions outside the indexed corpus.
- Retrieval failures and generation failures.

The service should bypass answer generation when the refusal policy determines that sufficient evidence is unavailable.

A proposed fallback message is:

> This query cannot be resolved with high statutory certainty from the currently verified official legal sources. Please consult the competent authority, such as the Direction Générale des Impôts (mfdgi.gov.dz), ANAE (anae.dz), or CASNOS (casnos.com.dz), as appropriate to your question.

The appropriate authority should be selected according to the subject of the question. The wording should not imply that these institutions are interchangeable or that the fallback replaces professional legal or fiscal advice.

These controls can reduce unsupported answers, but no similarity threshold or prompt alone can guarantee that a generative system will never hallucinate. The system must be evaluated end to end.

---

## 9. API Status

The current FastAPI application exposes a basic `/health` endpoint.

At this stage, the health endpoint confirms the basic service interface; it does not establish that the complete retrieval and generation pipeline is operational.

The next API milestone is to implement and test a regulatory question-answering endpoint that:

1. Accepts a user question.
2. Retrieves relevant regulatory passages.
3. Applies evidence sufficiency and refusal rules.
4. Constructs a traceable context.
5. Generates a response only when permitted.
6. Returns the answer with source citations and relevant metadata.

The API should also handle invalid requests, retrieval errors, and model failures explicitly.

---

## 10. Recommended Development Roadmap

### Phase 1 — Corpus quality

- Finish checking the current chunks against their official sources.
- Validate document metadata and source references.
- Inspect complex layouts, scanned pages, and annexes.
- Expand the corpus only after confirming the official source and scope of each document.

### Phase 2 — Retrieval quality

- Build a reproducible evaluation dataset.
- Compare semantic, BM25, and hybrid retrieval.
- Evaluate exact article matching and activity-code retrieval.
- Tune chunking and ranking using measured results.

### Phase 3 — Evidence and refusal policy

- Define answerable, ambiguous, and unanswerable question sets.
- Test candidate refusal thresholds.
- Require source evidence for material legal claims.
- Test conflicting, missing, and insufficient evidence.

### Phase 4 — RAG API integration

- Implement the question-answering endpoint.
- Connect retrieval, context construction, and generation.
- Return structured source citations.
- Add error handling and integration tests.

### Phase 5 — End-to-end validation

- Measure retrieval and answer quality independently.
- Check citation correctness and legal claim support.
- Evaluate refusal behavior and unsupported-answer rates.
- Document known limitations before deployment.

---

## 11. Known Limitations

- The current indexed MVP covers four target legal texts, not the entire Algerian legal and fiscal framework.
- The presence of a raw PDF does not guarantee that it is included in the index.
- The current chunking limit is character-based rather than an 800-token article-preservation rule.
- Retrieval experiments use a small evaluation set.
- Retrieval similarity does not establish legal correctness.
- The full generation, citation-validation, and deterministic-refusal workflow is not yet integrated into the API.
- Official source verification and legal updates require explicit review.
- The system is intended to support access to regulatory information, not to replace competent authorities or qualified legal and fiscal professionals.

---

## 12. Repository Status

The `feat/regulatory-corpus` branch contains the initial regulatory corpus preparation and retrieval pipeline.

The next major milestone is to move from retrieval experiments to a tested, evidence-grounded RAG service, while keeping the corpus scope, source verification, evaluation results, and implementation status transparent.
