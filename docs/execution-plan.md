# MoukawilOS — Team Execution Plan & Checklist

> **Single Source of Truth for Project Tasks & Progress**  
> **Status:** Sprint 0 Baseline — Ready for Sprint 1 Execution  
> **Priorities:** P0 = Required for MVP | P1 = Important | P2 = Polish / Optional  
> **Statuses:** `NOT STARTED` | `IN PROGRESS` | `BLOCKED` | `IN REVIEW` | `DONE`  

---

## A. Product / UX

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **UX-01** | Finalize form layouts & interaction states for invoice builder, client form, and settings | Aya | P0 | None | NOT STARTED | Follows Figma prototype |
| **UX-02** | Define standardized Algerian invoice & credit note layout specification | Aya | P0 | None | NOT STARTED | Required for `@react-pdf/renderer` |
| **UX-03** | Compile multilingual i18n copy dictionary (French default, Arabic with RTL, English) | Aya | P0 | None | NOT STARTED | Arabic legal terms from JORADP |
| **UX-04** | Formulate user validation interview guide & observation protocol | Aya | P1 | UX-01 | NOT STARTED | Target: 5–8 Algerian freelancers |
| **UX-05** | Design 80% threshold warning banner & ceiling exceedance visual states | Aya | P0 | None | NOT STARTED | Clear distinction between product alert & law |

---

## B. Frontend

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **FE-01** | Verify Next.js App Router scaffolding and baseline build integrity | | P0 | None | DONE | Verified in Sprint 0 |
| **FE-02** | Implement responsive Dashboard view (Turnover gauge, stat cards, obligations list) | | P0 | UX-01, BE-05 | NOT STARTED | Mirrors Figma layout |
| **FE-03** | Build Invoices List view with filter tabs (All, Draft, Pending/Issued, Paid, Credited) | | P0 | UX-01, BE-03 | NOT STARTED | Pending (UI) = ISSUED (Backend) |
| **FE-04** | Build Invoice Builder form with inline client selection & itemized row inputs | | P0 | UX-01, BE-03 | NOT STARTED | Real-time DZD totals |
| **FE-05** | Build Compliance & Simulator view (Statutory calendar & interactive calculation tool) | | P0 | BE-06, BE-07 | NOT STARTED | Includes informational disclaimer |
| **FE-06** | Build Regulatory Assistant chat interface with citation cards & status badges | | P0 | BE-08, ML-05 | NOT STARTED | Suggestion chips + fallback display |
| **FE-07** | Implement Settings view (Freelancer profile, 15-digit NIF, RNAE card, CASNOS regime) | | P0 | BE-01 | NOT STARTED | Client-side 15-digit NIF check |
| **FE-08** | Implement Arabic dynamic RTL layout switcher (`dir="rtl"`) | | P1 | UX-03 | NOT STARTED | Mirrors sidebar and data tables |

---

## C. Backend / Database

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **BE-01** | Verify Node.js / Express server scaffolding and `/health` verification endpoint | | P0 | None | DONE | Verified in Sprint 0 |
| **BE-02** | Author SQL DDL migrations for `profiles`, `clients`, `invoices`, `items`, `credit_notes` | | P0 | None | NOT STARTED | Foreign keys and status check enums |
| **BE-03** | Configure Supabase Row-Level Security (RLS) policies for strict tenant isolation | | P0 | BE-02 | NOT STARTED | Enforces user-isolated access |
| **BE-04** | Enable `pgvector` extension and create `regulatory_documents` table in PostgreSQL | | P0 | None | NOT STARTED | Cosine index on vector embedding |
| **BE-05** | Implement Freelancer Profile & Business Settings API (`GET/PUT /api/profile`) | | P0 | BE-02, BE-03 | NOT STARTED | Validates 15-digit NIF format |
| **BE-06** | Implement Client Management API (`GET/POST/PUT /api/clients`) | | P0 | BE-02, BE-03 | NOT STARTED | Scoped to authenticated user |
| **BE-07** | Seed database with approved ANAE activity nomenclature (Décret exécutif 23-197) | | P1 | BE-02 | NOT STARTED | 7 official activity branches |

---

## D. Invoice Engine

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **INV-01** | Implement thread-safe sequential invoice numbering (`FA-YYYY-NNN`) | | P0 | BE-02 | NOT STARTED | Gapless, resets per calendar year |
| **INV-02** | Implement invoice finalization endpoint transitioning `DRAFT` → `ISSUED` | | P0 | INV-01 | NOT STARTED | Locks invoice against modification |
| **INV-03** | Implement backend immutability enforcement (reject edit/delete on `ISSUED`/`PAID`) | | P0 | INV-02 | NOT STARTED | Returns HTTP 403 with legal message |
| **INV-04** | Implement "Record Payment" endpoint transitioning `ISSUED` → `PAID` | | P0 | INV-02 | NOT STARTED | Requires confirmation modal in UI |
| **INV-05** | Implement Credit Note (Avoir) creation endpoint (`AV-YYYY-NNN`) | | P0 | INV-03 | NOT STARTED | Decrements net collected revenue |
| **INV-06** | Implement cash-basis annual turnover aggregator (CIDTA art. 282 sexies) | | P0 | INV-04, INV-05| NOT STARTED | Only `PAID` invoices count |

---

## E. PDF Generation

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **PDF-01** | Create standardized Algerian invoice PDF document with `@react-pdf/renderer` | | P0 | UX-02 | NOT STARTED | Clean A4 layout |
| **PDF-02** | Embed verbatim mandatory Algerian statutory notices in invoice PDF footer | | P0 | PDF-01 | NOT STARTED | CIDTA art. 282 sexies VAT notice |
| **PDF-03** | Implement client-side PDF download trigger saving as `Facture_FA-YYYY-NNN.pdf` | | P0 | PDF-01 | NOT STARTED | Zero server dependency |
| **PDF-04** | Create Credit Note (Avoir) PDF template referencing parent invoice | | P1 | PDF-01, INV-05| NOT STARTED | Sequences as `Avoir_AV-YYYY-NNN.pdf`|

---

## F. Regulatory Corpus

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **COR-01**| Collect official legal texts: Loi 22-23, Décrets 23-196, 23-197, 15-289, 26-257, 05-468| | P0 | None | NOT STARTED | Official JORADP gazette sources |
| **COR-02**| Collect official tax articles: CIDTA art. 282 quater, sexies, 365, 365 bis, DGI circulars | | P0 | None | NOT STARTED | Ministry of Finance circulars |
| **COR-03**| Create corpus manifest file documenting source URL, gazette date, and verification status | | P0 | COR-01, COR-02| NOT STARTED | `rag/data/manifest.json` |
| **COR-04**| Review corpus with certified accountant or legal advisor | | P1 | COR-03 | NOT STARTED | Confirms accuracy of indexed texts |

---

## G. RAG Service

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **RAG-01**| Verify FastAPI microservice scaffolding and `/health` verification endpoint | | P0 | None | DONE | Verified in Sprint 0 |
| **RAG-02**| Develop legal text chunker splitting documents by Article / Section | | P0 | COR-03 | NOT STARTED | Preserves parent law metadata |
| **RAG-03**| Implement embedding runner script storing vector representations in `pgvector` | | P0 | BE-04, RAG-02 | NOT STARTED | Multilingual dense embeddings |
| **RAG-04**| Implement semantic vector search module with cosine distance ranking | | P0 | RAG-03 | NOT STARTED | Target latency < 300ms |
| **RAG-05**| Build grounded Q&A generation endpoint (`POST /query`) with strict citation prompting | | P0 | RAG-04 | NOT STARTED | Rejects out-of-context answers |
| **RAG-06**| Implement intellectual honesty fallback trigger for out-of-scope legal topics | | P0 | RAG-05 | NOT STARTED | Redirects to DGI/ANAE/CASNOS |
| **RAG-07**| Benchmark retrieval precision and answer faithfulness against 25 golden questions | | P1 | RAG-05 | NOT STARTED | Golden Q&A test harness |

---

## H. Deterministic Calculations

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **CALC-01**| Port verified IFU calculation logic to TypeScript (`backend/src/services/calc.ts`) | | P0 | None | NOT STARTED | 0.5% rate with 10k DZD statutory floor |
| **CALC-02**| Port CASNOS calculation (24k DZD flat vs. 15% general bounded by 43.2k and 864k DZD) | | P0 | None | NOT STARTED | Décret exécutif 26-257 |
| **CALC-03**| Implement 5M DZD ceiling status, 80% alert threshold, and consecutive-year counter | | P0 | None | NOT STARTED | Loi 22-23 art. 13-14 |
| **CALC-04**| Build statutory obligations calendar generator with dynamic relative statuses | | P0 | None | NOT STARTED | G12, CASNOS, G12 bis deadlines |
| **CALC-05**| Create unit test suite verifying all 12 baseline statutory test cases | | P0 | CALC-01..04 | NOT STARTED | 100% pass required in CI |

---

## I. Integration

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **INT-01**| Connect Dashboard frontend to turnover aggregator & statutory calendar APIs | | P0 | FE-02, BE-05 | NOT STARTED | Real-time ceiling updates |
| **INT-02**| Connect Invoice Builder to sequential invoicing API and client autocomplete | | P0 | FE-04, INV-02 | NOT STARTED | Full invoice creation flow |
| **INT-03**| Connect Invoices List to "Record Payment" modal with confirmation | | P0 | FE-03, INV-04 | NOT STARTED | Enforces locked -> paid state |
| **INT-04**| Connect Invoices List to Credit Note creation modal | | P0 | FE-03, INV-05 | NOT STARTED | Enforces avoir link |
| **INT-05**| Connect Regulatory Assistant UI to Backend proxy (`POST /api/assistant/query`) | | P0 | FE-06, RAG-05 | NOT STARTED | Renders citation tags |
| **INT-06**| Connect Settings UI to Profile update API with 15-digit NIF validation | | P0 | FE-07, BE-05 | NOT STARTED | Profile completion prerequisite |

---

## J. Testing / QA

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **QA-01** | Execute automated calculation unit tests (`npm test` in `backend/`) | | P0 | CALC-05 | NOT STARTED | Must pass 12/12 test cases |
| **QA-02** | Execute invoicing immutability integration tests (confirm 403 on edit of issued/paid) | | P0 | INV-03 | NOT STARTED | Confirms legal compliance |
| **QA-03** | Run end-to-end smoke test of complete freelancer journey across viewports | | P1 | INT-01..06 | NOT STARTED | Profile -> Invoice -> PDF -> Payment |
| **QA-04** | Verify that no secrets or real API keys exist in git history or tracked files | | P0 | None | DONE | Verified in Sprint 0 |

---

## K. Deployment / Demo

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **DEP-01**| Deploy Next.js frontend to Vercel staging environment | | P1 | INT-01..04 | NOT STARTED | Staging URL |
| **DEP-02**| Deploy Express backend & FastAPI RAG service to Render / Fly.io | | P1 | INT-05 | NOT STARTED | Secure internal microservice networking |
| **DEP-03**| Connect production Supabase project with environment variables | | P1 | DEP-01, DEP-02| NOT STARTED | Production database & pgvector |
| **DEP-04**| Prepare project demo scenario highlighting statutory compliance features | Aya | P0 | QA-03 | NOT STARTED | Demo walkthrough script |

---

## L. Documentation

| ID | Task | Owner | Priority | Dependency | Status | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **DOC-01**| Maintain canonical Developer Handoff document (`docs/developer-handoff.md`) | Aya | P0 | None | DONE | Created in Sprint 0 |
| **DOC-02**| Maintain canonical Execution Plan (`docs/execution-plan.md`) | Aya | P0 | None | DONE | Created in Sprint 0 |
| **DOC-03**| Maintain canonical Legal Sources matrix (`docs/legal-sources.md`) | Aya | P0 | None | DONE | Created in Sprint 0 |
| **DOC-04**| Document REST API contracts (`docs/api.md`) | | P0 | BE-05, INV-02 | NOT STARTED | Keep synchronized with routes |
| **DOC-05**| Document Supabase database schema & RLS rules (`docs/database.md`) | | P0 | BE-02, BE-03 | NOT STARTED | Keep synchronized with migrations |
| **DOC-06**| Document RAG architecture & retrieval pipelines (`docs/rag.md`) | | P0 | RAG-03, RAG-05 | NOT STARTED | Keep synchronized with RAG code |
