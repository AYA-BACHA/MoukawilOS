<div align="center">

# MoukawilOS 

### Regulatory and Fiscal Compliance Workspace for Algerian Auto-Entrepreneurs 

Statutory compliance under Law 22-23 and Executive Decree 23-197 &nbsp;|&nbsp; Strict cash-basis turnover tracking (5,000,000 DZD ceiling) &nbsp;|&nbsp; Deterministic 0.5% IFU calculation &nbsp;|&nbsp; Multilingual PDF invoicing (Arabic RTL, French, English) &nbsp;|&nbsp; Zero-hallucination regulatory AI with authentic Gazette (JORADP) PDF auditing

[Live Demo](https://moukawil-os.vercel.app/dashboard) &nbsp;|&nbsp; [Demo Video](https://drive.google.com/file/d/17I50LRwzxnFCT-UQKXkBn7wEJ_jsdgkT/view?usp=sharing) &nbsp;|&nbsp; [Source Code](https://github.com/AYA-BACHA/MoukawilOS)

![Next.js](https://img.shields.io/badge/Next.js_16.3-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_18-4169E1?logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-Gemini_1.5_Flash-4285F4?logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend_Deployment-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend_API-46E3B7?logo=render&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Automated_CI-2088FF?logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red.svg)

<img src="docs/screenshots/hero.png" alt="MoukawilOS Dashboard" width="860">

</div>

> **Notice on Workspace Theme & Localization:**  
> The MoukawilOS web application user interface boots natively in an institutional, high-contrast **Light Mode** by default (with Dark Mode available on demand via the header toggle) and is engineered in **English** to guarantee international evaluator accessibility, standardized UX ergonomics, and clean developer readability. In contrast, generated export invoices (the official legal PDF documents issued to Algerian commercial entities, domestic clients, and tax authorities) support complete multilingual rendering in **Arabic (with native right-to-left layout and glyph shaping)**, **French**, and **English**.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [What MoukawilOS Does](#2-what-moukawilos-does)
3. [Try It in 30 Seconds](#3-try-it-in-30-seconds)
4. [Screenshots & Interface Overview](#4-screenshots--interface-overview)
5. [System Architecture & Lifecycle Workflows](#5-system-architecture--lifecycle-workflows)
6. [Fiscal Rules & Deterministic Compliance Engine](#6-fiscal-rules--deterministic-compliance-engine)
7. [Regulatory RAG Intelligence Service](#7-regulatory-rag-intelligence-service)
8. [Technical Stack](#8-technical-stack)
9. [Local Development Setup](#9-local-development-setup)
10. [Project Structure](#10-project-structure)
11. [Project Status & Team](#project-status)
12. [AI Transparency & Attribution](#12-ai-transparency--attribution)
13. [Known Limitations & Engineering Trade-Offs](#13-known-limitations--engineering-trade-offs)
14. [Roadmap & Future Scope](#14-roadmap--future-scope)
15. [Security & Multi-Tenancy Architecture](#15-security--multi-tenancy-architecture)
16. [Regulatory & Legal Disclaimer](#16-regulatory--legal-disclaimer)
17. [License](#17-license)
18. [Statutory & Regulatory Sources](#18-sources)

---

## 1. The Problem

Law No. 22-23 of 18 December 2022 established the **auto-entrepreneur** statutory framework in Algeria, administered by the Agence Nationale de l'Auto-Entrepreneur (ANAE). The law allows independent digital creators, software engineers, and freelance consultants to operate with formal legal recognition under a flat **0.5% IFU** (*Impôt Forfaitaire Unique*), exemption from Commercial Register (*CNRC*) registration, and complete exemption from Value-Added Tax (*TVA*).

Maintaining regulatory compliance under this regime requires navigating strict statutory constraints where administrative mistakes carry serious consequences:

| Statutory Obligation | Statutory Rule & Legal Reference | Common Failure Mode in Manual Spreadsheets |
|---|---|---|
| **Turnover Ceiling Tracking** | **5,000,000 DZD annual ceiling** on a strict **cash basis** (*Loi 22-23 art. 2*; *CIDTA art. 282 ter, art. 282 sexies*). Exceeding for 3 consecutive years triggers mandatory radiation (*art. 13-14*). | Freelancers aggregate issued invoice totals rather than cleared receipts (*encaissement effectif*), causing false breach alerts or failing to track actual statutory exposure. |
| **IFU Tax Calculation** | **0.5% of collected turnover**, with a mandatory statutory minimum floor of **10,000 DZD** per calendar year (*CIDTA art. 282 sexies, art. 365 bis*). | Spreadsheets compute 0.5% linearly and omit the 10,000 DZD statutory minimum when turnover is low or zero. |
| **Statutory Invoice Mentions** | Invoices must embed mandatory seller identifiers: 15-digit NIF, ANAE card number, approved nomenclature code (*Décret 23-197*), and statutory VAT exemption notice (*Décret 05-468*). | Manually typed Word or Excel templates omit mandatory legal clauses, invalidating commercial deductibility for clients. |
| **Invoice Immutability** | Commercial invoices cannot be deleted or modified post-issuance; errors must be rectified via formal Credit Notes (*Factures d'avoir*, *Décret 05-468 art. 11*). | Spreadsheets allow silent edits or line deletions, violating Algerian commercial audit standards (*Code de commerce art. 12*). |
| **Bifurcated Filing Calendar** | Dual declaration calendar: G12 provisional declaration (due **30 June**) and G12 bis definitive regularisation (due **20 January N+1**) (*CIDTA art. 282 quater*). | Freelancers confuse declaration dates or rely on internet rumors claiming non-existent monthly declaration requirements. |
| **Social Security Compliance** | Annual CASNOS contribution (fixed **24,000 DZD/year** under *Décret 26-257* or 15% general regime) due by **30 June**. | Freelancers assume quarterly filing schedules or miss affiliation deadlines, triggering administrative surcharges. |

Most Algerian independent operators manage these obligations across disconnected Excel workbooks, unformatted Word templates, and disparate chat groups. A single calculation error or missed deadline can lead to tax penalties or loss of statutory status.

> **Target Audience:** Independent digital service providers, software engineers, UI/UX designers, translators, and creative consultants registered with ANAE under the 7 approved activity sectors of Executive Decree No. 23-197.

---

## 2. What MoukawilOS Does

MoukawilOS unifies cash-basis accounting, sequential invoicing, automated fiscal math, and regulatory retrieval into a single operational workspace:

| Capability | Functional & Technical Implementation | Localization / Scope | Status |
|---|---|---|---|
| **Cash-Basis Turnover Meter** | Aggregates settled revenue strictly from cleared (`PAID`) invoices against the 5,000,000 DZD statutory ceiling. Displays remaining headroom and triggers a preventative software warning at 80% (4,000,000 DZD). | Workspace: English UI | Completed |
| **Canonical Sequential Invoicing** | Enforces gapless chronological numbering (`FA-YYYY-NNN`) and credit note numbering (`AV-YYYY-NNN`). Automatically injects seller identifiers (15-digit NIF, ANAE card number, activity code) and mandatory legal clauses. | Workspace: English UI | Completed |
| **Multilingual Export Invoices** | Generates exportable, standardized A4 PDF invoices. Embeds full Arabic font shaping with right-to-left (RTL) layout, alongside French and English rendering options. | Export Output: Arabic (RTL) / French / English | Completed |
| **Deterministic Fiscal Engine** | Server-side calculation engine using strict Python `Decimal` arithmetic. Implements `max(0.005 × Annual Collected Turnover, 10,000 DZD)`, optional 50/25/25 split payment schedules, and CASNOS social security modeling. | Workspace: English UI | Completed |
| **Statutory Compliance Calendar** | Real-time dynamic countdowns for the 30-day initial NIF declaration, G12 provisional filing (30 June), annual CASNOS settlement (30 June), and G12 bis final regularisation (20 January N+1). | Workspace: English UI | Completed |
| **Regulatory RAG Assistant** | Semantic legal retrieval engine grounded in official Algerian statutes (*Loi 22-23*, *Décret 23-197*, *CIDTA*). Attributes answers to specific legal articles with deterministic refusal fallback on out-of-scope queries. | Assistant: English / French / Arabic queries | Completed |
| **Statutory Credit Notes (Avoirs)** | Generates linked credit notes (`AV-YYYY-NNN`) to correct billing errors or process refunds on finalized invoices without breaking sequential numbering or deleting historical records. | Workspace & PDF: Multilingual | Completed |
| **Instant Guest Sandbox** | Zero-friction evaluation mode providing a pre-seeded, isolated test account with realistic clients, invoices, and turnover data for instant reviewer verification. | Workspace: English UI | Completed |
| **Automated Bank Statement Ingestion** | Ingestion pipeline for parsing domestic bank and postal statements (BaridiMob / CCP / SATIM) to automatically match bank credits to issued invoices. | Integrations: Ingest / Parser | Target Milestone / Post-MVP (Month 1 Closed Beta) |
| **Statutory G12 bis Declaration Preview** | Printable Formulaire G12 bis summary sheet pre-populated from the annual cash-basis ledger (0.5% IFU, 10,000 DZD floor, 24,000 DZD CASNOS). | Export Output: French / Official DGI Layout | Completed (Official DGI pixel-perfect PDF overlay in Month 1 Beta) |

---

## 3. Try It in 30 Seconds

Evaluators and reviewers can verify the end-to-end statutory and fiscal workflows directly in the browser:

1. Open the live deployment: **https://moukawil-os.vercel.app**
2. The application boots directly into the pre-seeded **Demo Account** (sample auto-entrepreneur **Sara Benali / Amine B.**, ANAE `23-123456` / `AE-16-0492`) with pre-loaded clients and invoices, requiring no registration or login.
3. **Instant Pitch Simulation (Top Header Bar):**
   - Click the **Scenario Switcher** pill in the top header (`Scenario: 40% Ceiling`).
   - Switch between **Standard (40%)**, **Near Statutory Cap Alert (94%)** (which triggers the Law 22-23 Art. 13 statutory warning banner), and **Fresh Auto-Entrepreneur (0%)**.
   - Click **"Launch Guided 2-Min Pitch Walkthrough"** to experience the step-by-step interactive evaluator tour.
4. Navigate to **Invoices** -> click **"New Invoice"**, select a client, add a billable line item in DZD, and click **"Finalize Invoice"**.
   - Notice the status updates to `ISSUED / PENDING`.
   - Return to the **Dashboard**: observe that the **Turnover Meter remains unchanged at 0 DZD consumed**. Under Law 22-23, issuing an invoice does not consume turnover or trigger tax liability.
5. Return to the invoice, click **"Record Payment"**, select settlement method (*Virement bancaire*, *Chèque*, or *BaridiMob*), and confirm.
   - The invoice transitions to the immutable `PAID` state, synced with the backend API and database.
6. Check the **Dashboard**:
   - The **Turnover Meter** increments by the settled amount.
   - The **5,000,000 DZD ceiling gauge** and remaining headroom recalculate.
   - The **IFU Tax Liability** updates immediately, adhering to the `max(0.5%, 10,000 DZD)` statutory floor.
7. Open the invoice details, toggle the language selector between **Arabic (RTL)**, **French**, and **English**, and click **"Download PDF"** to verify high-fidelity multilingual document compilation.
8. Open the **Regulatory Assistant** and test statutory grounding:
   - *Grounded Query:* "Which activities are eligible under the auto-entrepreneur status?" -> Returns approved sectors with citations to Executive Decree No. 23-197.
   - *Adversarial / Out-of-Scope Query:* "Can a retail pharmacy operate under auto-entrepreneur status?" -> System triggers a deterministic refusal stating the topic cannot be verified in the indexed decrees, refusing to hallucinate tax advice.

---

## 4. Screenshots & Interface Overview

| Dashboard & Cash-Basis Turnover Meter | Sequential Invoice Editor & Live Document Preview |
|---|---|
| <img src="docs/screenshots/dashboard.png" alt="MoukawilOS Dashboard" width="420"> | <img src="docs/screenshots/invoice-editor.png" alt="Invoice Editor" width="420"> |
| Real-time 5,000,000 DZD ceiling gauge with 80% preventative warning, cash-collected revenue cards, and statutory G12 bis deadlines. | Gapless sequential numbering (`FA-YYYY-NNN`), seller NIF/ANAE injection, and mandatory VAT exemption badge (`TVA Non-Assujetti`). |

| Commercial Invoices Ledger & Settlement Tracking | Regulatory Assistant with Legal Citations |
|---|---|
| <img src="docs/screenshots/invoices-ledger.png" alt="Invoices Ledger" width="420"> | <img src="docs/screenshots/assistant.png" alt="Regulatory Assistant" width="420"> |
| Real-time cash-basis ledger separating cleared receipts from outstanding receivables with automated settlement workflows. | Semantic legal Q&A powered by pgvector, delivering article-level citations and deterministic refusal guardrails. |

| Multi-Tier Client Directory (B2B & B2C) | Compliance Settings & Audit Trail |
|---|---|
| <img src="docs/screenshots/clients.png" alt="Client Directory" width="420"> | <img src="docs/screenshots/compliance.png" alt="Compliance Settings" width="420"> |
| Corporate client validation with mandatory 15-digit NIF/RC tracking to preserve statutory single-tax treatment. | ANAE accreditation monitoring, CASNOS social security sync, and unalterable statutory log hash tracking. |

---

## 5. System Architecture & Lifecycle Workflows

### System Architecture Overview

The platform uses a decoupled architecture separating the presentation tier, core API, relational and vector persistence, and document compilation:

```mermaid
flowchart TD
    Client(["User Web Browser"])

    subgraph PresentationTier ["1. Presentation Layer"]
        NextApp["Next.js 16.3 Frontend<br/>App Router • React 19 • Tailwind CSS v4 • TypeScript 5"]
    end

    subgraph BackendTier ["2. Application & Fiscal Engine"]
        FastAPI["FastAPI Core Backend (Python 3.11)<br/>Pydantic v2 Strict Decimal Math • Uvicorn Async REST API"]
    end

    subgraph ServicesTier ["3. Persistence, Intelligence & Document Services"]
        direction LR
        DB[("PostgreSQL 15+ & pgvector<br/>Supabase Managed Relational Store<br/>Row-Level Security & Immutability Triggers")]
        RAG["Regulatory RAG Pipeline<br/>LangChain • text-embedding-004 • Gemini 1.5 Flash<br/>Article Citations & Refusal Fallback Gate"]
        PDF["Document Generator<br/>ReportLab / PyMuPDF<br/>Arabic RTL Shaping (Cairo / Amiri)"]
    end

    Client -->|HTTPS REST API| NextApp
    NextApp -->|JSON API Requests| FastAPI
    FastAPI -->|SQL via asyncpg| DB
    FastAPI -->|Query Relaying| RAG
    FastAPI -->|Invoice Data Payloads| PDF
    RAG -->|Vector Cosine Search| DB
```

> **Deployment:** Frontend on Vercel · Backend API on Cloud/Render · Automated CI via GitHub Actions (`.github/workflows/ci.yml`)

### What Runs Where (Live Demo vs. Full-Stack Architecture)

To guarantee zero-friction evaluator accessibility without requiring database setup or external API dependencies during review:
- **Live Vercel Web App (`moukawil-os.vercel.app`):** Runs the Next.js 16 presentation tier connected to the live FastAPI backend API and Supabase PostgreSQL instance. All user interactions (creating invoices, issuing credit notes, recording payments, recalculating turnover) communicate with live REST API endpoints with persistent database synchronization.
- **Standalone Evaluation Seed (`scripts/seed_demo_data.py`):** Populates the live Supabase database with realistic multi-status invoices, B2B/B2C clients, and linked credit notes for instant reviewer inspection.
- **Backend REST Service (`backend/`):** A standalone Python FastAPI application using Pydantic v2 exact decimal types and endpoints designed for multi-tenant PostgreSQL / Supabase persistence.
- **Regulatory Intelligence (`rag/`):** Grounded legal retrieval pipeline pairing Google Gemini (gemini-1.5-flash & text-embedding-004) with deterministic statutory keyword and article lookup over indexed JORADP Gazette PDFs (F2022085.pdf).

---

### Canonical Invoice Lifecycle

MoukawilOS enforces a formal state machine across the database, API, and user interface. Invoices transition through three canonical states:

```mermaid
flowchart LR
    DRAFT["<strong>1. DRAFT</strong><br/><em>(Brouillon)</em><br/>• Fully editable<br/>• Zero turnover impact<br/>• No tax liability<br/>• Can be safely deleted"]
    
    ISSUED["<strong>2. ISSUED / PENDING</strong><br/><em>(En attente)</em><br/>• Permanent FA-YYYY-NNN<br/>• Locked against edits<br/>• Zero cash-basis impact<br/>• Errors require Credit Note"]
    
    PAID["<strong>3. PAID / SETTLED</strong><br/><em>(Encaissée)</em><br/>• Permanently immutable<br/>• Consumes 5M DA ceiling<br/>• Computes definitive 0.5% IFU<br/>• View & Download PDF only"]

    DRAFT -->|"Finalize Invoice"| ISSUED
    ISSUED -->|"Record Settlement Payment"| PAID
```

#### Lifecycle State Definitions & Invariants

1. **`DRAFT` (Brouillon):**
   - Editable across all fields (client selector, line items, quantities, dates).
   - Unassigned sequential number; excluded from official registers.
   - **Excluded** from all turnover aggregations, ceiling tracking, and tax liability calculations.
   - Can be permanently deleted.

2. **`ISSUED / PENDING` (En attente d'encaissement):**
   - Triggered when the user finalizes the invoice.
   - Assigned a permanent, gapless sequential identifier (`FA-YYYY-NNN`).
   - Immutably locked: `PUT`, `PATCH`, and `DELETE` endpoints return `403 Forbidden`.
   - **Statutory Cash-Basis Invariant:** Billed amounts represent outstanding receivables. They **do not** consume the 5,000,000 DZD annual ceiling and **do not** trigger IFU tax liability.
   - Can transition to `PAID` once the client settles payment.
   - Cannot be modified or deleted to fix errors; corrections require issuing a linked Credit Note (`AV-YYYY-NNN`).

3. **`PAID / SETTLED` (Encaissée):**
   - Triggered exclusively when the user executes the "Record Payment" action, providing settlement date, payment channel (*Virement*, *Chèque*, *BaridiMob*, or *Espèces*), and reference.
   - **Strictly and permanently immutable.** Editing and deleting are architecturally impossible.
   - **Statutory Turnover Consumption:** This state is the sole trigger for revenue recognition under Algerian tax law (*CIDTA art. 282 sexies*). Settled amounts immediately advance the 5,000,000 DZD ceiling gauge and update IFU tax calculations.
   - Any post-payment refund or billing rectification strictly requires generating a linked Credit Note (`AV-YYYY-NNN`).

---

### Sequence Diagram: Cash-Basis Settlement & Turnover Aggregation

The sequence below illustrates the separation between invoice finalization (which creates legal documentation without fiscal liability) and payment settlement (which drives statutory turnover and tax liability):

```mermaid
sequenceDiagram
    autonumber
    actor User as Freelancer
    participant Web as Next.js Web App
    participant API as FastAPI Backend (Decimal Engine)
    participant DB as PostgreSQL Database

    Note over User,DB: Phase 1: Invoice Finalization (Zero Fiscal Impact)
    User->>Web: Fill line items & click "Finalize Invoice"
    Web->>API: POST /api/invoices (status="issued")
    API->>API: Validate NIF, ANAE Card & Nomenclature Code
    API->>DB: Save as ISSUED with next FA-YYYY-NNN
    DB-->>API: Confirm record saved
    API-->>Web: Return Invoice FA-YYYY-NNN
    Web-->>User: Invoice locked (Turnover unchanged: 0 DZD)

    Note over User,DB: Phase 2: Payment Settlement (Statutory Cash-Basis Trigger)
    User->>Web: Click "Record Payment" (date & channel)
    Web->>API: POST /api/invoices/{id}/payment
    API->>DB: UPDATE status="paid", settled_at=...
    DB-->>API: Status updated to PAID
    
    API->>DB: Query sum of PAID invoices for active year
    DB-->>API: Return raw settled turnover
    API->>API: Decimal calc: max(0.005 * Turnover, 10,000 DA)
    API-->>Web: Return updated fiscal state (Turnover, Ceiling %, IFU)
    Web-->>User: Ceiling gauge advances & IFU tax updates
```

---

## 6. Fiscal Rules & Deterministic Compliance Engine

All fiscal formulas implemented in MoukawilOS are derived from verified official Algerian legal sources (see [Sources](#18-sources)).

### 1. The Cash-Basis Principle (Encaissement Réel)

Under **Article 282 sexies of the Code des Impôts Directs et Taxes Assimilées (CIDTA)**, auto-entrepreneurs are taxed exclusively on cash receipts (*« le chiffre d'affaires effectivement encaissé »*). 

Unpaid issued invoices do not constitute taxable turnover and do not consume the statutory ceiling. Revenue is recognized only upon verified financial clearance.

### 2. The IFU Tax Formula

The *Impôt Forfaitaire Unique* (IFU) for auto-entrepreneurs was reduced from 5% to **0.5%** by Article 14 of the 2024 Finance Law (Law No. 23-22), subject to the statutory minimum tax floor of **10,000 DZD** under CIDTA Article 365 bis:

$$\text{IFU Due} = \max\left(0.005 \times \text{Annual Collected Turnover}, 10\,000\text{ DZD}\right)$$

| Annual Collected Turnover | Computed 0.5% Rate | Statutory Minimum Floor | **Definitive IFU Due** | Applied Statutory Rule |
|---:|---:|---:|---:|---|
| **0 DZD** | 0 DZD | 10,000 DZD | **10,000 DZD** | Statutory minimum applies (*CIDTA art. 365 bis*) |
| **1,000,000 DZD** | 5,000 DZD | 10,000 DZD | **10,000 DZD** | Statutory minimum applies (5,000 < 10,000) |
| **2,000,000 DZD** | 10,000 DZD | 10,000 DZD | **10,000 DZD** | Exact statutory equilibrium point |
| **3,000,000 DZD** | 15,000 DZD | 10,000 DZD | **15,000 DZD** | Standard 0.5% rate applies (*CIDTA art. 282 sexies*) |
| **4,000,000 DZD** | 20,000 DZD | 10,000 DZD | **20,000 DZD** | Standard 0.5% rate (80% preventative warning trigger) |
| **5,000,000 DZD** | 25,000 DZD | 10,000 DZD | **25,000 DZD** | Maximum legal IFU liability within statutory ceiling |

#### Split Payment Schedule (Fractionnement)

Under CIDTA Article 365, auto-entrepreneurs can settle their IFU in three installments:
- **Installment 1 (50%):** Payable by **30 June** alongside the G12 declaration (minimum payable: 5,000 DZD).
- **Installment 2 (25%):** Payable between **1 September and 15 September**.
- **Installment 3 (25%):** Payable between **1 December and 15 December**.

---

### 3. CASNOS Social Security Engine

Social security contributions for non-salaried workers (*CASNOS*) are governed by Executive Decree No. 15-289, modified by Executive Decree No. 26-257 of 15 July 2026:
- **Flat Auto-Entrepreneur Regime (Option A):** Fixed annual contribution of **24,000 DZD** per calendar year (*Décret 26-257 art. 14*).
- **General Regime (Option B):** 15% of annual declared income, bounded by:
  - Minimum contribution floor: **43,200 DZD** (1 × annual SNMG of 288,000 DZD).
  - Maximum contribution ceiling: **864,000 DZD** (20 × annual SNMG of 5,760,000 DZD).
- **Settlement Deadline:** Strictly annual, due on or before **30 June** of each calendar year. There is no quarterly CASNOS schedule for independent workers in Algeria.

---

### 4. Precision Engineering: Floating-Point Rounding Error Prevention

> **Core Engineering Invariant:**  
> Financial and fiscal calculations in MoukawilOS never use IEEE 754 standard floating-point numbers (`float`). In standard floating-point arithmetic, binary representations introduce rounding discrepancies (e.g., `0.1 + 0.2 = 0.30000000000000004`). In regulatory compliance, a micro-penny discrepancy near statutory thresholds (e.g., 4,999,999.9999 DZD vs. 5,000,000.00 DZD) can trigger false ceiling breach alerts or inaccurate tax declarations.
>
> MoukawilOS enforces exact fixed-point arithmetic across the entire pipeline:
> - **API & Business Logic:** Python `decimal.Decimal` with strict `ROUND_HALF_UP` rounding.
> - **Data Validation:** Pydantic v2 schemas configured with `condecimal(max_digits=14, decimal_places=2)`.
> - **Database Layer:** PostgreSQL `NUMERIC(14, 2)` column types for all financial amounts.

---

### 5. Ceiling Logic Flowchart

The workflow below executes exclusively upon recording payment settlement:

```mermaid
flowchart TD
    A([Payment Recorded: Invoice Marked as PAID]) --> B[Query Sum of All PAID Invoices for Active Calendar Year]
    B --> C[Deduct Settled Credit Notes AV-YYYY-NNN]
    C --> D[Current Collected Turnover Calculated via Python Decimal]
    
    D --> E{Turnover >= 5,000,000 DZD?}
    E -- Yes --> F[Flag Statutory Ceiling Breach Alert]
    F --> G[Increment Consecutive Breach Counter]
    G --> H{Consecutive Years >= 3?}
    H -- Yes --> I[Trigger Mandatory Radiation Warning under Law 22-23 Art. 13-14]
    H -- No --> J[Notify Annual Exceedance: Status Preserved for Active Year]
    
    E -- No --> K{Turnover >= 4,000,000 DZD?}
    K -- Yes --> L[Trigger MoukawilOS 80% Preventative Early Warning]
    K -- No --> M[Status Normal: Headroom Remaining]
    
    I --> N[Recompute IFU: max 0.005 * Turnover, 10,000 DZD]
    J --> N
    L --> N
    M --> N
    N --> O([Update Dashboard & Compliance Simulator])
```

---

### 6. Statutory Declaration Calendar

```mermaid
timeline
    title Algerian Auto-Entrepreneur Statutory Calendar
    Day 1 - 30 : File Déclaration d'Existence (Série G n° 8) at local Tax Center (CDI/CPI) to obtain 15-digit NIF
    30 June : G12 Provisional Turnover Declaration (DGI)
            : Settle IFU (Full payment or 50% split installment)
            : CASNOS Annual Social Security Contribution (24,000 DZD flat or 15% regime)
    15 September : IFU Split Installment 2 (25%)
    15 December : IFU Split Installment 3 (25%)
    20 January (N+1) : G12 bis Final Regularisation Declaration (DGI)
```

---

## 7. Regulatory RAG Intelligence Service

The MoukawilOS Regulatory Assistant is a specialized retrieval-augmented generation (RAG) microservice that answers legal and administrative questions grounded strictly in official Algerian legal texts.

### 1. Indexed Regulatory Corpus

The retrieval corpus is restricted to verified Algerian statutory texts:

| Legal Document | Official Citation | Key Subject Matter Covered | Verification Status |
|---|---|---|---|
| **Loi n° 22-23** | 18 December 2022 (*JORA n° 85*) | Auto-entrepreneur status, rights, obligations, 5,000,000 DZD ceiling, 3-consecutive-years radiation rule (*art. 13-14*). | Verified Official |
| **Décret exécutif n° 23-196** | 25 May 2023 (*JORA n° 37*) | Organization of ANAE, National Auto-Entrepreneur Registry, registration portal, card issuance. | Pending Source Verification |
| **Décret exécutif n° 23-197** | 25 May 2023 (*JORA n° 37*) | Official nomenclature of the 7 approved activity sectors and individual eligibility codes. | Verified Official |
| **Loi de Finances 2024 (Loi 23-22)** | 24 December 2023 (*JORA n° 86*) | Reduced 0.5% IFU rate (*CIDTA art. 282 sexies*), 10,000 DZD minimum floor (*art. 365 bis*). | Verified Official |
| **Décret exécutif n° 26-257** | 15 July 2026 (*JORA n° 53*) | Flat 24,000 DZD annual CASNOS social security contribution for auto-entrepreneurs. | Verified Official |
| **Décret exécutif n° 05-468** | 10 December 2005 (*JORA n° 80*) | Mandatory commercial invoice mentions, sequential numbering, and credit note requirements (*art. 10-11*). | Verified Official |
| **Code de Commerce** | Article 12 | 10-year statutory retention and archiving obligation for commercial and fiscal documents. | Verified Official |

---

### 2. Article-Aware Chunking Strategy

Standard character-count or fixed-token chunking strategies split legal articles across arbitrary boundaries, separating clauses from their statutory context. MoukawilOS uses an **Article-Boundary Chunking Pipeline**:
- Documents are parsed along structural article headers (*"Article X"* / *"المادة X"*).
- Articles under 800 tokens remain unfragmented, preserving the legal condition, rule, and exceptions in a single chunk.
- Structured metadata (law title, article reference, official JORADP PDF URL, and verification status) is injected into each chunk payload.

---

### 3. Anti-Hallucination Guardrails & Verifiable Gazette Auditing

To guarantee **Zero Hallucination** on statutory legal and fiscal matters, the intelligence engine implements a strict two-tier guardrail protocol:

```mermaid
flowchart TD
    Q([User Question in English, French, or Arabic]) --> P{Out-of-Scope Pre-Filter Check?<br/><i>SARL, IBS, Crypto, Import-Export, Liberal Professions</i>}
    
    P -- Out-of-Scope Match --> G[Trigger Deterministic Statutory Refusal<br/><i>citations: empty · Guardrail Badge displayed</i>]
    
    P -- Legitimate In-Scope Query --> E[Generate Query Embedding via text-embedding-004]
    E --> V[Vector Search: Cosine Similarity over pgvector Legal Chunks]
    V --> S{Top Similarity Score >= 0.70?}
    
    S -- Yes --> C[Inject Matched Legal Chunks into System Context]
    C --> A[Synthesize Answer with Verbatim Citations & Gazette PDF Linking]
    
    S -- No --> G
```

#### Tier 1: Pre-Filter Out-of-Scope Guardrail
Queries regarding commercial corporate entities (*SARL, EURL, SPA*), corporate profits tax (*IBS*), cryptocurrency/speculative trading, or excluded commercial activities (*import-export, wholesale, liberal professions*) are intercepted **before** any model generation or topic routing. The engine outputs a deterministic refusal explaining the statutory boundary of Law 22-23 and returns an empty citations array (`citations: []`), visually badged with:
`Anti-Hallucination Guardrail · Out-of-Scope Statutory Refusal`

#### Tier 2: Low-Confidence Refusal Protocol
For in-scope queries that cannot be resolved with high statutory confidence (`similarity < 0.70`), generation is bypassed entirely. The service returns a standardized referral notice directing users to official administrative portals (*DGI, ANAE, CASNOS*).

#### Verifiable Official Gazette PDF Auditing
Every verified response is paired with direct citation badges (e.g. `Loi 22-23 · Art. 2`, `Décret 23-197 · Art. 4`). Clicking any citation opens the **Statutory Source Inspector**:
* **Verbatim Gazette Reader**: Shows official text with margin line numbers and the exact enforced clause highlighted.
* **Authentic Gazette PDF Viewer**: Embeds the authentic scanned PDF from the *Journal Officiel de la République Algérienne* (e.g., `F2022085.pdf`, `F2023037.pdf`), allowing evaluators to verify the legal deduction with their own eyes.

---

## 8. Technical Stack

MoukawilOS standardizes on a modern, decoupled web architecture:

| Tier | Technology | Specification / Version | Rationale & Architectural Purpose |
|---|---|---|---|
| **Frontend Framework** | **Next.js 16.3** | Next.js 16.3.8, App Router, React 19.2.8, Turbopack | Modern server-rendered and client performance, type-safe routes, zero-friction client state transitions. |
| **Styling & UI Tokens** | **Tailwind CSS v4 & Lucide Icons** | Tailwind CSS ^4, Lucide React ^1.58 | Curated Algerian fiscal design system, responsive data tables, accessible dark-mode tokens. |
| **Core API Backend** | **FastAPI** | Python 3.11, Uvicorn, FastAPI 0.110+ | Asynchronous REST API under `backend/app/main.py` with automatic OpenAPI docs (`/docs`). |
| **Validation & Fiscal Engine** | **Pydantic v2 & Python Decimal** | Strict Decimal types | Zero floating-point drift on currency and tax calculations; strict schema validation. |
| **RAG Microservice** | **FastAPI & LangChain** | Python 3.11, LangChain Core | Standalone retrieval service under `rag/app/main.py` grounded in indexed Algerian legal decrees. |
| **Relational Database** | **PostgreSQL 15+** | Supabase Managed Relational Store | Multi-tenant schema with 10 incremental migrations, strict triggers, and Row-Level Security (RLS). |
| **Vector Search Engine** | **pgvector** | HNSW cosine index (`vector(768)`) | Semantic legal similarity search over chunked Algerian statutory texts embedded directly inside PostgreSQL. |
| **Document Compilation** | **Multilingual A4 Renderer & PDF Engine** | DIN 476 / ISO 216 Engine, ReportLab | Standardized legal invoice export supporting Arabic bidirectional text shaping (`arabic-reshaper`, `python-bidi`), French, and English. |
| **Testing & CI/CD** | **Pytest & TypeScript** | 96 Automated Tests (100% Pass) | Comprehensive unit and API test suite covering statutory boundaries, credit notes, and numbering. |
| **CI/CD & Deployment** | **Vercel, Render & GitHub Actions** | Production Cloud Pipelines | Deployment: Frontend on Vercel · Backend API on Cloud/Render · Automated CI via GitHub Actions (.github/workflows/ci.yml) |

---

## 9. Local Development Setup

### Prerequisites

| Tool | Minimum Version | Recommended Source |
|---|---|---|
| **Node.js** | 20.x or newer (LTS) | [nodejs.org](https://nodejs.org/) |
| **Python** | 3.11 or newer | [python.org](https://www.python.org/) |
| **Git** | 2.38 or newer | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL / Supabase** | PostgreSQL 15+ with `pgvector` | Local PostgreSQL or [Supabase](https://supabase.com) project (for production mode) |
| **Gemini API Key** | Valid API key | [aistudio.google.com](https://aistudio.google.com) (for live RAG assistant) |

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/AYA-BACHA/MoukawilOS.git
cd MoukawilOS
```

---

### Step 2: Frontend Setup (Next.js 16)

The frontend connects to the live FastAPI backend service with persistent state synchronization, client-side fallback storage, and Turbopack-optimized compilation:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000** in your browser to access the complete application (Dashboard, Invoice Builder, Ledger, Client Directory, and AI Assistant).

---

### Step 3: Backend API Setup (FastAPI)

1. Open a new terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive Swagger API documentation is available at **http://localhost:8000/docs**.

---

### Step 4: Regulatory RAG Microservice Setup (Optional)

1. Open a new terminal and navigate to the RAG service directory:
   ```bash
   cd rag
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```

3. Install RAG service dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *Set your `GEMINI_API_KEY` in `.env`.*

5. Start the RAG microservice:
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```

---

### Unified Environment Variables

| Variable | Target Service | Purpose & Format | Example Value |
|---|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string with SSL | `postgresql+asyncpg://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| `GEMINI_API_KEY` | Backend / RAG | Google Gemini API key for legal embeddings & RAG | `AIzaSyxxxxxxxxxxxxxxxxxxxxxxx` |
| `ALLOWED_ORIGINS` | Backend | Comma-separated list of origins allowed by CORS | `http://localhost:3000,https://moukawil-os.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL of the backend REST API | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_URL` | Frontend | Public URL of the frontend web application | `http://localhost:3000` |

---

## 10. Project Structure

MoukawilOS is structured as a clean monorepo:

```
MoukawilOS/
├── frontend/                     # Next.js 16 Presentation Tier (App Router, React 19, Tailwind v4)
│   ├── app/                      # Route segments (Dashboard, Invoices, Clients, Assistant, Settings)
│   ├── components/               # UI components, data tables, fiscal gauges, modals
│   ├── data/                     # Seeded JSON database (db.json) for standalone evaluation
│   ├── lib/                      # API client, stats calculations, i18n dictionaries (en, fr, ar)
│   ├── types/                    # TypeScript data models and interfaces
│   ├── public/                   # Brand assets and logos
│   └── package.json              # Next.js 16.3.8 & React 19 dependencies
│
├── backend/                      # FastAPI Core Application & Business Services
│   ├── app/                      # Application package
│   │   ├── api/                  # REST API routes (health, invoices, clients, profile)
│   │   ├── calculation/          # Deterministic Decimal fiscal calculation engine
│   │   ├── core/                 # App configuration, security settings, CORS policies
│   │   ├── pdf/                  # PDF compilation engine
│   │   ├── repositories/         # Database persistence abstractions
│   │   ├── schemas/              # Pydantic v2 schemas with strict Decimal validation
│   │   ├── services/             # Fiscal services & sequential numbering
│   │   └── main.py               # FastAPI application entrypoint (port 8000)
│   ├── requirements.txt          # Python dependencies
│   └── tests/                    # Pytest test suites
│
├── rag/                          # Regulatory RAG Knowledge Engine & Microservice
│   ├── app/                      # RAG retrieval endpoints and LangChain orchestration
│   ├── requirements.txt          # Python dependencies
│   └── tests/                    # Legal benchmark evaluation tests
│
├── database/                     # PostgreSQL & Supabase Relational Assets
│   └── migrations/               # Incremental SQL migrations
│
├── docs/                         # Canonical Technical & Legal Specifications
│   ├── architecture.md           # Architecture specification
│   ├── legal-sources.md          # Comprehensive regulatory registry with JORADP links
│   ├── product.md                # Product specifications and state machine
│   └── screenshots/              # High-resolution production app screenshots
│
├── .github/                      # CI/CD Workflows
│   └── workflows/ci.yml          # GitHub Actions workflow
├── .env.example                  # Environment variable blueprint
├── LICENSE                       # Proprietary License
└── README.md                     # Institutional documentation
```

---

## Project Status

**Live MVP Deployed & Tested:** https://moukawil-os.vercel.app/dashboard (accessible instantly with pre-seeded demo auto-entrepreneur data or live Supabase authentication).  

* **Core Flow Works End-to-End:** Create invoice → Issue with sequential `FA-YYYY-NNN` → Record payment → Live cash-basis turnover & 0.5% IFU / CASNOS recalculation.
* **Credit Notes (Avoirs):** Issue `AV-YYYY-NNN` credit notes directly from invoice views, automatically updating net turnover and filtering under the 'Credited' ledger tab (*Décret 05-468 art. 11*).
* **Live FastAPI Compliance Engine:** Server-side endpoints (`/api/analytics/turnover`, `/api/compliance/calendar`, `/api/compliance/simulate`, `/api/invoices/{id}/credit-note`) backed by strict `Decimal` mathematics.
* **Comprehensive Test Suite:** **96/96 passing automated tests (100%)** spanning calculation boundary conditions, credit note lifecycle, sequential numbering invariants, and onboarding security.
* **Regulatory Legal AI:** Zero-hallucination assistant with authentic JORADP Gazette PDF auditing, verbatim clause highlighting, and bilingual Arabic (RTL) / French / English document generation.

## Team

| Name | Role | Responsibilities & Core Modules |
|---|---|---|
| **Bacha Aya** | Founder & Project Lead | System architecture, regulatory domain modeling, sprint direction, and full-stack integration |
| **Yasmine Hamaili** | Frontend Developer | Design system implementation, client dashboard UI, and invoice builder |
| **Kawther Yakoub** | Backend Developer | FastAPI microservices, PostgreSQL schemas, and deterministic 0.5% fiscal engine |
| **Rahima Hamouda** | Data & ML Engineer | Regulatory RAG corpus, JORADP Gazette indexing, and anti-hallucination guardrails |
| **Ilyes Guebabi** | Business & Operations | ANAE/CASNOS compliance, enterprise billing models, and freelancer field interviews |

---

## 12. AI Transparency & Attribution

We maintain complete transparency regarding the role of Artificial Intelligence in MoukawilOS:

| Context | AI Tooling / Model | Implementation Scope | Verification & Engineering Boundaries |
|---|---|---|---|
| **Inside the Product** | Local Statutory Retrieval & Google Gemini API Target (`text-embedding-004`, `Gemini 1.5 Flash`) | The live web demo operates via deterministic keyword retrieval grounded strictly in indexed Algerian decrees; the standalone RAG microservice targets Gemini embeddings with cosine similarity thresholds (refusal fallback below 0.70). | Deterministic execution: tax math never goes through the LLM. Fiscal calculations are isolated in deterministic code and physically separated from AI generation. |
| **During Development** | Claude, Gemini, GitHub Copilot | Code assistance, unit test scaffolding, and drafting repetitive boilerplate. | All generated code, database schemas, and mathematical formulas were audited, reviewed, and verified against Algerian statutes by human engineers before merging. |

---

## 13. Known Limitations & Engineering Trade-Offs

We believe rigorous engineering requires transparently documenting technical constraints and deliberate architectural trade-offs:

1. **Manual Payment Settlement Confirmation:**
   Algerian financial institutions and postal systems (*SATIM*, *BaridiMob*, *CCP*) do not currently offer public developer APIs or automated webhook notifications for individual accounts. As a result, invoice payment settlement requires the user to manually click "Record Payment" and enter the transaction date and settlement channel. Automated bank statement parsing (CSV/OCR) is scheduled for the Month 1 Closed Beta target milestone to streamline this step.

2. **Single-User Workspace Scope:**
   The MVP is architected for single-operator accounts. Multi-user enterprise delegation, sub-contractor permission tiers, and external accountant portal access are outside the MVP scope and slated for future releases.

3. **Regulatory Corpus Boundary:**
   The regulatory assistant indexes primary national legislation governing auto-entrepreneurs (*Loi 22-23*, *Décrets 23-196, 23-197, 15-289, 26-257, 05-468*, *CIDTA*). Queries involving general corporate law, complex intellectual property litigation, or non-statutory municipal regulations fall outside the indexed corpus and trigger the deterministic refusal fallback.

4. **Static Statutory Rule Parameters:**
   Core fiscal parameters (0.5% IFU rate, 10,000 DZD floor, 5,000,000 DZD ceiling) are managed via centralized configuration modules. If future annual Finance Laws alter these values, updates require updating configuration parameters rather than automatic runtime legal interpretation.

5. **Arabic PDF Font Embedding:**
   High-fidelity Arabic RTL invoice rendering requires bundled TrueType font glyphs (Amiri and Cairo) with custom bidirectional shaping libraries. While tested across modern PDF viewers (Chrome, Adobe Acrobat, Preview), legacy non-Unicode PDF readers may display disconnected glyphs.

---

## 14. Roadmap & Future Scope

```mermaid
flowchart LR
    P1["<strong>Phase 1: MVP Core</strong><br/><em>[Completed]</em><br/>• Cash-basis turnover tracker<br/>• 5M DA ceiling & 80% warning<br/>• Multilingual PDF invoices<br/>• Regulatory RAG assistant"]
    
    P2["<strong>Target Milestone / Post-MVP</strong><br/><em>[Month 1 Closed Beta]</em><br/>• Official DGI PDF overlay<br/>• Bank statement ingestion<br/>• Accountant fiscal package"]
    
    P3["<strong>Future Integrations</strong><br/><em>[2027]</em><br/>• DGI Jibayatic API integration<br/>• Direct CASNOS portal bridge<br/>• Multi-operator workspaces"]

    P1 --> P2 --> P3
```

- **Phase 1: MVP Core (Completed):**
  - Cash-basis turnover tracking with 5,000,000 DZD ceiling gauge and 80% warning.
  - Gapless sequential invoicing (`FA-YYYY-NNN`) and credit notes (`AV-YYYY-NNN`).
  - Multilingual PDF export (Arabic RTL, French, English).
  - Deterministic IFU and CASNOS calculation engine.
  - Regulatory RAG microservice with legal citations and deterministic refusal fallback.

- **Target Milestone / Post-MVP (Month 1 Closed Beta):**
  - **Official DGI Pixel-Perfect PDF Overlay:** Direct PDF overlay on government Série G n° 12 and G n° 12 bis tax declarations pre-populated directly from the annual cash-basis ledger.
  - **Automated Bank Statement Ingestion:** Ingestion pipeline for parsing domestic bank and postal statements (BaridiMob / CCP / SATIM CSV and PDF exports) to automatically match bank credits to issued invoices.
  - **Accountant Export Package:** Annual fiscal and ledger audit export package for certified accountants.

- **Future Scope: Official Digital Tax Portal Integration (2027):**
  - Direct integration with emerging national tax platforms (DGI Jibayatic) as public administrative APIs become available.
  - Direct CASNOS social security portal verification bridge.
  - Multi-operator workspace delegations.

---

## 15. Security & Multi-Tenancy Architecture

MoukawilOS enforces security at every layer of the stack:

1. **Multi-Tenant Data Isolation (Row-Level Security):**  
   All relational database tables enforce PostgreSQL Row-Level Security (RLS) policies tied to the authenticated user's token (`auth.uid() = user_id`). Users cannot access, query, or modify another operator's clients, invoices, or fiscal metrics.

2. **Database-Level Immutability Constraints:**  
   PostgreSQL trigger functions reject any `UPDATE` or `DELETE` statements executed against invoices with a status of `issued` or `paid`. Even in the event of an API validation regression, the database prohibits tampering with finalized invoices.

3. **Secure Credential Handling:**  
   Credential isolation practices ensure that API tokens, database passwords, and secret keys are excluded from repository commits. Sensitive variables are loaded strictly from environment configuration files.

To verify that no sensitive credential files are tracked in your git clone:

```bash
git ls-files | grep -E '(\.env|\.pem|\.key)$'
# Must return empty output
```

---

## 16. Regulatory & Legal Disclaimer

MoukawilOS is an administrative and fiscal productivity tool designed to help Algerian auto-entrepreneurs organize their records, track statutory ceilings, and prepare for formal declarations. 

**MoukawilOS does not provide certified legal, tax, or accounting advice.** Tax legislation, procedural decrees, and administrative interpretations are subject to amendment by Algerian authorities. Calculations and assistant outputs are provided for guidance purposes only. Users must verify their final tax and social security declarations with their local tax center (*Direction Générale des Impôts - DGI*), the *Agence Nationale de l'Auto-Entrepreneur (ANAE)*, or the *Caisse Nationale de Sécurité Sociale des Non-Salariés (CASNOS)*.

---

## 17. License

Copyright (c) 2026 the MoukawilOS team. All rights reserved.

This project, its source code, architecture, and associated documentation are proprietary. The repository is made publicly accessible strictly for portfolio review, technical demonstration, and evaluation purposes.

No license or permission is granted to copy, reproduce, modify, redistribute, fork for commercial use, or deploy this software in any commercial or production environment without prior express written authorization from the copyright holder. See [`LICENSE`](LICENSE) for complete terms.

---

<a id="18-sources"></a>
## 18. Statutory & Regulatory Sources

The compliance logic and regulatory citations in MoukawilOS are grounded in the following official publications of the People's Democratic Republic of Algeria:

1. **Statut de l'Auto-Entrepreneur:**  
   *Loi n° 22-23 du 18 décembre 2022 portant statut de l'auto-entrepreneur.*  
   Journal Officiel de la République Algérienne Démocratique et Populaire (JORADP) n° 85 du 19 décembre 2022.  
   Official Portal: [joradp.dz](https://www.joradp.dz)

2. **Organisation de l'ANAE et Registre National:**  
   *Décret exécutif n° 23-196 du 25 mai 2023 fixant l'organisation et le fonctionnement de l'Agence Nationale de l'Auto-Entrepreneur.*  
   JORADP n° 37 du 4 juin 2023.

3. **Nomenclature des Activités Éligibles (7 Domaines):**  
   *Décret exécutif n° 23-197 du 25 mai 2023 fixant la liste des activités éligibles au statut de l'auto-entrepreneur.*  
   JORADP n° 37 du 4 juin 2023.  
   Official Portal: [anae.dz](https://www.anae.dz)

4. **Taux de l'IFU (0,5%) et Minimum Fiscal (10 000 DA):**  
   *Loi n° 23-22 du 24 décembre 2023 portant Loi de Finances pour 2024 (Article 14).*  
   Modifiant les articles 282 sexies et 365 bis du *Code des Impôts Directs et Taxes Assimilées (CIDTA)*.  
   Official Portal: [mfdgi.gov.dz](https://www.mfdgi.gov.dz)

5. **Déclarations Fiscales G12 et G12 bis:**  
   *Code des Impôts Directs et Taxes Assimilées (CIDTA), Article 282 quater et Article 365.*  
   Direction Générale des Impôts (DGI).

6. **Cotisation CASNOS Forfaitaire (24 000 DA):**  
   *Décret exécutif n° 26-257 du 15 juillet 2026 modifiant le décret exécutif n° 15-289 relatif à la sécurité sociale des non-salariés.*  
   JORADP n° 53 du 23 juillet 2026.  
   Official Portal: [casnos.com.dz](https://casnos.com.dz)

7. **Facturation Commerciale et Mentions Obligatoires:**  
   *Décret exécutif n° 05-468 du 10 décembre 2005 fixant les conditions et les modalités d'établissement de la facture.*  
   JORADP n° 80 du 11 décembre 2005.

8. **Conservation et Archivage Décennal des Factures:**  
   *Code de Commerce Algérien, Article 12.*
