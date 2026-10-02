# MoukawilOS — RAG Service

FastAPI-based microservice for regulatory retrieval, document processing, and context augmentation for MoukawilOS.

> **Status:** Pre-development / Sprint 0 — Minimal technical skeleton configured. RAG pipelines, chunking, embeddings, and vector database integrations will be implemented by the Data/ML team.

## Directory Structure
- `app/api/`: FastAPI route handlers and request routers.
- `app/services/`: Core logic for document ingestion and embedding services.
- `app/retrieval/`: Vector search and similarity retrieval interfaces.
- `app/models/`: Pydantic request/response data models.
- `app/utils/`: Text processing, token counters, and helper utilities.
- `tests/`: Automated unit and integration tests.

## Running Locally

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   # source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. Verify health check:
   ```
   GET http://localhost:8000/health
   ```
