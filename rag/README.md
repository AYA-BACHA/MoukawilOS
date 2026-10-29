# MoukawilOS — Regulatory RAG Service

## 1. Overview

MoukawilOS is an AI-powered regulatory assistant designed to help Algerian auto-entrepreneurs understand their legal, administrative, and fiscal obligations.

The Regulatory RAG Service retrieves relevant passages from official Algerian regulatory documents and uses them as evidence to generate answers.

The service combines:

- **Document processing:** extraction, normalization, and article-aware chunking of regulatory documents.
- **Semantic retrieval:** multilingual embeddings generated with `intfloat/multilingual-e5-small`.
- **Retrieval experimentation:** vector search, BM25 lexical search, and hybrid Reciprocal Rank Fusion (RRF).
- **Answer generation:** Google Gemini through the `google-genai` SDK.
- **REST API:** FastAPI endpoints for health checks and question answering.
- **Retrieval evaluation:** a labeled evaluation dataset and a script for comparing retrieval methods.

The current implementation uses a local vector index stored in NumPy and JSON files. PostgreSQL/pgvector integration is not part of the tested local retrieval path described here.

## 2. Implementation Status

| Component | Status | Details |
|---|---|---|
| Regulatory corpus | Implemented | Four target regulatory documents |
| Text extraction and normalization | Implemented | Processed regulatory text |
| Article-aware chunking | Implemented | Article and structural chunks |
| Local embeddings | Implemented | `intfloat/multilingual-e5-small`, 384 dimensions |
| Local vector index | Implemented | NumPy vectors and JSON metadata |
| Vector retrieval | Implemented | Semantic similarity search |
| BM25 retrieval | Implemented | Lexical retrieval |
| Hybrid retrieval | Implemented | Reciprocal Rank Fusion (RRF) |
| Retrieval evaluation | Implemented | 20 labeled evaluation questions |
| FastAPI health endpoint | Implemented | `GET /health` |
| Retrieval and answer endpoint | Implemented | `POST /retrieve` |
| Gemini integration | Implemented | Generates answers using retrieved passages |
| Source information in responses | Implemented | Retrieved source information is returned by the API |
| Automated API tests | Implemented | Six tests passed in the latest recorded run |
| Citation validation | Needs further validation | Source references should be checked against the retrieved evidence |
| Calibrated refusal and confidence thresholds | Requires further work | Not established by the current evaluation |
| Production deployment and frontend integration | Outside the scope of these local test results | Must be verified in the target environment |

## 3. Regulatory Corpus

The current corpus contains four target regulatory documents.

| Document ID | Document |
|---|---|
| `JORADP-2022-085` | Law No. 22-23 on the status of the auto-entrepreneur |
| `JORADP-2023-196` | Executive Decree No. 23-196 |
| `JORADP-2023-197` | Executive Decree No. 23-197 |
| `JORADP-2023-198` | Executive Decree No. 23-198 |

Official legal documents are the intended primary sources for regulatory answers. Secondary sources should not be treated as equivalent to the official legal text.

### Current corpus statistics

| Metric | Value |
|---|---:|
| Total chunks | 79 |
| Indexable chunks | 70 |
| Non-indexable structural chunks | 9 |
| Embedding dimensions | 384 |
| Maximum chunk length configured for the corpus | 2,400 characters |

The corpus contains article chunks as well as structural chunks such as preambles, closing sections, and annexes. Only the 70 indexable chunks are represented in the current embedding index.

These figures describe the current local corpus and may change when documents are added or reviewed.

## 4. Project Structure

The principal files and directories are organized as follows:

```text
rag/
├── app/
│   ├── main.py
│   └── retrieval/
│       └── search.py
├── data/
│   ├── raw/
│   ├── manifest.json
│   └── processed/
│       ├── extracted_text.json
│       ├── regulations.json
│       ├── chunks.json
│       ├── chunks_review.json
│       ├── evaluation_catalog.txt
│       ├── retrieval_eval.json
│       └── embeddings/
│           ├── vectors.npy
│           ├── metadata.json
│           └── index_info.json
├── scripts/
│   ├── build_embeddings.py
│   ├── evaluate_retrieval_methods.py
│   └── ...
├── tests/
│   └── test_api.py
├── .env.example
├── requirements.txt
└── README.md
```

Some scripts and data files support exploratory experiments or review workflows. The structure above highlights the principal artifacts; it is not intended to be an exhaustive list of every experimental file.

### Important data artifacts

- `data/manifest.json`: source-document manifest and associated metadata.
- `data/processed/extracted_text.json`: extracted document text.
- `data/processed/regulations.json`: normalized regulatory content.
- `data/processed/chunks.json`: generated chunks and their metadata.
- `data/processed/chunks_review.json`: chunk-review artifact.
- `data/processed/embeddings/vectors.npy`: numerical embedding vectors.
- `data/processed/embeddings/metadata.json`: metadata associated with indexed chunks.
- `data/processed/embeddings/index_info.json`: information about the generated index.
- `data/processed/evaluation_catalog.txt`: evaluation questions and relevant targets.
- `data/processed/retrieval_eval.json`: evaluation data used by the retrieval evaluation workflow.

Do not manually modify generated vectors or metadata independently. If the corpus changes, regenerate the affected artifacts using the appropriate processing workflow.

## 5. Retrieval Architecture

### 5.1 Embedding generation

The current embedding model is:

`intfloat/multilingual-e5-small`

The model generates 384-dimensional embeddings and supports multilingual text, making it suitable for experimentation with French and other languages used in the regulatory corpus.

The embedding workflow produces:

- A NumPy array containing the vectors.
- Metadata associating indexed vectors with their corresponding chunks.
- Index information describing the generated artifacts.

The current index contains 70 vectors, corresponding to the 70 indexable chunks.

### 5.2 Retrieval methods

Three retrieval approaches are evaluated.

**Vector retrieval**

Uses embedding similarity to retrieve passages semantically related to a question.

**BM25 retrieval**

Uses lexical matching to retrieve passages that share relevant terms with the question. This can be useful for article numbers, legal references, and specific expressions.

**Hybrid retrieval using Reciprocal Rank Fusion**

Combines rankings from multiple retrieval methods. RRF uses the positions of documents in the component rankings rather than directly combining their raw scores.

The evaluation script compares these methods using the same labeled evaluation dataset.

### 5.3 Current retrieval path

The tested local retrieval path uses:

- `vectors.npy` for embeddings.
- `metadata.json` for chunk metadata.
- The processed regulatory chunks as the underlying source content.

This is a local file-based index. PostgreSQL/pgvector should not be considered the active retrieval backend unless a separate integration has been implemented and tested.

## 6. Retrieval Evaluation

### 6.1 Evaluation setup

The latest recorded evaluation used:

- **70** indexable chunks.
- **20** evaluation questions.
- **Top K = 5** retrieved results.
- Three methods: vector, BM25, and hybrid RRF.

The evaluation uses labeled relevant targets. The quality of the results therefore depends partly on the accuracy and completeness of those labels.

### 6.2 Latest recorded results

| Method | Mean first relevant rank | Recall@5 | MRR |
|---|---:|---:|---:|
| Vector | 3.55 | 0.867 | 0.808 |
| BM25 | 2.15 | 0.850 | 0.783 |
| Hybrid RRF | 1.80 | 0.867 | 0.852 |

**Interpretation**

- **Hybrid RRF** achieved the best mean first relevant rank and MRR in this evaluation.
- Hybrid RRF and vector retrieval tied on Recall@5 at 0.867.
- BM25 achieved a Recall@5 of 0.850 and can still contribute useful lexical matches.
- The results support using hybrid retrieval as the current candidate for further testing, but do not establish that it is optimal for every question or legal document.

The metrics should be recalculated whenever the corpus, retrieval configuration, or evaluation labels change.

### 6.3 Known evaluation gaps

The current evaluation is small and does not establish production-level retrieval quality.

In the latest recorded run, the expected target for question Q01 appeared at rank 6 in the hybrid results, while the target for Q11 appeared at rank 8. Both were therefore outside the top five results for those questions.

Further work should include:

- Reviewing relevant-target labels and difficult questions.
- Testing article-specific and number-heavy questions.
- Evaluating French and Arabic questions separately where applicable.
- Measuring retrieval quality as the corpus grows.
- Validating that generated answers are supported by retrieved passages.

## 7. Installation and Configuration

### 7.1 Requirements

The current development setup uses Python 3.12 in a local virtual environment.

Dependencies are listed in `requirements.txt`, including:

- FastAPI
- Uvicorn
- Pydantic
- `python-dotenv`
- NumPy
- `sentence-transformers`
- `rank-bm25`
- `google-genai`

### 7.2 Create and activate a virtual environment

From the `rag/` directory, run the following commands in PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If the virtual environment already exists, activate it instead of recreating it.

### 7.3 Configure environment variables

Copy the example configuration file:

```powershell
Copy-Item .env.example .env
```

Configure the variables in `rag/.env`:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Replace the placeholder with your own valid API key. Never commit `.env` or publish API keys. The `.env.example` file should contain placeholders only.

The API key is required for Gemini answer generation. Retrieval and embedding generation use their own local artifacts and dependency setup.

## 8. Running the API

Run the following command from the `rag/` directory with the virtual environment activated:

```powershell
python -m uvicorn app.main:app --reload
```

The local development server runs at:

`http://127.0.0.1:8000`

The `--reload` option is intended for local development, not production deployment.

### 8.1 Health check

Endpoint:

`GET /health`

PowerShell example:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
```

The endpoint can be used to verify that the API process is responding. It should not, by itself, be treated as proof that Gemini generation or every retrieval artifact is functioning correctly.

### 8.2 Retrieve and generate an answer

Endpoint:

`POST /retrieve`

Example request:

```json
{
  "question": "Quelle est la loi qui définit le statut de l'auto-entrepreneur en Algérie ?",
  "top_k": 3
}
```

PowerShell example:

```powershell
$json = '{"question":"Quelle est la loi qui définit le statut de l auto-entrepreneur en Algérie ?","top_k":3}'

$response = Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/retrieve" `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($json))

$response | Select-Object question, answer, fallback, results_count |
  Format-List
```

Using UTF-8 encoded request bytes helps avoid PowerShell request-body encoding issues.

The latest recorded successful end-to-end local test returned an answer identifying Law No. 22-23, with `fallback` set to `False` and three retrieval results. This demonstrates one successful local request, not a guarantee of availability for every request.

### 8.3 Response structure

The endpoint response includes the following fields:

| Field | Description |
|---|---|
| `question` | The submitted question |
| `answer` | The generated answer or fallback response |
| `sources` | Source information associated with the answer |
| `fallback` | Indicates whether the fallback response was used |
| `results_count` | Number of retrieved results returned |
| `results` | Retrieved passages and associated metadata |

The precise structure of individual result and source objects is defined by the API implementation.

## 9. Answer Generation and Fallback Behavior

The service uses the Google GenAI SDK to send the question and retrieved passages to the configured Gemini model.

The intended flow is:

1. Receive a question through the API.
2. Retrieve relevant regulatory passages.
3. Supply the question and retrieved evidence to the generation component.
4. Generate an answer based on the available evidence.
5. Return the answer, source information, retrieval results, and fallback status.

If answer generation fails, the application has a fallback path. This is important because a retrieval request may succeed even when the external generation service is temporarily unavailable.

A previous local request encountered a Gemini `503 UNAVAILABLE` error, while a subsequent request succeeded. External model availability can therefore affect end-to-end behavior.

**Important limitations**

- A generated answer is not automatically legally correct just because retrieval returned relevant passages.
- Returning source information does not, by itself, prove that every claim is supported by the cited passage.
- The fallback mechanism should not be confused with a fully calibrated legal refusal system.
- Citation validation, unsupported-claim detection, and behavior when evidence is insufficient require further testing.

## 10. Running Tests

From the `rag/` directory, run:

```powershell
python -m pytest tests/test_api.py -v
```

The latest recorded run passed all six tests in `tests/test_api.py`.

The retrieval endpoint tests include mocked answer-generation behavior. Consequently, passing these tests does **not** prove that the live Gemini API is available or that every generated answer is correct.

For an end-to-end smoke test, start the server in one terminal and send a request to `POST /retrieve` from another terminal using the example above.

A useful verification sequence is:

1. Confirm that the server starts.
2. Check `GET /health`.
3. Send a question to `POST /retrieve`.
4. Inspect `results_count` and the returned passages.
5. Check whether `fallback` is `False`.
6. Verify that the answer and source references are supported by the retrieved legal text.

## 11. Re-running Retrieval Evaluation

From the `rag/` directory, run:

```powershell
python .\scripts\evaluate_retrieval_methods.py
```

The evaluation script compares vector, BM25, and hybrid RRF retrieval against the labeled evaluation dataset.

The latest recorded run completed with 70 indexable chunks and 20 evaluation questions.

The evaluation may display a Hugging Face Hub authentication warning when using an unauthenticated account. Such a warning is not, on its own, evidence that the evaluation failed.

Use the printed metrics and question-level rankings to identify weak retrieval cases. Do not modify evaluation labels merely to improve the reported scores; review them against the actual regulatory content.

## 12. Current Limitations and Next Steps

The service has progressed beyond retrieval-only experimentation: it now includes a question-answer API, Gemini integration, and an initial retrieval evaluation workflow.

The remaining work should focus on reliability and validation.

### Priority 1 — Validate legal grounding

- Inspect whether each answer is supported by the retrieved passages.
- Check that source identifiers and article references are correct.
- Test questions whose answers require multiple articles or documents.
- Test questions for which the current corpus contains insufficient evidence.

### Priority 2 — Improve retrieval evaluation

- Review the labeled targets for Q01 and Q11 and other difficult cases.
- Expand the evaluation set with realistic regulatory questions.
- Evaluate article-specific, lexical, and multilingual queries.
- Recalculate metrics after retrieval changes.

### Priority 3 — Improve failure handling

- Test missing or invalid Gemini credentials.
- Test external API errors and timeouts.
- Verify the behavior when no useful passages are retrieved.
- Distinguish generation failures from insufficient retrieval evidence.

### Priority 4 — Verify integration and deployment

- Confirm that the environment used for deployment has the required dependencies and configuration.
- Verify that the intended frontend or backend integration calls the correct endpoint and uses the expected request and response fields.
- Test the deployed service independently of the local development environment.

These are validation tasks, not claims that the corresponding work has already been completed.

## 13. Current Milestone

The current milestone is an initial, locally tested RAG API with hybrid retrieval evaluation and Gemini-based answer generation.

The latest recorded results show that hybrid RRF is a promising retrieval candidate on the current 20-question evaluation set. The API and its six tests have also been exercised locally.

The next milestone is to strengthen evidence grounding, citation correctness, insufficient-evidence handling, and broader evaluation before treating the service as production-ready.

---

**Current implementation summary**

- Corpus: 79 total chunks, including 70 indexable chunks.
- Embeddings: `intfloat/multilingual-e5-small`, 384 dimensions.
- Retrieval: vector, BM25, and hybrid RRF evaluation.
- Generation: Google Gemini via `google-genai`.
- API: FastAPI, with `GET /health` and `POST /retrieve`.
- Evaluation: 20 questions, with hybrid RRF achieving Recall@5 of 0.867 and MRR of 0.852 in the latest recorded run.
- Tests: six API tests passed in the latest recorded run.
- Remaining focus: legal evidence validation, citation checks, failure handling, and broader testing.
