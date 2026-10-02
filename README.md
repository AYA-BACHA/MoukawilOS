# MoukawilOS

MoukawilOS is a lightweight operational platform for Algerian digital and creative freelancers operating under the Auto-Entrepreneur framework.

## Project Status
**Pre-development / Sprint 0**

The repository is currently configured as a development skeleton. Feature implementation and business logic will begin following the team's Sprint 1 task-assignment meeting.

---

## High-Level Architecture

MoukawilOS is organized as a decoupled monorepo comprising three core services and a database management tier:

```text
┌────────────────────────────────────────────────────────┐
│                   Client (Next.js)                     │
│   Dashboard • Invoicing UI • Document Viewer • shadcn  │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       REST API │                        │ Auth / Direct Read
                ▼                        ▼
┌───────────────────────────┐    ┌───────────────────────┐
│     Server (Node.js)      │    │  Supabase PostgreSQL  │
│  API Orchestration • Auth ├───►│  RLS • pgvector Store │
└───────────────┬───────────┘    └───────────▲───────────┘
                │                            │
       Internal │                            │ Vector Search
        Service │                            │
                ▼                            │
┌───────────────────────────┐                │
│    RAG Service (Python)   ├────────────────┘
│  FastAPI • Embeddings     │
└───────────────────────────┘
```

- **Client (`client/`):** Next.js App Router frontend for user workflows, dashboard management, and client-side PDF document generation.
- **Server (`server/`):** Node.js & TypeScript REST API coordinating business processes, service integrations, and Supabase data access.
- **RAG Service (`rag/`):** Python / FastAPI microservice specialized in vector embeddings and regulatory knowledge retrieval.
- **Database (`database/`):** Centralized directory for PostgreSQL schemas, `pgvector` extensions, migrations, and seed scripts.

---

## Planned Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, `@react-pdf/renderer` |
| **Backend** | Node.js, TypeScript, REST API (Express), Supabase / PostgreSQL |
| **RAG Service** | Python, FastAPI, `pgvector`, LangChain |
| **Deployment (Target)** | Vercel (Client), Render / Fly.io (Server & RAG Service), Supabase Cloud |

---

## Repository Structure

```text
moukawilos/
├── client/                     # Next.js App Router frontend
│   ├── app/                    # App Router routes and pages
│   ├── components/             # Reusable UI components (shadcn/ui)
│   ├── lib/                    # Shared client utilities
│   ├── public/                 # Static assets
│   ├── types/                  # TypeScript types
│   ├── .env.example            # Client environment variables template
│   ├── next.config.mjs         # Next.js configuration
│   ├── package.json            # Client dependencies and scripts
│   ├── postcss.config.mjs      # PostCSS configuration
│   ├── tailwind.config.ts      # Tailwind CSS configuration
│   └── tsconfig.json           # Client TypeScript configuration
├── server/                     # Node.js / Express REST API
│   ├── src/
│   │   ├── config/             # Environment and client configurations
│   │   ├── controllers/        # Request handling logic
│   │   ├── middleware/         # Auth, validation, and error middlewares
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business services
│   │   ├── types/              # Server TypeScript definitions
│   │   ├── utils/              # Helper functions
│   │   └── index.ts            # Server entrypoint and healthcheck
│   ├── tests/                  # Backend unit and integration tests
│   ├── .env.example            # Server environment variables template
│   ├── package.json            # Server dependencies and scripts
│   └── tsconfig.json           # Server TypeScript configuration
├── rag/                        # Python / FastAPI RAG Microservice
│   ├── app/
│   │   ├── api/                # FastAPI endpoint routers
│   │   ├── models/             # Pydantic schemas and data models
│   │   ├── retrieval/          # pgvector retrieval and search logic
│   │   ├── services/           # Ingestion and embedding pipelines
│   │   ├── utils/              # Text processing and token helpers
│   │   └── main.py             # FastAPI entrypoint and healthcheck
│   ├── tests/                  # RAG service test suite
│   ├── .env.example            # RAG environment variables template
│   └── requirements.txt        # Python dependencies
├── database/                   # Database organization (PostgreSQL / Supabase)
│   ├── migrations/             # Incremental migration files
│   ├── schema/                 # DDL schemas and extension definitions
│   ├── seeds/                  # Initial seed data
│   └── README.md               # Database guidelines
├── docs/                       # Project and technical documentation
│   ├── api.md                  # API specifications
│   ├── architecture.md         # System architecture blueprint
│   ├── contributing.md         # Team contribution guidelines
│   ├── database.md             # Database schema documentation
│   ├── product.md              # Product specifications (Aya)
│   └── rag.md                  # RAG pipeline documentation
├── scripts/                    # Automation and tooling scripts
├── .github/                    # GitHub workflows and issue templates
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       └── ci.yml
├── .env.example                # Root environment variables template
├── .gitignore                  # Monorepo ignore rules
├── LICENSE                     # MIT License
└── README.md                   # Repository overview
```

---

## Team Roles

- **Aya** — Product Lead
- **Backend Developer 1** — Backend & Database Architecture
- **Backend Developer 2** — Backend Services & Integrations
- **Data/ML Developer 1** — RAG Pipeline & Ingestion
- **Data/ML Developer 2** — Vector Search & Model Integration

---

## Development Setup

> **Status:** Coming Soon — Complete environment setup and automated orchestration scripts will be finalized during Sprint 1.

### Running the Empty Skeletons (Preview)

#### 1. Client (`client/`)
```bash
cd client
npm install
npm run dev
# Running on http://localhost:3000
```

#### 2. Server (`server/`)
```bash
cd server
npm install
npm run dev
# Running on http://localhost:5000 (Health check: http://localhost:5000/health)
```

#### 3. RAG Service (`rag/`)
```bash
cd rag
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
python -m app.main
# Running on http://localhost:8000 (Health check: http://localhost:8000/health)
```

---

## Contribution Guidelines

> **Status:** Coming Soon — Team contribution workflows, branching strategy, and PR review standards will be finalized following Sprint 1 task assignments. See [`docs/contributing.md`](docs/contributing.md) for planned guidelines.
