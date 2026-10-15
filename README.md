<div align="center">

# MoukawilOS

### Regulatory and Fiscal Compliance Workspace for Algerian Auto-Entrepreneurs

Statutory compliance under Law 22-23 and Executive Decree 23-197 &nbsp;|&nbsp; Strict cash-basis turnover tracking (5,000,000 DZD ceiling) &nbsp;|&nbsp; Deterministic 0.5% IFU calculation &nbsp;|&nbsp; Multilingual PDF invoicing (Arabic RTL, French, English) &nbsp;|&nbsp; Regulatory RAG assistant with verified legal citations

[Live Demo](https://moukawil-os.vercel.app) &nbsp;|&nbsp; [Demo Video](https://moukawil-os.vercel.app) &nbsp;|&nbsp; [Source Code](https://github.com/AYA-BACHA/MoukawilOS)

![Next.js](https://img.shields.io/badge/Next.js_14-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v3-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/API-Render-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red.svg)

<img src="docs/screenshots/hero.png" alt="MoukawilOS Dashboard" width="860">

</div>

> **Notice on Workspace vs. Document Localization:**  
> The MoukawilOS web application user interface is engineered strictly in **English** to guarantee international evaluator accessibility, standardized UX ergonomics, and clean developer readability. In contrast, generated export invoices (the official legal PDF documents issued to Algerian commercial entities, domestic clients, and tax authorities) support complete multilingual rendering in **Arabic (with native right-to-left layout and glyph shaping)**, **French**, and **English**.

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
11. [Engineering Team](#11-engineering-team)
12. [AI Transparency & Attribution](#12-ai-transparency--attribution)
13. [Known Limitations & Engineering Trade-Offs](#13-known-limitations--engineering-trade-offs)
14. [Roadmap & Future Scope](#14-roadmap--future-scope)
15. [Security & Multi-Tenancy Architecture](#15-security--multi-tenancy-architecture)
16. [Regulatory & Legal Disclaimer](#16-regulatory--legal-disclaimer)
17. [License](#17-license)
18. [Statutory & Regulatory Sources](#18-statutory--regulatory-sources)

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
| **Automated Bank Statement Ingestion** | Ingestion pipeline for parsing domestic bank and postal statements (BaridiMob / CCP / SATIM) to automatically match bank credits to issued invoices. | Integrations: Ingest / Parser | In Active Development |
| **Pre-filled G12 / G12 bis Tax Forms** | Direct PDF compilation of official Direction Générale des Impôts (DGI) tax forms pre-populated from the annual cash-basis ledger. | Export Output: Official DGI Forms | In Active Development |

---

## 3. Try It in 30 Seconds

Evaluators and reviewers can verify the end-to-end statutory and fiscal workflows directly in the browser:

1. Open the live deployment: **https://moukawil-os.vercel.app**
2. Click **"Instant Guest Demo"** on the landing screen to load a pre-seeded workspace without registration.
3. Navigate to **Invoices** -> click **"New Invoice"**, select a client, add a billable line item in DZD, and click **"Finalize Invoice"**.
   - Notice the status updates to `ISSUED / PENDING`.
   - Return to the **Dashboard**: observe that the **Turnover Meter remains unchanged at 0 DZD consumed**. Under Law 22-23, issuing an invoice does not consume turnover or trigger tax liability.
4. Return to the invoice, click **"Record Payment"**, select settlement method (*Virement bancaire*, *Chèque*, or *BaridiMob*), and confirm.
   - The invoice transitions to the immutable `PAID` state.
5. Check the **Dashboard**:
   - The **Turnover Meter** increments by the settled amount.
   - The **5,000,000 DZD ceiling gauge** and remaining headroom recalculate.
   - The **IFU Tax Liability** updates immediately, adhering to the `max(0.5%, 10,000 DZD)` statutory floor.
6. Open the invoice details, toggle the language selector between **Arabic (RTL)**, **French**, and **English**, and click **"Download PDF"** to verify high-fidelity multilingual document compilation.
7. Open the **Regulatory Assistant** and test statutory grounding:
   - *Grounded Query:* "Which activities are eligible under the auto-entrepreneur status?" -> Returns approved sectors with citations to Executive Decree No. 23-197.
   - *Adversarial / Out-of-Scope Query:* "Can a retail pharmacy operate under auto-entrepreneur status?" -> System triggers a deterministic refusal stating the topic cannot be verified in the indexed decrees, refusing to hallucinate tax advice.

---

## 4. Screenshots & Interface Overview

| Dashboard & Cash-Basis Turnover Meter | Sequential Invoice Editor & Mandatory Mentions |
|---|---|
| <img src="docs/screenshots/dashboard.png" alt="MoukawilOS Dashboard" width="420"> | <img src="docs/screenshots/invoice-editor.png" alt="Invoice Editor" width="420"> |
| Real-time 5,000,000 DZD ceiling gauge with 80% preventative warning, cash-collected revenue cards, and statutory deadlines. | Gapless sequential numbering (`FA-YYYY-NNN`), seller NIF/ANAE injection, and automatic VAT exemption notices. |

| Arabic (RTL) Legal Invoice PDF | French / English Invoice PDF |
|---|---|
| <img src="docs/screenshots/invoice-ar.png" alt="Arabic RTL Invoice" width="420"> | <img src="docs/screenshots/invoice-fr-en.png" alt="French and English Invoice" width="420"> |
| Exportable A4 PDF rendering with bidirectional Arabic text shaping, right-to-left layout, and domestic tax notices. | Exportable A4 PDF rendering in French and English, formatted for international clients and institutional partners. |

| Compliance Simulator & Statutory Calendar | Regulatory Assistant with Legal Citations |
|---|---|
| <img src="docs/screenshots/compliance.png" alt="Compliance Simulator" width="420"> | <img src="docs/screenshots/assistant.png" alt="Regulatory Assistant" width="420"> |
| Deterministic IFU calculator (0.5% with 10,000 DZD minimum), CASNOS regime modeler, and official filing countdowns. | Semantic legal Q&A powered by pgvector, delivering article-level citations and deterministic refusal guardrails. |

---

## 5. System Architecture & Lifecycle Workflows

### System Architecture Overview

The platform uses a decoupled architecture separating the presentation tier, core API, relational and vector persistence, and document compilation:

```mermaid
flowchart LR
    ClientBrowser(["User Web Browser"]):::client -->|HTTPS / REST API| Frontend["Next.js 14+ Frontend<br/>Vercel (App Router, TypeScript)"]:::frontend
    Frontend -->|Internal REST API| CoreAPI["FastAPI Core Backend<br/>Render (Python 3.11, Pydantic v2)"]:::backend

    subgraph DataPersistence ["Persistence & Storage Tier"]
        CoreAPI --> RelationalDB[("PostgreSQL 15+<br/>Supabase (Managed)")]:::database
        CoreAPI --> VectorStore[("pgvector Extension<br/>HNSW Semantic Index")]:::database
    end

    subgraph DocumentEngine ["Document Generation"]
        CoreAPI --> PDFGen["ReportLab / PyMuPDF<br/>Arabic RTL Shaping (Cairo/Amiri)"]:::engine
    end

    subgraph IntelligenceService ["Regulatory Intelligence"]
        CoreAPI --> RAGService["LangChain RAG Pipeline<br/>Similarity Threshold Gate"]:::ai
        RAGService --> VectorStore
        RAGService --> LLMAPI["OpenAI API<br/>text-embedding-3-small & GPT-4o-mini"]:::ai
    end

    classDef client fill:#f8fafc,stroke:#334155,stroke-width:1px;
    classDef frontend fill:#eff6ff,stroke:#2563eb,stroke-width:2px;
    classDef backend fill:#ecfdf5,stroke:#059669,stroke-width:2px;
    classDef database fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef engine fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px;
    classDef ai fill:#fff1f2,stroke:#e11d48,stroke-width:2px;
```

---

### Canonical Invoice Lifecycle

MoukawilOS enforces a formal state machine across the database, API, and user interface. Invoices transition through three canonical states:

```
[ DRAFT ]  ────────── Finalize ──────────>  [ ISSUED / PENDING ]  ────────── Record Payment ──────────>  [ PAID / SETTLED ]
(Brouillon)                                   (En attente)              with settlement confirmation       (Encaissée)
     │                                              │                                                           │
     ▼                                              ▼                                                           ▼
 • Fully editable                               • Assigned permanent FA-YYYY-NNN                            • Strictly and permanently immutable
 • Excluded from turnover                       • Locked against edits and deletion                         • Included in cash-basis collected turnover
 • Excluded from IFU tax                        • Excluded from cash-basis turnover                         • Consumes 5,000,000 DZD statutory ceiling
 • Can be deleted                               • Excluded from IFU tax liability                           • Calculates definitive IFU tax liability
                                                • Can be settled via "Record Payment"                       • Action: View & Download PDF only
                                                • Error requires Credit Note (AV-YYYY-NNN)                  • Error requires Credit Note (AV-YYYY-NNN)
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
    participant FE as Next.js Frontend
    participant API as FastAPI Backend
    participant Calc as Decimal Fiscal Engine
    participant DB as PostgreSQL (Supabase)

    Note over User,DB: Phase 1: Invoice Finalization (Zero Turnover Impact)
    User->>FE: Fill line items & click "Finalize Invoice"
    FE->>API: POST /api/invoices (status="issued")
    API->>API: Validate NIF, ANAE Card & Nomenclature Code
    API->>DB: Assign next sequential number (FA-YYYY-NNN) & save as ISSUED
    DB-->>API: Invoice saved (State = ISSUED)
    API-->>FE: Return Invoice FA-YYYY-NNN
    FE-->>User: Display locked invoice. Turnover meter remains at 0 DZD.

    Note over User,DB: Phase 2: Payment Settlement (Statutory Cash-Basis Trigger)
    User->>FE: Click "Record Payment" (Select date & payment method)
    FE->>API: POST /api/invoices/{id}/payment
    API->>DB: UPDATE invoice SET status='paid', payment_date=..., method=...
    DB-->>API: Status updated to PAID
    
    API->>Calc: Compute annual collected turnover for active calendar year
    Calc->>DB: SELECT SUM(total_amount) FROM invoices WHERE status='paid' AND year=...
    DB-->>Calc: Return raw settled total
    Calc->>Calc: Apply exact Decimal arithmetic: max(0.005 * Turnover, 10000)
    Calc->>Calc: Evaluate 5,000,000 DZD statutory ceiling & 80% warning
    Calc-->>API: Return updated fiscal state (Turnover, Ceiling %, IFU Due)
    
    API-->>FE: Return confirmation + updated turnover metrics
    FE-->>User: Turnover gauge advances, IFU updates, remaining ceiling decreases
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
| **Décret exécutif n° 23-196** | 25 May 2023 (*JORA n° 37*) | Organization of ANAE, National Auto-Entrepreneur Registry, registration portal, card issuance. | Verified Official |
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

### 3. Anti-Hallucination Guardrails & Deterministic Refusal Fallback

To prevent LLMs from inventing tax rates, deadlines, or legal exemptions, the RAG microservice enforces strict guardrails:

```mermaid
flowchart TD
    Q([User Question in English, French, or Arabic]) --> E[Generate Query Embedding via text-embedding-3-small]
    E --> V[Vector Search: Cosine Similarity over pgvector Legal Chunks]
    V --> S{Top Similarity Score >= 0.70?}
    
    S -- Yes --> C[Inject Matched Chunks into Strict System Context]
    C --> G[LLM Synthesizes Answer: GPT-4o-mini]
    G --> A[Output Answer with Article Citation, JORADP URL & Verification Badge]
    
    S -- No --> F[Deterministic Refusal Fallback Triggered]
    F --> R[Return Official Fallback Notice: No LLM Generation]
```

#### Deterministic Refusal Protocol

If the top similarity score is below the confidence threshold (`similarity < 0.70`), the LLM generation step is bypassed entirely. The service returns a deterministic refusal:

> *"This query cannot be resolved with high statutory certainty from verified official gazettes. Please consult the competent tax inspection (Direction Générale des Impôts at mfdgi.gov.dz), the ANAE (anae.dz), or CASNOS (casnos.com.dz)."*

This protocol guarantees that the system never generates speculative legal or fiscal guidance.

---

## 8. Technical Stack

MoukawilOS standardizes on a unified, modern web architecture:

| Tier | Technology | Specification / Version | Rationale & Architectural Purpose |
|---|---|---|---|
| **Frontend Framework** | **Next.js 14+** | App Router, React 18, TypeScript 5 | Server-rendered performance, typed routes, zero-friction client state transitions. Hosted on Vercel. |
| **Styling & Icons** | **Tailwind CSS & Lucide Icons** | Tailwind CSS v3, Lucide React | Curated fiscal design system, responsive data tables, accessibility-compliant components. |
| **Core API & Backend** | **FastAPI** | Python 3.11, Uvicorn | High-throughput asynchronous REST API, auto-generating OpenAPI documentation (`/docs`). Hosted on Render. |
| **Validation & Fiscal Math** | **Pydantic v2** | Strict Decimal types | Zero floating-point precision loss on currency and tax computations; strict runtime schema enforcement. |
| **Relational Database** | **PostgreSQL 15+** | Supabase (Managed Postgres) | Multi-tenant relational storage, Row-Level Security (RLS) policies, and trigger constraints for invoice immutability. |
| **Vector Search Engine** | **pgvector** | HNSW cosine index (`vector(1536)`) | Semantic vector similarity search over chunked Algerian statutes embedded directly inside PostgreSQL. |
| **RAG Orchestration** | **LangChain** | Python LangChain Core | Semantic retrieval pipeline, document metadata formatting, and prompt guardrail enforcement. |
| **AI Models** | **OpenAI API** | `text-embedding-3-small` & `gpt-4o-mini` | Cost-effective 1536-dimensional embeddings and attributed response generation. |
| **Document Compilation** | **ReportLab / PyMuPDF** | Python PDF Engine | High-fidelity A4 PDF invoice export supporting Arabic bidirectional text shaping (`arabic-reshaper`, `python-bidi`). |
| **Testing & CI/CD** | **Pytest & GitHub Actions** | Pytest, Vitest, GitHub Workflows | Automated regression suites for fiscal test cases, schema validation, and deployment linting. |

---

## 9. Local Development Setup

### Prerequisites

| Tool | Minimum Version | Recommended Source |
|---|---|---|
| **Python** | 3.11 or newer | [python.org](https://www.python.org/) |
| **Node.js** | 18.17 or newer (LTS) | [nodejs.org](https://nodejs.org/) |
| **Git** | 2.38 or newer | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL / Supabase** | PostgreSQL 15+ with `pgvector` | Local PostgreSQL or free [Supabase](https://supabase.com) project |
| **OpenAI API Key** | Valid API key | [platform.openai.com](https://platform.openai.com) (for RAG assistant) |

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/AYA-BACHA/MoukawilOS.git
cd Moukawil-OS
```

---

### Step 2: Backend & RAG Setup (FastAPI)

1. Navigate to the backend directory and set up a Python virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   ```

2. Activate the virtual environment:
   - **Linux / macOS:**
     ```bash
     source .venv/bin/activate
     ```
   - **Windows (PowerShell):**
     ```powershell
     .venv\Scripts\Activate.ps1
     ```

3. Install Python dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to set your PostgreSQL connection string and OpenAI API key.*

5. Run database migrations or initial schemas:
   ```bash
   # Executes Supabase / Postgres table initialization
   python -m scripts.init_db
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The interactive Swagger API documentation will be available at: **http://localhost:8000/docs**.

---

### Step 3: Frontend Setup (Next.js)

1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js packages:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *Ensure `NEXT_PUBLIC_API_URL` points to `http://localhost:8000`.*

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000** in your browser.

---

### Unified Environment Variables

| Variable | Target Service | Purpose & Format | Example Value |
|---|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string with SSL | `postgresql+asyncpg://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| `OPENAI_API_KEY` | Backend | OpenAI secret key for embeddings and RAG | `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx` |
| `ALLOWED_ORIGINS` | Backend | Comma-separated list of origins allowed by CORS | `http://localhost:3000,https://moukawil-os.vercel.app` |
| `ENVIRONMENT` | Backend | Deployment environment flag | `development` or `production` |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL of the backend REST API | `http://localhost:8000` or production API URL |
| `NEXT_PUBLIC_APP_URL` | Frontend | Public URL of the frontend web application | `http://localhost:3000` or production web URL |

---

## 10. Project Structure

MoukawilOS is structured as a clean monorepo:

```
Moukawil-OS/
├── frontend/                     # Next.js 14+ Presentation Tier (App Router)
│   ├── app/                      # Route segments (Dashboard, Invoices, Compliance, Assistant)
│   ├── components/               # UI components, data tables, fiscal gauges, modals
│   ├── lib/                      # API client, formatting utilities, currency helpers
│   ├── types/                    # TypeScript interfaces for invoices, profiles, and compliance
│   ├── public/                   # Static assets, branding, and bundled Arabic fonts
│   └── package.json              # Frontend dependencies and scripts
│
├── backend/                      # FastAPI Core Application & Business Services
│   ├── app/                      # Application package
│   │   ├── api/                  # REST API routes (invoices, clients, compliance, assistant)
│   │   ├── core/                 # App configuration, security settings, CORS policies
│   │   ├── models/               # SQLAlchemy ORM models (invoices, line items, profiles)
│   │   ├── schemas/              # Pydantic v2 schemas with strict Decimal fiscal validation
│   │   ├── services/             # Fiscal calculation engine, sequence generator, PDF compiler
│   │   └── main.py               # FastAPI application entrypoint
│   ├── tests/                    # Pytest test suite (12 golden fiscal calculation cases)
│   └── requirements.txt          # Python dependencies
│
├── rag/                          # Regulatory RAG Knowledge Engine & Pipelines
│   ├── app/                      # RAG retrieval endpoints and LangChain orchestration
│   ├── corpus/                   # Indexed legal texts (Loi 22-23, CIDTA, Executive Decrees)
│   ├── pipelines/                # Article-boundary chunking and vector embedding scripts
│   └── tests/                    # Benchmark evaluation suite (25 legal test queries)
│
├── database/                     # PostgreSQL & Supabase Relational Assets
│   ├── migrations/               # Incremental SQL migrations
│   ├── schema/                   # Complete relational schema blueprint with pgvector tables
│   └── seeds/                    # Seed data for guest evaluation mode
│
├── docs/                         # Canonical Technical & Legal Specifications
│   ├── architecture.md           # Deep-dive system architecture specification
│   ├── legal-sources.md          # Comprehensive regulatory registry with JORADP links
│   ├── product.md                # Canonical product specifications and state machine
│   └── screenshots/              # System screenshots for documentation
│
├── .github/                      # CI/CD Workflows
│   └── workflows/                # Automated GitHub Actions test and lint pipelines
├── .env.example                  # Environment variable blueprint
├── LICENSE                       # MIT Open Source License
└── README.md                     # Canonical documentation
```

---

## 11. Engineering Team

| Team Member | Engineering Role | Core Contributions |
|---|---|---|
| **Bacha Aya** | **Product Lead & Frontend Architecture** | Product vision and specifications; Next.js 14 architecture; client state machine; multilingual invoice compilation (Arabic RTL glyph shaping, French, English); Figma design-system implementation. |
| **Core Engineering Team** | **Systems Architecture & Fiscal Engine** | FastAPI backend architecture; Pydantic v2 deterministic `Decimal` fiscal calculation engine; PostgreSQL schema design with Row-Level Security (RLS); invoice immutability database triggers; sequential numbering engine (`FA-YYYY-NNN`). |
| **Data & AI Engineering Team** | **Regulatory Intelligence & Infrastructure** | Article-boundary legal chunking pipeline; `pgvector` HNSW index configuration; deterministic refusal fallback guardrails; 25-query golden benchmark evaluation suite; Vercel and Render deployment pipelines. |

---

## 12. AI Transparency & Attribution

We maintain complete transparency regarding the role of Artificial Intelligence in MoukawilOS:

| Context | AI Tooling / Model | Implementation Scope | Verification & Engineering Boundaries |
|---|---|---|---|
| **Inside the Product** | OpenAI `text-embedding-3-small` & `gpt-4o-mini` | Semantic vector search and grounded natural language synthesis in the Regulatory Assistant. | Operates under strict prompt guardrails. Constrained exclusively to retrieved legal chunks. If cosine similarity is below 0.70, a deterministic refusal is issued to prevent hallucination. |
| **During Development** | Claude, Gemini, GitHub Copilot | Code assistance, unit test scaffolding, and initial drafting of repetitive boilerplate. | All generated code, database schemas, and mathematical formulas were audited, reviewed, and verified against Algerian statutes by human engineers before merging. |

---

## 13. Known Limitations & Engineering Trade-Offs

We believe rigorous engineering requires transparently documenting technical constraints and deliberate architectural trade-offs:

1. **Manual Payment Settlement Confirmation:**
   Algerian financial institutions and postal systems (*SATIM*, *BaridiMob*, *CCP*) do not currently offer public developer APIs or automated webhook notifications for individual accounts. As a result, invoice payment settlement requires the user to manually click "Record Payment" and enter the transaction date and settlement channel. Automated bank statement parsing (CSV/OCR) is in active development to streamline this step.

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

```
[ Phase 1: MVP Core ] ──► [ Phase 2: Compliance Exports ] ──► [ Phase 3: Banking Ingest ] ──► [ Phase 4: Portal Integration ]
(Completed)               (Q3 2026)                           (Q4 2026)                       (2027)
```

- **Phase 1: MVP Core (Completed):**
  - Cash-basis turnover tracking with 5,000,000 DZD ceiling gauge and 80% warning.
  - Gapless sequential invoicing (`FA-YYYY-NNN`) and credit notes (`AV-YYYY-NNN`).
  - Multilingual PDF export (Arabic RTL, French, English).
  - Deterministic IFU and CASNOS calculation engine.
  - Regulatory RAG microservice with legal citations and deterministic refusal fallback.

- **Phase 2: Compliance Exports (Q3 2026):**
  - One-click compilation of pre-filled official DGI Série G n° 12 and G n° 12 bis PDF tax declarations.
  - Annual fiscal summary export package for certified accountants.

- **Phase 3: Banking & Settlement Ingestion (Q4 2026):**
  - Semi-automated bank statement parsing (BaridiMob and bank statement CSV/PDF imports).
  - Automated reconciliation suggestions matching statement credits to outstanding issued invoices.

- **Phase 4: Official Digital Tax Portal Integration (2027):**
  - Direct integration with emerging national tax platforms (DGI Jibayatic) as public administrative APIs become available.

---

## 15. Security & Multi-Tenancy Architecture

MoukawilOS enforces security at every layer of the stack:

1. **Multi-Tenant Data Isolation (Row-Level Security):**  
   All relational database tables enforce PostgreSQL Row-Level Security (RLS) policies tied to the authenticated user's token (`auth.uid() = user_id`). Users cannot access, query, or modify another operator's clients, invoices, or fiscal metrics.

2. **Database-Level Immutability Constraints:**  
   PostgreSQL trigger functions reject any `UPDATE` or `DELETE` statements executed against invoices with a status of `issued` or `paid`. Even in the event of an API validation regression, the database prohibits tampering with finalized invoices.

3. **Zero Secret Leakage:**  
   No API tokens, database credentials, or secret keys are committed to the repository. Sensitive variables are loaded strictly from environment variables.

To verify your local repository clone for leaked secrets:

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

Copyright (c) 2026 Aya Bacha. All rights reserved.

This project, its source code, architecture, and associated documentation are proprietary. The repository is made publicly accessible strictly for portfolio review, technical demonstration, and evaluation purposes.

No license or permission is granted to copy, reproduce, modify, redistribute, fork for commercial use, or deploy this software in any commercial or production environment without prior express written authorization from the copyright holder. See [`LICENSE`](LICENSE) for complete terms.

---

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
