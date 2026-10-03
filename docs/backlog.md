# MoukawilOS — Project Development Backlog

> **Status:** Sprint 0 Baseline Backlog  
> **Target Scope:** 4-Week MVP Execution  
> **Team Structure:** 5-person engineering team  
> - **Product / UX / Coordination:** Aya (Product Lead)  
> - **Backend Engineering:** Backend Developer 1, Backend Developer 2  
> - **Data / ML / RAG Engineering:** Data/ML Developer 1, Data/ML Developer 2  

---

## Summary of Backlog Tasks by Workstream

| Workstream | P0 (MVP Critical) | P1 (Important Secondary) | Total Tasks |
| :--- | :---: | :---: | :---: |
| **PRODUCT / UX** | 3 | 1 | 4 |
| **DATABASE** | 3 | 1 | 4 |
| **BACKEND** | 8 | 0 | 8 |
| **DATA / ML / RAG** | 5 | 1 | 6 |
| **INTEGRATION** | 4 | 1 | 5 |
| **TESTING** | 2 | 1 | 3 |
| **DEPLOYMENT** | 0 | 1 | 1 |
| **TOTAL** | **25** | **6** | **31** |

---

## 1. PRODUCT / UX WORKSTREAM

### Task ID: P-01
- **Title:** Finalize UX Wireframes & Form Layouts for Invoicing and Settings
- **Workstream:** PRODUCT / UX
- **Priority:** P0
- **Description:** Design clean, ergonomic form layouts and interaction states for the invoice creation modal, client management form, settings profile, and the main dashboard. Ensure all required statutory fields (15-digit NIF, ANAE card number, approved activity dropdown) have intuitive user guidance.
- **Deliverable:** Wireframe specifications, form field checklist, and layout guides in `docs/` or Figma design artifact.
- **Dependencies:** None
- **Definition of Done:** Detailed layout specs reviewed with Frontend developers; all mandatory fields from Décret 05-468 and Loi 22-23 included; responsive design considerations documented.
- **Estimated Effort:** Medium

### Task ID: P-02
- **Title:** Define Standardized Algerian Invoice & Credit Note Design Specification
- **Workstream:** PRODUCT / UX
- **Priority:** P0
- **Description:** Specify the exact visual presentation and typographic hierarchy for the generated A4 invoice and credit note (avoir). Detail seller box, client box, invoice metadata, itemized table in DZD, and the mandatory legal footer texts (VAT exemption per CIDTA art. 282 sexies, 10-year archiving notice).
- **Deliverable:** Visual layout blueprint document detailing typography, spacing, and legal footer formatting for `@react-pdf/renderer`.
- **Dependencies:** None
- **Definition of Done:** Specification contains exact text strings in French and Arabic; complies with Décret 05-468 requirements; approved for implementation in `@react-pdf/renderer`.
- **Estimated Effort:** Small

### Task ID: P-03
- **Title:** Prepare Multilingual Copy & i18n Dictionary (FR, AR with RTL, EN)
- **Workstream:** PRODUCT / UX
- **Priority:** P0
- **Description:** Centralize all user-facing labels, tooltips, validation messages, legal disclaimers, and statutory status badges into structured dictionary files for French (default), Arabic, and English. Ensure Arabic strings maintain accurate legal terminology aligned with official Algerian Arabic gazette texts.
- **Deliverable:** JSON/TypeScript dictionary files (`frontend/lib/i18n/`) with complete translations for all MVP screens.
- **Dependencies:** None
- **Definition of Done:** Zero hard-coded text in future UI components; Arabic translations verified against official JORADP terminology; RTL layout orientation instructions provided.
- **Estimated Effort:** Medium

### Task ID: P-04
- **Title:** Establish User Research & Usability Validation Protocol
- **Workstream:** PRODUCT / UX
- **Priority:** P1
- **Description:** Develop an interview guide and interactive testing protocol to evaluate the usability of the invoice builder, ceiling warning indicators, and regulatory assistant with real Algerian freelancers.
- **Deliverable:** `docs/validation-plan.md` updated with structured testing scripts and observation rubrics.
- **Dependencies:** P-01
- **Definition of Done:** Testing protocol contains explicit pass/fail criteria for usability, 5 scenario tasks, and recruit profiles for freelancers under the ANAE framework.
- **Estimated Effort:** Small

---

## 2. DATABASE WORKSTREAM

### Task ID: DB-01
- **Title:** Design Core Relational Database Schema for Freelancers, Clients, and Invoices
- **Workstream:** DATABASE
- **Priority:** P0
- **Description:** Author SQL DDL migrations defining tables for `profiles` (NIF, ANAE card number, activity, address, CASNOS regime), `clients` (name, address, NIF), `invoices` (sequential number, date, due date, status, total_amount), `invoice_items` (description, quantity, unit_price), `credit_notes` (linked invoice, reason, amount), and `payment_logs`.
- **Deliverable:** Incremental migration scripts in `database/migrations/` and documented schema diagram in `docs/database.md`.
- **Dependencies:** None
- **Definition of Done:** Schema scripts execute cleanly on PostgreSQL / Supabase; foreign key constraints and checks (e.g. non-negative amounts, status enum) verified; immutability rules supported.
- **Estimated Effort:** Medium

### Task ID: DB-02
- **Title:** Configure Supabase Row-Level Security (RLS) Policies and User Isolation
- **Workstream:** DATABASE
- **Priority:** P0
- **Description:** Implement strict Row-Level Security (RLS) policies on all tables (`profiles`, `clients`, `invoices`, `invoice_items`, `credit_notes`, `payment_logs`) ensuring that authenticated users can strictly access, insert, or modify only their own business records.
- **Deliverable:** SQL migration in `database/migrations/` applying `ENABLE ROW LEVEL SECURITY` and policies for `SELECT`, `INSERT`, `UPDATE`.
- **Dependencies:** DB-01
- **Definition of Done:** RLS policies verified by automated or manual tests; authenticated User A cannot query or mutate User B's records under any circumstances.
- **Estimated Effort:** Small

### Task ID: DB-03
- **Title:** Set Up pgvector Extension and Vector Embeddings Table for RAG
- **Workstream:** DATABASE
- **Priority:** P0
- **Description:** Enable the `vector` extension in PostgreSQL and create the `regulatory_documents` table with fields: `id`, `title`, `source_type` (Loi, Décret, Guide DGI, etc.), `legal_reference` (Article, Law #), `verification_status` (verified-official, secondary-only, etc.), `content`, and `embedding vector(1536)` (or model dimension), along with an HNSW or IVFFlat index.
- **Deliverable:** SQL migration script in `database/migrations/` setting up pgvector and vector similarity indices.
- **Dependencies:** None
- **Definition of Done:** `vector` extension successfully created in Supabase PostgreSQL; table supports vector insertion and cosine similarity queries (`<->`).
- **Estimated Effort:** Small

### Task ID: DB-04
- **Title:** Create Initial Seed Data with Verified Algerian Nomenclature & Tax Rates
- **Workstream:** DATABASE
- **Priority:** P1
- **Description:** Provide SQL seed scripts in `database/seeds/` populating reference datasets: approved ANAE activity categories (from Décret exécutif 23-197), standard administrative deadlines, and statutory default rules.
- **Deliverable:** SQL file `database/seeds/initial_statutory_data.sql`.
- **Dependencies:** DB-01
- **Definition of Done:** Seed script runs idempotently without violating constraints; correctly populates all 7 approved ANAE activity branches.
- **Estimated Effort:** Small

---

## 3. BACKEND WORKSTREAM

### Task ID: BE-01
- **Title:** Implement User Profile & Freelancer Settings API
- **Workstream:** BACKEND
- **Priority:** P0
- **Description:** Create REST endpoints (`GET /api/profile`, `PUT /api/profile`) in Express to manage the freelancer's identity details: full name, business address, approved activity code, 15-digit NIF, RNAE card registration number, and CASNOS regime choice. Include validation middleware for the 15-digit NIF format.
- **Deliverable:** Profile controller, route, and validator in `backend/src/controllers/profile.ts` and `backend/src/routes/profile.ts`.
- **Dependencies:** DB-01, DB-02
- **Definition of Done:** Endpoints reject invalid NIF formats; successfully persist and retrieve profile data; authenticated via Supabase user token.
- **Estimated Effort:** Medium

### Task ID: BE-02
- **Title:** Implement Client Management API
- **Workstream:** BACKEND
- **Priority:** P0
- **Description:** Create REST endpoints (`GET /api/clients`, `POST /api/clients`, `GET /api/clients/:id`, `PUT /api/clients/:id`) to create, list, and update client records (name, address, business NIF).
- **Deliverable:** Client controller and route definitions in `backend/src/controllers/clients.ts` and `backend/src/routes/clients.ts`.
- **Dependencies:** DB-01, DB-02
- **Definition of Done:** CRUD operations verified; client data isolated per authenticated freelancer; payload validation rejects empty client names.
- **Estimated Effort:** Small

### Task ID: BE-03
- **Title:** Implement Sequential Invoicing & Immutability Enforcement Engine
- **Workstream:** BACKEND
- **Priority:** P0
- **Description:** Develop the invoice creation service (`POST /api/invoices`, `GET /api/invoices`, `GET /api/invoices/:id`). Implement gapless, thread-safe chronological numbering in the format `FA-YYYY-NNN` resetting each calendar year. Strictly enforce immutability: once status is `pending` or `paid`, any `PUT`, `PATCH`, or `DELETE` attempt on the invoice must return HTTP 403 / 400 with a legal compliance error message.
- **Deliverable:** Invoice service and controller in `backend/src/services/invoice.ts` and `backend/src/controllers/invoice.ts`.
- **Dependencies:** DB-01, BE-01, BE-02
- **Definition of Done:** Numbering generates incrementing sequence with zero gaps; finalized invoices cannot be modified or deleted via any endpoint; invoice creation verifies that seller NIF and ANAE card exist in profile.
- **Estimated Effort:** Large

### Task ID: BE-04
- **Title:** Implement Credit Notes (Factures d'Avoir) API
- **Workstream:** BACKEND
- **Priority:** P0
- **Description:** Create endpoints (`POST /api/invoices/:id/credit-note`, `GET /api/credit-notes`) to issue formal credit notes against finalized invoices per Décret exécutif 05-468. Enforce sequential numbering (`AV-YYYY-NNN`) and automatically record the adjustment reference to the original invoice.
- **Deliverable:** Credit note controller and routes in `backend/src/controllers/creditNote.ts` and `backend/src/routes/creditNote.ts`.
- **Dependencies:** BE-03
- **Definition of Done:** Credit notes can only be issued against finalized invoices; sequence increments cleanly (`AV-2026-001`); updates invoice status to `credited` if 100% credited.
- **Estimated Effort:** Medium

### Task ID: BE-05
- **Title:** Implement Payment Recording & Cash-Basis Turnover Aggregator
- **Workstream:** BACKEND
- **Priority:** P0
- **Description:** Create endpoints (`POST /api/invoices/:id/payment`, `GET /api/analytics/turnover`) to record customer payments (date, payment method: Virement, Chèque, Espèces, CCP). Aggregate annual turnover strictly on a cash-collected basis (only `paid` invoices minus credited amounts) per CIDTA art. 282.
- **Deliverable:** Payment controller and turnover service in `backend/src/services/turnover.ts`.
- **Dependencies:** BE-03, BE-04
- **Definition of Done:** Unpaid or pending invoices do not count toward collected turnover; credit notes reduce net turnover; turnover total returns accurate figures for the active year.
- **Estimated Effort:** Medium

### Task ID: BE-06
- **Title:** Implement Deterministic IFU Tax and CASNOS Calculation Engine
- **Workstream:** BACKEND
- **Priority:** P0
- **Description:** Port and implement the verified calculation logic from `calc.js` into a robust TypeScript calculation service in `backend/src/services/calc.ts`. Implement:
  1. IFU: `Max(10,000 DZD, Turnover * 0.005)` with split installment schedule (50%, 25%, 25%).
  2. CASNOS: Flat 24,000 DZD or 15% general regime clamped between 43,200 DZD and 864,000 DZD.
  3. Threshold tracking: 5M DZD ceiling, 80% warning (4M DZD), and consecutive-year counter.
- **Deliverable:** TypeScript calculation service and unit tests in `backend/src/services/calc.ts` and `backend/tests/calc.test.ts`.
- **Dependencies:** None
- **Definition of Done:** 100% unit test pass rate matching the 12 verified baseline test cases; zero reliance on hardcoded external values.
- **Estimated Effort:** Medium

### Task ID: BE-07
- **Title:** Implement Administrative Obligations Calendar Service
- **Workstream:** BACKEND
- **Priority:** P0
- **Description:** Create endpoint (`GET /api/compliance/calendar`) that returns the official Algerian statutory calendar for the auto-entrepreneur (NIF within 30 days, G12 by June 30, CASNOS by June 30, G12 bis by Jan 20 N+1) with calculated dynamic statuses (`Accomplie`, `Dans X jours`, `En retard`, `À venir`) relative to the current server date.
- **Deliverable:** Calendar controller and route in `backend/src/controllers/calendar.ts`.
- **Dependencies:** BE-06
- **Definition of Done:** Returns correct chronological dates for any requested year; zero fictional quarterly CASNOS deadlines; attaches verified legal references to each deadline.
- **Estimated Effort:** Small

### Task ID: BE-08
- **Title:** Implement Backend Proxy Route to RAG Microservice
- **Workstream:** BACKEND
- **Priority:** P0
- **Description:** Create an authenticated API endpoint (`POST /api/assistant/query`) that validates user input, forwards the query to the FastAPI RAG service (`rag/`) over internal HTTP, receives the grounded answer with citations and status badges, and returns the structured payload to the client.
- **Deliverable:** Assistant proxy controller in `backend/src/controllers/assistant.ts`.
- **Dependencies:** ML-04
- **Definition of Done:** Verifies user authentication; cleanly handles RAG service timeouts or errors; passes query and receives structured response payload.
- **Estimated Effort:** Small

---

## 4. DATA / ML / RAG WORKSTREAM

### Task ID: ML-01
- **Title:** Collect & Curate the Ground-Truth Algerian Regulatory Corpus
- **Workstream:** DATA / ML / RAG
- **Priority:** P0
- **Description:** Gather and structure official PDF/text documents representing Algerian auto-entrepreneur law: *Loi n° 22-23*, *Décret exécutif n° 23-196*, *Décret exécutif n° 23-197*, *Décret exécutif n° 15-289*, *Décret exécutif n° 26-257*, *Décret exécutif n° 05-468*, relevant articles of CIDTA (*art. 282 quater, sexies, 365, 365 bis*), and official DGI circulars.
- **Deliverable:** Curated documents directory `rag/data/raw/` with a manifest tracking document title, official gazette reference, date, and verification status.
- **Dependencies:** None
- **Definition of Done:** Every document sourced directly from official gazette (JORADP) or ministry portals; manifest lists source URLs; zero unverified blog texts included.
- **Estimated Effort:** Medium

### Task ID: ML-02
- **Title:** Develop Legal Text Chunking, Metadata Extraction & Cleaning Pipeline
- **Workstream:** DATA / ML / RAG
- **Priority:** P0
- **Description:** Implement a specialized document processing script in `rag/app/services/ingestion.py` that parses legal texts, splits them into semantic chunks by Article/Section (not arbitrary character counts), and extracts metadata: `law_number`, `decree_number`, `article_number`, `topic` (fiscal, social, commercial), and `verification_status`.
- **Deliverable:** Ingestion and chunking module in `rag/app/services/ingestion.py`.
- **Dependencies:** ML-01
- **Definition of Done:** Chunks respect legal article boundaries; each chunk retains complete statutory attribution metadata; script runs reproducibly.
- **Estimated Effort:** Medium

### Task ID: ML-03
- **Title:** Implement Embedding Generation & Vector Store Ingestion into pgvector
- **Workstream:** DATA / ML / RAG
- **Priority:** P0
- **Description:** Implement an embedding pipeline using an open multilingual embedding model or API to encode processed chunks and store them in the `regulatory_documents` table in PostgreSQL via `pgvector`.
- **Deliverable:** Ingestion runner script `rag/app/services/indexer.py`.
- **Dependencies:** DB-03, ML-02
- **Definition of Done:** All curated legal chunks embedded and populated into `pgvector`; cosine similarity search returns relevant articles for test legal queries.
- **Estimated Effort:** Medium

### Task ID: ML-04
- **Title:** Implement Semantic Retrieval & Context Reranking Service in FastAPI
- **Workstream:** DATA / ML / RAG
- **Priority:** P0
- **Description:** Build the retrieval module in `rag/app/retrieval/vector_search.py` connecting to `pgvector`. Implement top-k similarity retrieval with cosine distance, filtering by topic if applicable, and returning top relevant statutory chunks with similarity scores.
- **Deliverable:** Retrieval service module in `rag/app/retrieval/vector_search.py`.
- **Dependencies:** ML-03
- **Definition of Done:** Retrieval executes in < 300ms; returns relevant articles for standard queries (e.g. "IFU minimum", "plafond chiffre d'affaires", "CASNOS 2026").
- **Estimated Effort:** Medium

### Task ID: ML-05
- **Title:** Implement Grounded Answer Generation with Citation & Fallback Logic
- **Workstream:** DATA / ML / RAG
- **Priority:** P0
- **Description:** Build the complete query endpoint `POST /query` in FastAPI (`rag/app/api/query.py`). Format prompt templates enforcing strict grounding: model must only answer using provided context. Implement automatic extraction of statutory citations, assignment of source verification badges (`verified-official`, `secondary-only`, `conflicting`), and trigger the intellectual honesty fallback message when similarity score is below threshold.
- **Deliverable:** Query router and LLM orchestration service in `rag/app/api/query.py` and `rag/app/services/llm.py`.
- **Dependencies:** ML-04
- **Definition of Done:** Zero hallucinations of non-existent laws; exact citations returned in response JSON; low-confidence queries return standard official fallback.
- **Estimated Effort:** Large

### Task ID: ML-06
- **Title:** Benchmark & Evaluate RAG Retrieval Precision on Legal Questions
- **Workstream:** DATA / ML / RAG
- **Priority:** P1
- **Description:** Create an evaluation benchmark of 25 golden question-answer pairs covering registration, tax rates, deadlines, invoicing, and CASNOS. Measure retrieval recall@3 and answer faithfulness.
- **Deliverable:** Test script and benchmark results report in `rag/tests/benchmark_eval.py`.
- **Dependencies:** ML-05
- **Definition of Done:** Benchmark demonstrates > 90% retrieval precision on golden test cases; zero incorrect statutory rates generated.
- **Estimated Effort:** Medium

---

## 5. INTEGRATION WORKSTREAM

### Task ID: INT-01
- **Title:** Integrate Frontend Dashboard with Backend Turnover & Deadline APIs
- **Workstream:** INTEGRATION
- **Priority:** P0
- **Description:** Connect the Next.js Dashboard components (`frontend/app/page.tsx` or dashboard view) to `GET /api/analytics/turnover` and `GET /api/compliance/calendar`. Wire the visual ceiling gauge to live backend data and ensure 80% alert and consecutive year warnings display accurately.
- **Deliverable:** Integrated Dashboard screen in `frontend/`.
- **Dependencies:** BE-05, BE-06, BE-07
- **Definition of Done:** Dashboard reflects real database figures; updating an invoice status instantly updates the turnover bar; error and loading states handled cleanly.
- **Estimated Effort:** Medium

### Task ID: INT-02
- **Title:** Integrate Frontend Invoice Builder with Backend Invoicing & Immutability API
- **Workstream:** INTEGRATION
- **Priority:** P0
- **Description:** Connect the Next.js Invoice creation form to `POST /api/invoices`, client selector to `GET /api/clients`, and invoice list to `GET /api/invoices`. Implement UI enforcement of invoice immutability (hide edit/delete, show "Issue Credit Note" on finalized invoices).
- **Deliverable:** Integrated Invoice views and forms in `frontend/`.
- **Dependencies:** BE-03, BE-04
- **Definition of Done:** Users can create, list, and view invoices; finalizing locks the invoice; issuing credit note successfully creates and displays linked avoir.
- **Estimated Effort:** Medium

### Task ID: INT-03
- **Title:** Implement Client-Side PDF Generation with @react-pdf/renderer
- **Workstream:** INTEGRATION
- **Priority:** P0
- **Description:** Create the invoice PDF document component using `@react-pdf/renderer` in `frontend/components/invoice/InvoicePDF.tsx`. Match the exact design spec (P-02), embedding seller info, client info, itemized table, DZD totals, and mandatory legal footers. Provide one-click client-side download.
- **Deliverable:** Reusable PDF component and download trigger in `frontend/components/invoice/`.
- **Dependencies:** P-02, INT-02
- **Definition of Done:** Generates valid, printable A4 PDF in browser; includes all statutory notices verbatim; exports cleanly without server dependency.
- **Estimated Effort:** Medium

### Task ID: INT-04
- **Title:** Connect Frontend Regulatory Assistant to Backend & FastAPI RAG Pipeline
- **Workstream:** INTEGRATION
- **Priority:** P0
- **Description:** Build the interactive chat interface in `frontend/app/assistant/` connecting to `POST /api/assistant/query`. Render assistant responses with statutory citation cards, clickable source badges, and fallback warning banners when applicable.
- **Deliverable:** Interactive Regulatory Assistant page in `frontend/`.
- **Dependencies:** BE-08, ML-05
- **Definition of Done:** Assistant sends user query and displays streaming/loading state; renders structured citations and verification status badges cleanly; displays intellectual honesty fallback appropriately.
- **Estimated Effort:** Medium

### Task ID: INT-05
- **Title:** Integrate Arabic Localization and Dynamic RTL Direction Switcher
- **Workstream:** INTEGRATION
- **Priority:** P1
- **Description:** Implement language context and switch toggle in the Next.js layout (`frontend/app/layout.tsx`). When Arabic is selected, apply `dir="rtl"` to the document body and invert layout components (sidebar, stat cards, tables) smoothly.
- **Deliverable:** RTL provider and language toggle in `frontend/`.
- **Dependencies:** P-03
- **Definition of Done:** Seamless switching between French and Arabic; Arabic layout correctly mirrors navigation and data columns without visual clipping.
- **Estimated Effort:** Small

---

## 6. TESTING WORKSTREAM

### Task ID: TEST-01
- **Title:** Port and Expand Deterministic Calculation Unit Test Suite
- **Workstream:** TESTING
- **Priority:** P0
- **Description:** Create a rigorous automated unit test suite for the calculation service in `backend/tests/calc.test.ts`. Cover all 12 baseline statutory scenarios: turnover 0 -> IFU 10k, turnover 1.85M -> IFU 10k, turnover 3M -> IFU 15k, turnover 5M -> IFU 25k, CASNOS flat 24k, CASNOS general floor 43.2k, CASNOS general ceiling 864k, threshold percentages, and consecutive year counters.
- **Deliverable:** Unit test suite in `backend/tests/calc.test.ts`.
- **Dependencies:** BE-06
- **Definition of Done:** 100% of calculation test cases pass in automated CI run (`npm test`); edge cases (negative turnover, zero turnover) handled safely.
- **Estimated Effort:** Small

### Task ID: TEST-02
- **Title:** Implement Integration Tests for Sequential Invoicing & Immutability
- **Workstream:** TESTING
- **Priority:** P0
- **Description:** Author API integration tests in `backend/tests/invoices.test.ts` verifying that invoice numbers are strictly sequential (`FA-2026-001`, `FA-2026-002`), that finalized invoices reject `PUT`/`DELETE` calls with HTTP 403, and that credit notes decrement net turnover accurately.
- **Deliverable:** API integration test suite in `backend/tests/invoices.test.ts`.
- **Dependencies:** BE-03, BE-04
- **Definition of Done:** Automated test suite runs against test database and confirms immutability and sequential generation under concurrency.
- **Estimated Effort:** Medium

### Task ID: TEST-03
- **Title:** Conduct End-to-End User Acceptance Test across all MVP User Journeys
- **Workstream:** TESTING
- **Priority:** P1
- **Description:** Execute end-to-end smoke testing of complete user journey: Profile creation -> Client addition -> Invoice creation -> PDF download -> Payment recording -> Dashboard update -> RAG assistant query.
- **Deliverable:** Test execution log and defect report in `docs/uat-report.md`.
- **Dependencies:** INT-01, INT-02, INT-03, INT-04
- **Definition of Done:** Complete user journey passes without uncaught errors or data inconsistencies across both desktop and mobile viewports.
- **Estimated Effort:** Medium

---

## 7. DEPLOYMENT WORKSTREAM

### Task ID: DEP-01
- **Title:** Configure Environment Configurations & Staging Deployment (Vercel & Render)
- **Workstream:** DEPLOYMENT
- **Priority:** P1
- **Description:** Prepare staging deployment configurations: deploy `frontend/` to Vercel, `backend/` and `rag/` to Render (or Fly.io), and connect to Supabase production/staging project. Verify CORS headers and HTTPS communication across services.
- **Deliverable:** Deployment documentation and verified staging URLs in `README.md`.
- **Dependencies:** INT-01, INT-04
- **Definition of Done:** Frontend accessible publicly over HTTPS; communicates with backend API; RAG service responds to queries in staging environment.
- **Estimated Effort:** Medium
