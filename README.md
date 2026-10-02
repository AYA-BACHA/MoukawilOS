# MoukawilOS

A lightweight operational platform for Algerian digital and creative freelancers operating under the Auto-Entrepreneur framework.

## Status

**Pre-development / Sprint 0**

The technical skeleton has been initialized. Application features, business logic, and UI screens will be developed following the team's Sprint 1 task assignments.

---

## Architecture

```text
┌─────────────────┐
│    FRONTEND     │
│    Next.js      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     BACKEND     │
│ Node/TypeScript │
└───────┬─┬───────┘
        │ │
┌───────┘ └───────┐
▼                 ▼
┌─────────────┐   ┌─────────────┐
│  Supabase / │   │ RAG SERVICE │
│ PostgreSQL  │   │Python/FastAPI│
└─────────────┘   └─────────────┘
```

The system architecture follows a decoupled flow:
- **Frontend → Backend:** The Next.js client communicates with the Node.js / TypeScript API server.
- **Backend → Database:** The backend interacts with Supabase / PostgreSQL for transactional persistence and access controls.
- **Backend → RAG Service:** The backend routes regulatory intelligence and context retrieval requests to the dedicated Python/FastAPI RAG microservice.

---

## Technology Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- TypeScript
- Express / Fastify (REST API)

### Database
- Supabase
- PostgreSQL
- `pgvector` (planned)

### RAG Service
- Python
- FastAPI
- `pgvector` (planned)
- Embeddings (planned)
- LangChain (if required later)

---

## Repository Structure

```text
moukawilos/
├── frontend/          # Next.js App Router web application
├── backend/           # Node.js & TypeScript REST API service
├── rag/               # Python & FastAPI retrieval-augmented generation microservice
├── database/          # Database migrations, raw schema definitions, and seed scripts
├── docs/              # Specifications, API contracts, and team guidelines
├── scripts/           # Automation and dev orchestration tooling
├── .github/           # GitHub Actions workflows and issue templates
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── .env.example       # Root environment variable names template
├── .gitignore         # Monorepo-wide ignore rules
├── LICENSE            # License placeholder
└── README.md          # Project overview and setup documentation
```

### Purpose of Directories
- **`frontend/`**: Hosts the client-side Next.js web application, standard App Router structure (`app/`, `components/`, `lib/`, `public/`, `types/`).
- **`backend/`**: Hosts the core REST API backend (`src/config/`, `controllers/`, `routes/`, `services/`, `middleware/`, `utils/`, `types/`, and `tests/`).
- **`rag/`**: Hosts the Python/FastAPI microservice for regulatory knowledge ingestion, embeddings, and vector search (`app/api/`, `services/`, `retrieval/`, `models/`, `utils/`, and `tests/`).
- **`database/`**: Dedicated folder for organizing database assets (`migrations/`, `schema/`, `seeds/`). No active schema or tables exist yet.
- **`docs/`**: Central knowledge base for architecture, API specs, database design, RAG documentation, product vision, and contributing guides.
- **`scripts/`**: Repository tooling, automation, and cross-service orchestration scripts.

---

## Team

- **Aya** — Product Lead
- **Backend Developer 1**
- **Backend Developer 2**
- **Data/ML Developer 1**
- **Data/ML Developer 2**

---

## Development

Instructions for starting each service locally:

### 1. Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:3000
```

### 2. Backend (`backend/`)
```bash
cd backend
npm install
npm run dev
# Starts on http://localhost:5000 (Health check: http://localhost:5000/health)
```

### 3. RAG Service (`rag/`)
```bash
cd rag
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Starts on http://localhost:8000 (Health check: http://localhost:8000/health)
```

---

## Additional Information

- **Full Application Implementation:** *Coming soon* (Sprint 1)
- **Database Migrations & Seed Data:** *Coming soon*
- **RAG Pipeline & Embeddings:** *Coming soon*
- **Contribution Guidelines:** *Coming soon* (See [`docs/contributing.md`](docs/contributing.md))
- **Production Deployment CI/CD:** *Coming soon*
