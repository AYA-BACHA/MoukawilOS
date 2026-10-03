# MoukawilOS — GitHub Issue Backlog Templates

> **Status:** Ready for GitHub Import  
> **Repository:** `AYA-BACHA/MoukawilOS`  
> **Total Issues:** 31  

This document contains the exact formatted titles and descriptions for all 31 development backlog tasks, ready to be created as GitHub Issues.

---

### Issue 1: [P-01] Finalize UX Wireframes & Form Layouts for Invoicing and Settings
- **Priority:** P0
- **Workstream:** PRODUCT / UX
- **Dependencies:** None
- **Description:**
  Design clean, ergonomic form layouts and interaction states for the invoice creation modal, client management form, settings profile, and the main dashboard. Ensure all required statutory fields (15-digit NIF, ANAE card number, approved activity dropdown) have intuitive user guidance.
- **Definition of Done:**
  Detailed layout specs reviewed with Frontend developers; all mandatory fields from Décret 05-468 and Loi 22-23 included; responsive design considerations documented.

---

### Issue 2: [P-02] Define Standardized Algerian Invoice & Credit Note Design Specification
- **Priority:** P0
- **Workstream:** PRODUCT / UX
- **Dependencies:** None
- **Description:**
  Specify the exact visual presentation and typographic hierarchy for the generated A4 invoice and credit note (avoir). Detail seller box, client box, invoice metadata, itemized table in DZD, and the mandatory legal footer texts (VAT exemption per CIDTA art. 282 sexies, 10-year archiving notice).
- **Definition of Done:**
  Specification contains exact text strings in French and Arabic; complies with Décret 05-468 requirements; approved for implementation in `@react-pdf/renderer`.

---

### Issue 3: [P-03] Prepare Multilingual Copy & i18n Dictionary (FR, AR with RTL, EN)
- **Priority:** P0
- **Workstream:** PRODUCT / UX
- **Dependencies:** None
- **Description:**
  Centralize all user-facing labels, tooltips, validation messages, legal disclaimers, and statutory status badges into structured dictionary files for French (default), Arabic, and English. Ensure Arabic strings maintain accurate legal terminology aligned with official Algerian Arabic gazette texts.
- **Definition of Done:**
  Zero hard-coded text in future UI components; Arabic translations verified against official JORADP terminology; RTL layout orientation instructions provided.

---

### Issue 4: [P-04] Establish User Research & Usability Validation Protocol
- **Priority:** P1
- **Workstream:** PRODUCT / UX
- **Dependencies:** P-01
- **Description:**
  Develop an interview guide and interactive testing protocol to evaluate the usability of the invoice builder, ceiling warning indicators, and regulatory assistant with real Algerian freelancers.
- **Definition of Done:**
  Testing protocol contains explicit pass/fail criteria for usability, 5 scenario tasks, and recruit profiles for freelancers under the ANAE framework.

---

### Issue 5: [DB-01] Design Core Relational Database Schema for Freelancers, Clients, and Invoices
- **Priority:** P0
- **Workstream:** DATABASE
- **Dependencies:** None
- **Description:**
  Author SQL DDL migrations defining tables for `profiles` (NIF, ANAE card number, activity, address, CASNOS regime), `clients` (name, address, NIF), `invoices` (sequential number, date, due date, status, total_amount), `invoice_items` (description, quantity, unit_price), `credit_notes` (linked invoice, reason, amount), and `payment_logs`.
- **Definition of Done:**
  Schema scripts execute cleanly on PostgreSQL / Supabase; foreign key constraints and checks verified; immutability rules supported.

---

### Issue 6: [DB-02] Configure Supabase Row-Level Security (RLS) Policies and User Isolation
- **Priority:** P0
- **Workstream:** DATABASE
- **Dependencies:** DB-01
- **Description:**
  Implement strict Row-Level Security (RLS) policies on all tables (`profiles`, `clients`, `invoices`, `invoice_items`, `credit_notes`, `payment_logs`) ensuring that authenticated users can strictly access, insert, or modify only their own business records.
- **Definition of Done:**
  RLS policies verified by automated or manual tests; authenticated User A cannot query or mutate User B's records under any circumstances.

---

### Issue 7: [DB-03] Set Up pgvector Extension and Vector Embeddings Table for RAG
- **Priority:** P0
- **Workstream:** DATABASE
- **Dependencies:** None
- **Description:**
  Enable the `vector` extension in PostgreSQL and create the `regulatory_documents` table with fields: `id`, `title`, `source_type`, `legal_reference`, `verification_status`, `content`, and `embedding vector(1536)` (or model dimension), along with an HNSW or IVFFlat index.
- **Definition of Done:**
  `vector` extension successfully created in Supabase PostgreSQL; table supports vector insertion and cosine similarity queries (`<->`).

---

### Issue 8: [DB-04] Create Initial Seed Data with Verified Algerian Nomenclature & Tax Rates
- **Priority:** P1
- **Workstream:** DATABASE
- **Dependencies:** DB-01
- **Description:**
  Provide SQL seed scripts in `database/seeds/` populating reference datasets: approved ANAE activity categories (from Décret exécutif 23-197), standard administrative deadlines, and statutory default rules.
- **Definition of Done:**
  Seed script runs idempotently without violating constraints; correctly populates all 7 approved ANAE activity branches.

---

### Issue 9: [BE-01] Implement User Profile & Freelancer Settings API
- **Priority:** P0
- **Workstream:** BACKEND
- **Dependencies:** DB-01, DB-02
- **Description:**
  Create REST endpoints (`GET /api/profile`, `PUT /api/profile`) in Express to manage the freelancer's identity details: full name, business address, approved activity code, 15-digit NIF, RNAE card registration number, and CASNOS regime choice. Include validation middleware for the 15-digit NIF format.
- **Definition of Done:**
  Endpoints reject invalid NIF formats; successfully persist and retrieve profile data; authenticated via Supabase user token.

---

### Issue 10: [BE-02] Implement Client Management API
- **Priority:** P0
- **Workstream:** BACKEND
- **Dependencies:** DB-01, DB-02
- **Description:**
  Create REST endpoints (`GET /api/clients`, `POST /api/clients`, `GET /api/clients/:id`, `PUT /api/clients/:id`) to create, list, and update client records (name, address, business NIF).
- **Definition of Done:**
  CRUD operations verified; client data isolated per authenticated freelancer; payload validation rejects empty client names.

---

### Issue 11: [BE-03] Implement Sequential Invoicing & Immutability Enforcement Engine
- **Priority:** P0
- **Workstream:** BACKEND
- **Dependencies:** DB-01, BE-01, BE-02
- **Description:**
  Develop the invoice creation service (`POST /api/invoices`, `GET /api/invoices`, `GET /api/invoices/:id`). Implement gapless, thread-safe chronological numbering in the format `FA-YYYY-NNN` resetting each calendar year. Strictly enforce immutability: once status is `pending` or `paid`, any `PUT`, `PATCH`, or `DELETE` attempt on the invoice must return HTTP 403 / 400 with a legal compliance error message.
- **Definition of Done:**
  Numbering generates incrementing sequence with zero gaps; finalized invoices cannot be modified or deleted via any endpoint; invoice creation verifies that seller NIF and ANAE card exist in profile.

---

### Issue 12: [BE-04] Implement Credit Notes (Factures d'Avoir) API
- **Priority:** P0
- **Workstream:** BACKEND
- **Dependencies:** BE-03
- **Description:**
  Create endpoints (`POST /api/invoices/:id/credit-note`, `GET /api/credit-notes`) to issue formal credit notes against finalized invoices per Décret exécutif 05-468. Enforce sequential numbering (`AV-YYYY-NNN`) and automatically record the adjustment reference to the original invoice.
- **Definition of Done:**
  Credit notes can only be issued against finalized invoices; sequence increments cleanly (`AV-2026-001`); updates invoice status to `credited` if 100% credited.

---

### Issue 13: [BE-05] Implement Payment Recording & Cash-Basis Turnover Aggregator
- **Priority:** P0
- **Workstream:** BACKEND
- **Dependencies:** BE-03, BE-04
- **Description:**
  Create endpoints (`POST /api/invoices/:id/payment`, `GET /api/analytics/turnover`) to record customer payments (date, payment method: Virement, Chèque, Espèces, CCP). Aggregate annual turnover strictly on a cash-collected basis (only `paid` invoices minus credited amounts) per CIDTA art. 282.
- **Definition of Done:**
  Unpaid or pending invoices do not count toward collected turnover; credit notes reduce net turnover; turnover total returns accurate figures for the active year.

---

### Issue 14: [BE-06] Implement Deterministic IFU Tax and CASNOS Calculation Engine
- **Priority:** P0
- **Workstream:** BACKEND
- **Dependencies:** None
- **Description:**
  Port and implement the verified calculation logic into a robust TypeScript calculation service in `backend/src/services/calc.ts`. Implement:
  1. IFU: `Max(10,000 DZD, Turnover * 0.005)` with split installment schedule (50%, 25%, 25%).
  2. CASNOS: Flat 24,000 DZD or 15% general regime clamped between 43,200 DZD and 864,000 DZD.
  3. Threshold tracking: 5M DZD ceiling, 80% warning (4M DZD), and consecutive-year counter.
- **Definition of Done:**
  100% unit test pass rate matching the 12 verified baseline test cases; zero reliance on hardcoded external values.

---

### Issue 15: [BE-07] Implement Administrative Obligations Calendar Service
- **Priority:** P0
- **Workstream:** BACKEND
- **Dependencies:** BE-06
- **Description:**
  Create endpoint (`GET /api/compliance/calendar`) that returns the official Algerian statutory calendar for the auto-entrepreneur (NIF within 30 days, G12 by June 30, CASNOS by June 30, G12 bis by Jan 20 N+1) with calculated dynamic statuses (`Accomplie`, `Dans X jours`, `En retard`, `À venir`) relative to the current server date.
- **Definition of Done:**
  Returns correct chronological dates for any requested year; zero fictional quarterly CASNOS deadlines; attaches verified legal references to each deadline.

---

### Issue 16: [BE-08] Implement Backend Proxy Route to RAG Microservice
- **Priority:** P0
- **Workstream:** BACKEND
- **Dependencies:** ML-04
- **Description:**
  Create an authenticated API endpoint (`POST /api/assistant/query`) that validates user input, forwards the query to the FastAPI RAG service (`rag/`) over internal HTTP, receives the grounded answer with citations and status badges, and returns the structured payload to the client.
- **Definition of Done:**
  Verifies user authentication; cleanly handles RAG service timeouts or errors; passes query and receives structured response payload.

---

### Issue 17: [ML-01] Collect & Curate the Ground-Truth Algerian Regulatory Corpus
- **Priority:** P0
- **Workstream:** DATA / ML / RAG
- **Dependencies:** None
- **Description:**
  Gather and structure official PDF/text documents representing Algerian auto-entrepreneur law: *Loi n° 22-23*, *Décret exécutif n° 23-196*, *Décret exécutif n° 23-197*, *Décret exécutif n° 15-289*, *Décret exécutif n° 26-257*, *Décret exécutif n° 05-468*, relevant articles of CIDTA (*art. 282 quater, sexies, 365, 365 bis*), and official DGI circulars.
- **Definition of Done:**
  Every document sourced directly from official gazette (JORADP) or ministry portals; manifest lists source URLs; zero unverified blog texts included.

---

### Issue 18: [ML-02] Develop Legal Text Chunking, Metadata Extraction & Cleaning Pipeline
- **Priority:** P0
- **Workstream:** DATA / ML / RAG
- **Dependencies:** ML-01
- **Description:**
  Implement a specialized document processing script in `rag/app/services/ingestion.py` that parses legal texts, splits them into semantic chunks by Article/Section (not arbitrary character counts), and extracts metadata: `law_number`, `decree_number`, `article_number`, `topic` (fiscal, social, commercial), and `verification_status`.
- **Definition of Done:**
  Chunks respect legal article boundaries; each chunk retains complete statutory attribution metadata; script runs reproducibly.

---

### Issue 19: [ML-03] Implement Embedding Generation & Vector Store Ingestion into pgvector
- **Priority:** P0
- **Workstream:** DATA / ML / RAG
- **Dependencies:** DB-03, ML-02
- **Description:**
  Implement an embedding pipeline using an open multilingual embedding model or API to encode processed chunks and store them in the `regulatory_documents` table in PostgreSQL via `pgvector`.
- **Definition of Done:**
  All curated legal chunks embedded and populated into `pgvector`; cosine similarity search returns relevant articles for test legal queries.

---

### Issue 20: [ML-04] Implement Semantic Retrieval & Context Reranking Service in FastAPI
- **Priority:** P0
- **Workstream:** DATA / ML / RAG
- **Dependencies:** ML-03
- **Description:**
  Build the retrieval module in `rag/app/retrieval/vector_search.py` connecting to `pgvector`. Implement top-k similarity retrieval with cosine distance, filtering by topic if applicable, and returning top relevant statutory chunks with similarity scores.
- **Definition of Done:**
  Retrieval executes in < 300ms; returns relevant articles for standard queries (e.g. "IFU minimum", "plafond chiffre d'affaires", "CASNOS 2026").

---

### Issue 21: [ML-05] Implement Grounded Answer Generation with Citation & Fallback Logic
- **Priority:** P0
- **Workstream:** DATA / ML / RAG
- **Dependencies:** ML-04
- **Description:**
  Build the complete query endpoint `POST /query` in FastAPI (`rag/app/api/query.py`). Format prompt templates enforcing strict grounding: model must only answer using provided context. Implement automatic extraction of statutory citations, assignment of source verification badges (`verified-official`, `secondary-only`, `conflicting`), and trigger the intellectual honesty fallback message when similarity score is below threshold.
- **Definition of Done:**
  Zero hallucinations of non-existent laws; exact citations returned in response JSON; low-confidence queries return standard official fallback.

---

### Issue 22: [ML-06] Benchmark & Evaluate RAG Retrieval Precision on Legal Questions
- **Priority:** P1
- **Workstream:** DATA / ML / RAG
- **Dependencies:** ML-05
- **Description:**
  Create an evaluation benchmark of 25 golden question-answer pairs covering registration, tax rates, deadlines, invoicing, and CASNOS. Measure retrieval recall@3 and answer faithfulness.
- **Definition of Done:**
  Benchmark demonstrates > 90% retrieval precision on golden test cases; zero incorrect statutory rates generated.

---

### Issue 23: [INT-01] Integrate Frontend Dashboard with Backend Turnover & Deadline APIs
- **Priority:** P0
- **Workstream:** INTEGRATION
- **Dependencies:** BE-05, BE-06, BE-07
- **Description:**
  Connect the Next.js Dashboard components (`frontend/app/page.tsx` or dashboard view) to `GET /api/analytics/turnover` and `GET /api/compliance/calendar`. Wire the visual ceiling gauge to live backend data and ensure 80% alert and consecutive year warnings display accurately.
- **Definition of Done:**
  Dashboard reflects real database figures; updating an invoice status instantly updates the turnover bar; error and loading states handled cleanly.

---

### Issue 24: [INT-02] Integrate Frontend Invoice Builder with Backend Invoicing & Immutability API
- **Priority:** P0
- **Workstream:** INTEGRATION
- **Dependencies:** BE-03, BE-04
- **Description:**
  Connect the Next.js Invoice creation form to `POST /api/invoices`, client selector to `GET /api/clients`, and invoice list to `GET /api/invoices`. Implement UI enforcement of invoice immutability (hide edit/delete, show "Issue Credit Note" on finalized invoices).
- **Definition of Done:**
  Users can create, list, and view invoices; finalizing locks the invoice; issuing credit note successfully creates and displays linked avoir.

---

### Issue 25: [INT-03] Implement Client-Side PDF Generation with @react-pdf/renderer
- **Priority:** P0
- **Workstream:** INTEGRATION
- **Dependencies:** P-02, INT-02
- **Description:**
  Create the invoice PDF document component using `@react-pdf/renderer` in `frontend/components/invoice/InvoicePDF.tsx`. Match the exact design spec (P-02), embedding seller info, client info, itemized table, DZD totals, and mandatory legal footers. Provide one-click client-side download.
- **Definition of Done:**
  Generates valid, printable A4 PDF in browser; includes all statutory notices verbatim; exports cleanly without server dependency.

---

### Issue 26: [INT-04] Connect Frontend Regulatory Assistant to Backend & FastAPI RAG Pipeline
- **Priority:** P0
- **Workstream:** INTEGRATION
- **Dependencies:** BE-08, ML-05
- **Description:**
  Build the interactive chat interface in `frontend/app/assistant/` connecting to `POST /api/assistant/query`. Render assistant responses with statutory citation cards, clickable source badges, and fallback warning banners when applicable.
- **Definition of Done:**
  Assistant sends user query and displays streaming/loading state; renders structured citations and verification status badges cleanly; displays intellectual honesty fallback appropriately.

---

### Issue 27: [INT-05] Integrate Arabic Localization and Dynamic RTL Direction Switcher
- **Priority:** P1
- **Workstream:** INTEGRATION
- **Dependencies:** P-03
- **Description:**
  Implement language context and switch toggle in the Next.js layout (`frontend/app/layout.tsx`). When Arabic is selected, apply `dir="rtl"` to the document body and invert layout components (sidebar, stat cards, tables) smoothly.
- **Definition of Done:**
  Seamless switching between French and Arabic; Arabic layout correctly mirrors navigation and data columns without visual clipping.

---

### Issue 28: [TEST-01] Port and Expand Deterministic Calculation Unit Test Suite
- **Priority:** P0
- **Workstream:** TESTING
- **Dependencies:** BE-06
- **Description:**
  Create a rigorous automated unit test suite for the calculation service in `backend/tests/calc.test.ts`. Cover all 12 baseline statutory scenarios: turnover 0 -> IFU 10k, turnover 1.85M -> IFU 10k, turnover 3M -> IFU 15k, turnover 5M -> IFU 25k, CASNOS flat 24k, CASNOS general floor 43.2k, CASNOS general ceiling 864k, threshold percentages, and consecutive year counters.
- **Definition of Done:**
  100% of calculation test cases pass in automated CI run (`npm test`); edge cases (negative turnover, zero turnover) handled safely.

---

### Issue 29: [TEST-02] Implement Integration Tests for Sequential Invoicing & Immutability
- **Priority:** P0
- **Workstream:** TESTING
- **Dependencies:** BE-03, BE-04
- **Description:**
  Author API integration tests in `backend/tests/invoices.test.ts` verifying that invoice numbers are strictly sequential (`FA-2026-001`, `FA-2026-002`), that finalized invoices reject `PUT`/`DELETE` calls with HTTP 403, and that credit notes decrement net turnover accurately.
- **Definition of Done:**
  Automated test suite runs against test database and confirms immutability and sequential generation under concurrency.

---

### Issue 30: [TEST-03] Conduct End-to-End User Acceptance Test across all MVP User Journeys
- **Priority:** P1
- **Workstream:** TESTING
- **Dependencies:** INT-01, INT-02, INT-03, INT-04
- **Description:**
  Execute end-to-end smoke testing of complete user journey: Profile creation -> Client addition -> Invoice creation -> PDF download -> Payment recording -> Dashboard update -> RAG assistant query.
- **Definition of Done:**
  Complete user journey passes without uncaught errors or data inconsistencies across both desktop and mobile viewports.

---

### Issue 31: [DEP-01] Configure Environment Configurations & Staging Deployment (Vercel & Render)
- **Priority:** P1
- **Workstream:** DEPLOYMENT
- **Dependencies:** INT-01, INT-04
- **Description:**
  Prepare staging deployment configurations: deploy `frontend/` to Vercel, `backend/` and `rag/` to Render (or Fly.io), and connect to Supabase production/staging project. Verify CORS headers and HTTPS communication across services.
- **Definition of Done:**
  Frontend accessible publicly over HTTPS; communicates with backend API; RAG service responds to queries in staging environment.
