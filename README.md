# MoukawilOS

MoukawilOS is a lightweight operational platform for Algerian digital/creative freelancers operating under the Auto-Entrepreneur framework.

## Current Status
**Pre-development / Sprint 0**

Implementation begins after the Sprint 1 task assignment meeting. All directories and documentation structures are prepared for team onboarding.

## Project Goals
- **Operational Efficiency:** Streamline day-to-day administrative, project, and financial workflows for Algerian independent creators and digital freelancers.
- **Regulatory Alignment:** Simplify compliance and record-keeping under Algeria's Auto-Entrepreneur legal framework.
- **Document & AI Workflows:** Enable rapid invoice and document generation, backed by an intelligent RAG assistant for regulatory and operational inquiries.
- **Modular Monorepo:** Maintain clean separation of concerns across client application, database persistence, and AI/vector services.

## Planned Stack
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + `@react-pdf/renderer`
- **Backend / Database:** Supabase PostgreSQL + Supabase Auth + `pgvector`
- **RAG Service:** Python + FastAPI
- **RAG / Vector Search:** `pgvector`
- **Deployment (Target):** Vercel (Frontend) + Render / Fly.io (RAG / Backend services)

## Repository Structure
```text
moukawilos/
├── frontend/          # Next.js web application
├── backend/           # Supabase database schemas, configs, and migrations
├── rag/               # FastAPI RAG microservice and vector retrieval
├── docs/              # Team documentation and architecture blueprints
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── rag.md
│   ├── product.md
│   └── contributing.md
├── .gitignore         # Git ignore rules for Node.js, Python, env, IDEs, and OS files
├── LICENSE            # MIT License
└── README.md          # Repository overview and guidelines
```

## Team Roles
- **Aya** — Product Lead
- **Backend Developer 1** — Backend & Database Architecture
- **Backend Developer 2** — Backend Services & Integrations
- **Data/ML Developer 1** — RAG Pipeline & Ingestion
- **Data/ML Developer 2** — Vector Search & Model Integration

## Local Setup
*Coming soon — Setup steps and environment configuration will be added upon Sprint 1 kickoff.*
