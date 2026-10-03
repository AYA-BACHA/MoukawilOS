# MoukawilOS — Sprint 1 Execution Plan (Week 1: Foundations)

> **Sprint Duration:** Week 1 of 4  
> **Sprint Goal:** Establish complete technical foundations across all tiers (Database, Backend API, RAG Pipeline, and UX Direction) so that core feature implementation can proceed without architectural friction in Sprint 2.  
> **Sprint Rule:** Focus strictly on foundations and data structures. Do NOT attempt full feature completion or business logic polish in Sprint 1.

---

## Sprint 1 Task Allocation by Role

| Team Member / Role | Assigned Tasks | Backlog ID | Estimated Effort |
| :--- | :--- | :--- | :---: |
| **Aya** (Product Lead / UX) | UX Wireframes & Form Layouts | **P-01** | Medium |
| **Aya** (Product Lead / UX) | Standardized Algerian Invoice Design Spec | **P-02** | Small |
| **Backend Developer 1** | Core Database Schema & Migrations | **DB-01** | Medium |
| **Backend Developer 1** | Row-Level Security (RLS) Configuration | **DB-02** | Small |
| **Backend Developer 1** | TypeScript Calculation Engine Port | **BE-06** | Medium |
| **Backend Developer 2** | User Profile & Settings API | **BE-01** | Medium |
| **Backend Developer 2** | Client Management API | **BE-02** | Small |
| **Backend Developer 2** | Calculation Unit Test Suite Setup | **TEST-01** | Small |
| **Data/ML Developer 1** | Official Regulatory Corpus Collection | **ML-01** | Medium |
| **Data/ML Developer 1** | pgvector Database Extension & Table Setup | **DB-03** | Small |
| **Data/ML Developer 2** | Legal Text Chunking & Metadata Pipeline | **ML-02** | Medium |
| **Data/ML Developer 2** | Embedding Ingestion Runner Script | **ML-03** | Medium |

---

## Detailed Sprint 1 Task Breakdown

### 1. Product / UX Track (Aya)

#### [P-01] Finalize UX Wireframes & Form Layouts for Invoicing and Settings
- **Objective:** Create detailed wireframe specifications and field validation checklists for the Invoice Builder, Client Management form, and Settings screen.
- **Key Deliverables:** Field mapping checklist, wireframe blueprints, and responsive layout constraints documented in `docs/`.
- **Definition of Done:** All mandatory statutory fields (*Décret 05-468* and *Loi 22-23*) included and verified; reviewed with Backend and Frontend developers.

#### [P-02] Define Standardized Algerian Invoice & Credit Note Design Specification
- **Objective:** Finalize the precise typography, spacing, and legal footer texts for A4 invoice and credit note generation in `@react-pdf/renderer`.
- **Key Deliverables:** Invoice layout specification sheet including verbatim statutory notices in French and Arabic.
- **Definition of Done:** Complete verbatim French notice (*« Franchise de TVA — Article 282 sexies du CIDTA »*) and 10-year archiving notice documented and ready for `@react-pdf/renderer` implementation.

---

### 2. Backend & Database Track (Backend Developer 1 & 2)

#### [DB-01] Design Core Relational Database Schema for Freelancers, Clients, and Invoices
- **Objective:** Create initial PostgreSQL DDL migrations in `database/migrations/` for `profiles`, `clients`, `invoices`, `invoice_items`, `credit_notes`, and `payment_logs`.
- **Key Deliverables:** Executable SQL migration files in `database/migrations/001_initial_schema.sql`.
- **Definition of Done:** Tables instantiate cleanly in Supabase PostgreSQL; foreign keys, cascading constraints, and check constraints verified.

#### [DB-02] Configure Supabase Row-Level Security (RLS) Policies and User Isolation
- **Objective:** Apply PostgreSQL RLS policies to guarantee multi-tenant data isolation per authenticated freelancer.
- **Key Deliverables:** SQL migration in `database/migrations/002_rls_policies.sql`.
- **Definition of Done:** RLS enabled on all tables; cross-tenant query tests prove User A cannot access User B's records.

#### [BE-06] Implement Deterministic IFU Tax and CASNOS Calculation Engine
- **Objective:** Port verified calculation logic from `calc.js` into a robust TypeScript module in `backend/src/services/calc.ts`.
- **Key Deliverables:** `backend/src/services/calc.ts` supporting `computeIFU()`, `computeCasnos()`, and `thresholdStatus()`.
- **Definition of Done:** Matches all 12 baseline verification test cases; zero reliance on hardcoded external values.

#### [TEST-01] Port and Expand Deterministic Calculation Unit Test Suite
- **Objective:** Set up Jest/Node test runner in `backend/` and execute calculation unit tests.
- **Key Deliverables:** `backend/tests/calc.test.ts`.
- **Definition of Done:** `npm test` in `backend/` executes cleanly and outputs 100% pass on statutory calculation cases.

#### [BE-01] Implement User Profile & Freelancer Settings API
- **Objective:** Create Express routes (`GET /api/profile`, `PUT /api/profile`) for managing freelancer business information.
- **Key Deliverables:** `backend/src/controllers/profile.ts` and `backend/src/routes/profile.ts` with 15-digit NIF format validation.
- **Definition of Done:** Successfully stores and retrieves profile data against Supabase; rejects invalid NIF strings.

#### [BE-02] Implement Client Management API
- **Objective:** Create Express routes (`GET /api/clients`, `POST /api/clients`, `GET /api/clients/:id`) for client contact records.
- **Key Deliverables:** `backend/src/controllers/clients.ts` and `backend/src/routes/clients.ts`.
- **Definition of Done:** CRUD operations verified; client data isolated per authenticated freelancer.

---

### 3. Data / ML / RAG Track (Data/ML Developer 1 & 2)

#### [ML-01] Collect & Curate the Ground-Truth Algerian Regulatory Corpus
- **Objective:** Gather, verify, and store official texts: *Loi n° 22-23*, *Décrets exécutifs 23-196, 23-197, 15-289, 26-257, 05-468*, CIDTA articles, and official DGI circulars.
- **Key Deliverables:** Raw document repository in `rag/data/raw/` and manifest file `rag/data/manifest.json`.
- **Definition of Done:** Every document sourced directly from official JORADP gazette or ministry portals; manifest lists source URLs and verification status.

#### [DB-03] Set Up pgvector Extension and Vector Embeddings Table for RAG
- **Objective:** Enable `vector` extension in Supabase and create the `regulatory_documents` table with HNSW/IVFFlat index.
- **Key Deliverables:** SQL migration in `database/migrations/003_pgvector_setup.sql`.
- **Definition of Done:** PostgreSQL vector extension enabled; table successfully stores and queries dense vector embeddings.

#### [ML-02] Develop Legal Text Chunking, Metadata Extraction & Cleaning Pipeline
- **Objective:** Create an ingestion pipeline in `rag/app/services/ingestion.py` that chunks regulatory texts by legal article rather than arbitrary character splits.
- **Key Deliverables:** Python module `rag/app/services/ingestion.py`.
- **Definition of Done:** Produces clean text chunks attributed with law number, decree number, article number, and verification status.

#### [ML-03] Implement Embedding Generation & Vector Store Ingestion into pgvector
- **Objective:** Create runner script to encode legal chunks and insert them into Supabase `pgvector`.
- **Key Deliverables:** Ingestion runner `rag/app/services/indexer.py`.
- **Definition of Done:** All curated legal chunks converted to embeddings and stored in database; sample vector similarity query executes successfully.

---

## Sprint 1 Definition of Done

At the end of Sprint 1, the repository must demonstrate:
1. **Database:** Supabase PostgreSQL initialized with core relational tables, strict RLS policies, and `pgvector` enabled.
2. **Backend:** Profile and Client APIs functional; calculation engine ported to TypeScript with 100% automated test coverage.
3. **RAG Service:** Ground-truth Algerian legal corpus curated, chunked by article, and indexed into `pgvector`.
4. **Product:** Wireframes and invoice PDF layout specifications approved for implementation.
5. **No Features Yet:** Invoicing UI, Dashboard views, and chat interfaces remain unbuilt, ready for Sprint 2.
