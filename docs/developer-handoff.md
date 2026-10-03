# MoukawilOS — Developer Handoff

> **Single Source of Truth for Engineering Handoff**  
> **Status:** Finalized for Pre-development / Sprint 0  
> **Scope:** MVP Technical Specification aligned with the Figma Prototype and Algerian Auto-Entrepreneur Legal Framework (*Loi n° 22-23*).

---

## 1. System Overview

MoukawilOS is a lightweight operational platform for Algerian digital and creative freelancers operating under the Auto-Entrepreneur framework.

The MVP provides four essential operational capabilities:
1. **Compliance & Turnover Dashboard:** Real-time visibility over annual revenue versus the 5,000,000 DZD statutory ceiling, preventative 80% threshold warnings, and upcoming administrative deadlines.
2. **Sequential Invoicing & Client-Side PDF Generation:** Gapless sequential invoice generation (`FA-YYYY-NNN`) with auto-injected mandatory legal mentions and client-side PDF export via `@react-pdf/renderer`.
3. **Deterministic Compliance Engine:** Pure, test-covered calculations for the *Impôt Forfaitaire Unique* (IFU 0.5%, min 10,000 DZD) and CASNOS social security contributions without estimation guesswork.
4. **Regulatory RAG Assistant:** An AI-assisted retrieval interface grounded exclusively in official Algerian legal texts (Journal Officiel, DGI circulars, CASNOS decrees) with strict citation attribution.

---

## 2. High-Level Architecture & Responsibilities

The system is structured as a decoupled monorepo:

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                   │
│   Dashboard • Invoicing UI • Document Viewer • shadcn  │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       REST API │                        │ Direct Auth / RLS
                ▼                        ▼
┌───────────────────────────┐    ┌───────────────────────┐
│     Backend (Node.js)     │    │  Supabase PostgreSQL  │
│  API Orchestration • Auth ├───►│  RLS • pgvector Store │
└───────────────┬───────────┘    └───────────▲───────────┘
                │                            │
  Internal HTTP │                            │ Vector Search
        Service │                            │
                ▼                            │
┌───────────────────────────┐                │
│    RAG Service (Python)   ├────────────────┘
│   FastAPI • Embeddings    │
└───────────────────────────┘
```

### Tier Responsibilities

- **`frontend/` (Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui):**
  - Presentation, routing, client-side input validation (e.g. 15-digit NIF format).
  - Client-side PDF generation using `@react-pdf/renderer` (zero server rendering load).
  - Multilingual presentation: French (default), Arabic with dynamic RTL (`dir="rtl"`), and English.
  - Strict UI state enforcement: Draft is editable; Issued/Pending is locked; Paid is completely immutable.
- **`backend/` (Node.js, Express, TypeScript):**
  - REST API routes, controllers, middleware, and business validation.
  - Sequence generation: Thread-safe, gapless chronological numbering (`FA-YYYY-NNN` and `AV-YYYY-NNN`).
  - Immutability enforcement: Rejects any `PUT`, `PATCH`, or `DELETE` on finalized (`ISSUED` or `PAID`) invoices.
  - Deterministic calculations: IFU tax liability, CASNOS contributions, and cash-collected turnover aggregation.
  - Proxying queries to the Python RAG microservice over internal HTTP.
- **`rag/` (Python 3.13, FastAPI, Uvicorn, Pydantic):**
  - Semantic retrieval over Algerian auto-entrepreneur laws, decrees, and tax guidelines.
  - Generating grounded answers with direct legal article citations and status badges.
  - Intellectual honesty fallback when questions fall outside the verified corpus.
- **`database/` (Supabase PostgreSQL + pgvector):**
  - Relational schema for profiles, clients, invoices, items, credit notes, and payment logs.
  - PostgreSQL Row-Level Security (RLS) guaranteeing strict multi-tenant data isolation.
  - Vector embeddings table for regulatory texts queried with cosine distance.

---

## 3. Canonical Invoice Lifecycle

The platform enforces a strict 3-state invoice lifecycle across the database, backend, and frontend:

```text
┌─────────────────┐       Finalize       ┌──────────────────┐    Record Payment    ┌─────────────────┐
│      DRAFT      │ ───────────────────► │  ISSUED (Pending)│ ───────────────────► │      PAID       │
│  (Brouillon)    │                      │   (En attente)   │   with confirmation  │  (Encaissée)    │
└─────────────────┘                      └──────────────────┘                      └─────────────────┘
         │                                         │                                        │
         ▼                                         ▼                                        ▼
  • Editable                               • Locked (No edit/delete)                • 100% Immutable
  • Excluded from turnover                 • Included in billed total               • Included in IFU & 5M ceiling
  • Excluded from tax                      • Awaiting payment                       • View & PDF download only
  • Can be deleted                         • Can be marked as Paid                  • Edit strictly blocked
                                           • Can issue Credit Note (Avoir)          • Error requires Credit Note
```

### State Definitions & Rules

1. **`DRAFT` (Brouillon):**
   - Editable in all fields (client, items, quantities, dates).
   - Can be deleted.
   - **Excluded** from all annual turnover metrics, ceiling calculations, and tax estimates.
2. **`ISSUED` (UI label: `Pending` / `En attente`):**
   - Explicit equivalence: **`Pending` (UI) = `ISSUED` (backend/database)**.
   - Locked immediately upon finalization; sequential number (`FA-YYYY-NNN`) is assigned and permanent.
   - Edit and Delete actions are permanently disabled.
   - Included in billed receivables (`En attente d'encaissement`), but excluded from cash-basis IFU tax.
   - Can be transitioned to `PAID` via the "Record Payment" action.
   - Can be cancelled or adjusted **only** by generating a linked Credit Note (`AV-YYYY-NNN`).
3. **`PAID` (Encaissée):**
   - Strictly and permanently **immutable**.
   - Action buttons available: **View** and **Download PDF** only. "Edit" is non-existent.
   - Transitioning from `ISSUED` to `PAID` requires explicit user confirmation (modal with payment date and method).
   - **Included** in the official cash-collected turnover (*CIDTA art. 282 sexies*) and drives the 5M DZD ceiling gauge.
   - Any post-payment refund or correction strictly requires an Avoir (Credit Note).

---

## 4. Screen Requirements (Figma Prototype Alignment)

### 4.1. Dashboard (`/`)
- **Metric Cards:**
  - Annual Collected Turnover (Chiffre d'Affaires Encaissé) — reflects only `PAID` invoices for the active year minus credit notes.
  - Pending Receivables (En attente) — reflects `ISSUED` invoices.
  - Next Administrative Deadline — countdown and title from the statutory calendar.
- **5M DZD Annual Ceiling Gauge:**
  - Visual progress bar calculated as `(Collected Revenue / 5,000,000) * 100`.
  - Preventative alert at 80% (4,000,000 DZD) labeled as: `[Fonctionnalité MoukawilOS - Alerte Préventive]`.
  - Consecutive years indicator (Year 1, Year 2, or Year 3 with mandatory radiation notice).
- **Upcoming Obligations Widget:**
  - Nearest 3 filings (G12, CASNOS, G12 bis) with status badges (`Accomplie`, `Dans X jours`, `En retard`, `À venir`).
- **Recent Invoices Table:**
  - Shows invoice reference, client name, issue date, total in DZD, and status badge.

### 4.2. Invoices List (`/invoices`)
- Filter tabs: `All`, `Draft`, `Pending (Issued)`, `Paid`, `Credited`.
- Table columns: Number, Client, Date, Due Date, Total (DZD), Status, Actions.
- Actions based on state:
  - For `DRAFT`: Edit, Finalize, Delete.
  - For `ISSUED` (Pending): View, Download PDF, Record Payment, Issue Credit Note.
  - For `PAID`: View, Download PDF, Issue Credit Note.

### 4.3. Invoice Builder (`/invoices/new`)
- Client selector (autocomplete from existing clients or inline "Add New Client").
- Metadata: Issue Date, Payment Due Date.
- Line items table: Description, Quantity, Unit Price (DZD), Line Total.
- Real-time total calculation in DZD (No VAT / TVA line).
- Automatic injection of mandatory statutory mentions:
  - Seller details: Full name, approved activity, address, 15-digit NIF, RNAE card number.
  - VAT exemption notice: *« Franchise de TVA — Article 282 sexies du CIDTA — TVA non applicable »*.
  - RC exemption notice: *« Dispensé d'immatriculation au Registre du Commerce (Loi n° 22-23) »*.
  - 10-year archiving reminder: *« Document à conserver pendant dix (10) ans (Code de commerce art. 12) »*.
- Blocking validation: If the user's NIF or RNAE card number is missing from Settings, finalizing is blocked.

### 4.4. Invoice Preview & PDF Modal (`/invoices/:id/preview`)
- Standardized Algerian A4 invoice layout.
- One-click client-side download via `@react-pdf/renderer` saving as `Facture_FA-YYYY-NNN.pdf`.

### 4.5. Compliance & Statutory Simulator (`/compliance`)
- Current year tax summary: IFU calculated at 0.5% (with statutory 10,000 DZD floor applied).
- CASNOS social security summary: Flat 24,000 DZD or 15% general regime.
- Administrative Obligations Calendar: Full chronological schedule with legal references.
- Interactive Simulator: Input box allowing freelancers to simulate hypothetical turnover figures.
- Informational disclaimer stating the platform is a management aid, not formal tax advice.

### 4.6. Regulatory Assistant (`/assistant`)
- Chat interface with introductory notice on ground-truth sourcing.
- Suggested prompt chips (*"Quel est le taux de l'IFU ?"*, *"Quand payer la CASNOS ?"*, *"Mentions obligatoires facture"*).
- Structured response cards with statutory citations, verification badges, and official links.
- Intellectual honesty fallback message for unindexed topics.

### 4.7. Settings (`/settings`)
- Personal & Business Profile: Full Name, Address, Approved Activity (from official nomenclature), 15-digit NIF, RNAE Card Number, Phone, Email.
- CASNOS regime preference (Forfait 24,000 DZD vs. General Regime 15%).
- UI Language selector: French (default), Arabic (triggers RTL), English.

---

## 5. API Requirements (Contract Summary)

All endpoints reside under `/api/` and require Supabase Bearer token authentication (except `/health`).

| Method | Endpoint | Description | Payload / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service healthcheck | Returns `{ status: "ok", service: "moukawilos-backend" }` |
| `GET` | `/api/profile` | Get freelancer profile | Returns profile fields + verification flags |
| `PUT` | `/api/profile` | Update profile | Validates 15-digit NIF and approved activity |
| `GET` | `/api/clients` | List clients | Filterable, paginated |
| `POST` | `/api/clients` | Create client | Name, address, NIF (optional) |
| `GET` | `/api/invoices` | List invoices | Filterable by status (`draft`, `issued`, `paid`, `credited`) |
| `POST` | `/api/invoices` | Create invoice | Status: `draft` or `issued` (assigns `FA-YYYY-NNN`) |
| `GET` | `/api/invoices/:id` | Get invoice details | Returns invoice + item lines + credit notes |
| `PUT` | `/api/invoices/:id` | Update invoice | Allowed **only** if status is `draft`. Returns 403 if `issued` or `paid`. |
| `DELETE`| `/api/invoices/:id` | Delete invoice | Allowed **only** if status is `draft`. Returns 403 if `issued` or `paid`. |
| `POST` | `/api/invoices/:id/payment` | Mark invoice as Paid | Requires `{ payment_date, payment_method }`. Returns 400 if not `issued`. |
| `POST` | `/api/invoices/:id/credit-note` | Issue Credit Note | Creates `AV-YYYY-NNN` linked to invoice. Updates net turnover. |
| `GET` | `/api/analytics/turnover` | Annual turnover | Computes collected revenue, ceiling %, alert status |
| `GET` | `/api/compliance/calendar` | Statutory obligations | Computes deadlines and dynamic relative status |
| `POST` | `/api/compliance/simulate`| Tax simulator | Computes IFU and CASNOS for arbitrary turnover |
| `POST` | `/api/assistant/query` | Regulatory Q&A | Relays query to RAG service; returns cited answer |

---

## 6. Deterministic Calculation Requirements

The calculation engine in `backend/src/services/calc.ts` must implement exact formulas without floating-point errors:

1. **IFU (Impôt Forfaitaire Unique):**
   - Formula: `Math.max(10000, Math.round(turnover * 0.005))`
   - Source: *Loi de Finances 2024, CIDTA art. 282 sexies & art. 365 bis*.
   - Split Schedule (optional): 50% by June 30, 25% Sept 1–15, 25% Dec 1–15 (*CIDTA art. 365*).
2. **CASNOS Social Security:**
   - Option A (Forfait Auto-Entrepreneur): Fixed 24,000 DZD / year (*Décret exécutif 26-257*).
   - Option B (Régime Général): `Math.round(assiette * 0.15)` clamped between floor of 43,200 DZD (1x SNMG 288,000 DZD) and ceiling of 864,000 DZD (20x SNMG 5,760,000 DZD).
   - Annual payment deadline: June 30.
3. **Turnover Ceiling Tracking:**
   - Ceiling: 5,000,000 DZD / calendar year (*Loi 22-23 art. 2*).
   - Preventative Alert: Triggers at 80% (4,000,000 DZD).
   - Consecutive Years Count: Tracks consecutive calendar years above 5,000,000 DZD. Mandatory radiation warning triggers at 3 consecutive years (*Loi 22-23 art. 13-14*).

---

## 7. RAG Requirements

- **Corpus Boundaries:** Strictly limited to official legal texts: *Loi n° 22-23*, *Décrets 23-196, 23-197, 15-289, 26-257, 05-468*, CIDTA articles, and official DGI circulars.
- **Chunking:** Chunked by Article and Section (preserving complete legal context and parent law metadata).
- **Retrieval:** Dense vector search using `pgvector` with cosine similarity (`<->`).
- **Prompt Guardrails:** LLM system prompt must instruct the model to:
  1. Base answers exclusively on retrieved context.
  2. Attribute every claim to an Article and Law/Decree number.
  3. Include a source status tag: `verified-official`, `secondary-only`, or `conflicting`.
  4. If context is insufficient, respond with the standardized official fallback:  
     *« Cette disposition n'est pas précisée de manière unifiée dans les textes légaux vérifiés. Veuillez consulter directement les services de la DGI (mfdgi.gov.dz), de l'ANAE (anae.dz) ou de la CASNOS (casnos.dz). »*

---

## 8. Integration & Deployment Requirements

- **Frontend Integration:** Uses Axios / fetch to communicate with `backend/` over HTTPS.
- **PDF Generation:** Executed completely on the client side using `@react-pdf/renderer` in `frontend/`.
- **RAG Integration:** Backend routes `/api/assistant/query` calls to internal FastAPI service (`http://localhost:8000/query` in local dev).
- **Target Deployment:**
  - Frontend: Vercel.
  - Backend & RAG: Render or Fly.io.
  - Database: Supabase managed PostgreSQL with `pgvector`.
- **Environment Isolation:** Zero credentials in git. All connection strings stored in `.env` files matching `.env.example` keys.

---

## 9. Testing Requirements

- **Unit Tests (`backend/tests/calc.test.ts`):** 100% coverage of the 12 verified baseline test cases for IFU, CASNOS, ceiling percentage, and consecutive years.
- **Integration Tests (`backend/tests/invoices.test.ts`):** Verifies gapless sequence generation, immutability blocking (403 on edit of `issued`/`paid`), and credit note turnover adjustments.
- **RAG Evaluation (`rag/tests/benchmark_eval.py`):** Golden set of 25 legal queries measuring retrieval accuracy and citation precision.

---

## 10. Open Decisions (To Be Confirmed by Team)

The following items are recognized ambiguities or policy choices that the team must confirm:

1. **Eligibility Age Limit:** *Loi 22-23 art. 2* refers to "legal age of work" (16 years under *Loi 90-11*), while the ANAE online portal requires civil majority (19 years) or emancipation.  
   *Current Decision:* Documented neutrally in onboarding; recommendation to verify with ANAE.
2. **Single-Year Ceiling Breach Tax Policy:** *Loi 22-23* mandates status radiation only after 3 consecutive years exceeding 5M DZD. DGI tax circulars have not clarified whether single-year excess revenue is taxed at 0.5% or retroactively shifted to the standard real regime (*régime réel*).  
   *Current Decision:* Platform applies the 3-year counter and flags single-year exceedance without speculating on tax penalties.
3. **CASNOS 3rd-Year Scale Decree:** *Décret 15-289* mentions average wilaya-based contribution scales starting from year 3, but the application decree for auto-entrepreneurs has not been published.  
   *Current Decision:* Platform limits CASNOS to the official flat 24,000 DZD option or the standard 15% general regime.
4. **Final Software License:** License file currently states `"License to be determined."` until team stakeholders determine open-source (MIT/Apache) vs. proprietary licensing.
