# MoukawilOS

> **A lightweight operational platform for Algerian digital and creative freelancers operating under the Auto-Entrepreneur framework (*Loi n° 22-23*).**

---

## 1. Project Status

**Pre-development / Sprint 0 → ready for implementation.**

The technical skeleton, monorepo architecture, canonical product direction, Figma prototype alignment, developer handoff, and execution backlog have been finalized. Feature implementation will begin immediately following team sprint task assignments.

---

## 2. Canonical Documentation Index

All technical, product, and regulatory specifications are consolidated in `docs/`:

- **Product Specifications** → [`docs/product.md`](docs/product.md)
- **Architecture Overview** → [`docs/architecture.md`](docs/architecture.md)
- **Developer Handoff** → [`docs/developer-handoff.md`](docs/developer-handoff.md)
- **Execution Plan & Backlog** → [`docs/execution-plan.md`](docs/execution-plan.md)
- **API Contracts & Endpoints** → [`docs/api.md`](docs/api.md)
- **Database Schema & RLS** → [`docs/database.md`](docs/database.md)
- **Regulatory RAG Service** → [`docs/rag.md`](docs/rag.md)
- **Legal & Regulatory Sources** → [`docs/legal-sources.md`](docs/legal-sources.md)
- **Contributing & Git Workflow** → [`docs/contributing.md`](docs/contributing.md)

---

## 3. System Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                   │
│   Next.js App Router • TypeScript • Tailwind • shadcn  │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       REST API │                        │ Direct Auth / RLS
                ▼                        ▼
┌───────────────────────────┐    ┌───────────────────────┐
│     Backend (Node.js)     │    │  Supabase PostgreSQL  │
│ Express • TypeScript • API ├───►│  RLS • pgvector Store │
└───────────────┬───────────┘    └───────────▲───────────┘
                │                            │
  Internal HTTP │                            │ Vector Search
        Service │                            │
                ▼                            │
┌───────────────────────────┐                │
│    RAG Service (Python)   ├────────────────┘
│ FastAPI • Grounded Q&A    │
└───────────────────────────┘
```

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, `@react-pdf/renderer` (client-side PDF generation).
- **Backend:** Node.js, Express, TypeScript (deterministic calculations, sequence generation, API gateway).
- **Database:** Supabase managed PostgreSQL 15+, Row-Level Security (RLS), `pgvector` extension.
- **RAG Microservice:** Python 3.13, FastAPI, Uvicorn, LangChain / Pydantic.
- **Target Deployment:** Vercel (Frontend), Render / Fly.io (Backend & RAG), Supabase Cloud (Database).

---

## 4. Repository Structure

```text
moukawilos/
├── frontend/             # Next.js App Router web application
│   ├── app/              # Routes & layouts
│   ├── components/       # UI & design system components
│   ├── lib/              # Client utilities & helpers
│   ├── public/           # Static assets
│   └── types/            # TypeScript interfaces
├── backend/              # Node.js & TypeScript REST API service
│   ├── src/
│   │   ├── config/       # Environment & DB configurations
│   │   ├── controllers/  # Route controller handlers
│   │   ├── middleware/   # Auth & validation middleware
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Pure business & calc logic
│   │   ├── types/        # Domain type definitions
│   │   └── utils/        # Shared helpers
│   └── tests/            # Test suite (Jest)
├── rag/                  # Python & FastAPI RAG microservice
│   ├── app/
│   │   ├── api/          # FastAPI endpoint routers
│   │   ├── models/       # Pydantic data schemas
│   │   ├── retrieval/    # Vector similarity search
│   │   └── services/     # LLM orchestration & prompt guards
│   ├── corpus/           # Curated legal gazettes & laws
│   └── tests/            # Retrieval benchmark suite
├── database/             # PostgreSQL migrations, schema, and seed scripts
├── docs/                 # Single source of truth canonical documentation
├── project-management/   # Execution checklists & team resources
├── scripts/              # Development orchestration scripts
├── .github/              # Issue templates and CI workflows
├── .env.example          # Environment variable template
├── .gitignore            # Monorepo ignore rules
└── README.md             # Project overview & quick start
```

---

## 5. Team & Responsibilities

- **Aya** — Product Lead & UX
- **Backend Developer 1** — Auth, Profiles, Sequence Numbering, Invoicing API
- **Backend Developer 2** — Deterministic Calculations, Compliance Calendar, Turnover Analytics
- **Data/ML Developer 1** — Legal Corpus Ingestion, Chunking Pipeline, Embedding Model
- **Data/ML Developer 2** — pgvector Retrieval, FastAPI Microservice, Prompt Guardrails

---

## 6. How the Team Works & How to Find Tasks

1. **Find Your Tasks:**
   - Tasks are tracked in the [GitHub Issues](https://github.com/AYA-BACHA/MoukawilOS/issues) board and detailed in [`docs/execution-plan.md`](docs/execution-plan.md).
   - Tasks are prioritized as **P0** (MVP Required), **P1** (Important), or **P2** (Polish).
2. **Execution Plan:**
   - Organized across workstreams A through L (Product, Frontend, Backend, Invoicing, PDF, Legal Corpus, RAG, Deterministic Calculations, Integration, QA, Deployment, Docs).
3. **Canonical Rules:**
   - Invoices follow strict canonical states: `DRAFT` → `ISSUED` (UI: `Pending`) → `PAID`.
   - `PAID` invoices are **100% immutable**; editing is strictly prohibited.
   - All legal numbers (IFU 0.5%, CASNOS 24,000 DA, 5M ceiling) are deterministic and sourced from [`docs/legal-sources.md`](docs/legal-sources.md).

---

## 7. Development & Git Workflow

We follow a lightweight, branch-and-PR workflow (see [`docs/contributing.md`](docs/contributing.md)):

```text
main
  │
  ▼
feature branch (e.g., feature/invoice-editor)
  │
  ▼
implementation (focused commits + local tests)
  │
  ▼
pull request (PR linked to GitHub Issue)
  │
  ▼
peer review & approval
  │
  ▼
merge into main
```

### Sensible Branch Naming:
- `feature/invoice-editor`
- `feature/rag-retrieval`
- `feature/dashboard`
- `fix/invoice-numbering`

### Team Rules:
- Work strictly from assigned GitHub Issues.
- Create a dedicated feature branch for each issue.
- Keep commits focused and descriptive.
- Open a Pull Request referencing the issue (e.g., `Closes #14`).
- Request a peer review before merging.
- **Never push experimental or unverified work directly to `main`.**

---

## 8. Local Setup & Running Locally

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000 (Health check: http://localhost:5000/health)
```

### 3. RAG Service
```bash
cd rag
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Running on http://localhost:8000 (Health check: http://localhost:8000/health)
```

---

## 9. How to Contribute

See [`docs/contributing.md`](docs/contributing.md) for full contribution guidelines, PR conventions, and the Definition of Done.
