# MoukawilOS — User Journey & Product Flow

> **Status:** Sprint 0 Baseline  
> **Target User:** Algerian Digital & Creative Freelancers (Developers, Designers, Marketers, Copywriters, Multimedia Artists) operating under the Auto-Entrepreneur framework.

---

## 1. High-Level User Journey Diagram

```mermaid
flowchart TD
    Start([User Visits MoukawilOS]) --> Auth[Authentication / Login]
    Auth --> ProfileCheck{Profile Complete?}

    ProfileCheck -- No --> Settings[Settings: Complete Business Profile<br>NIF, RNAE Card, Approved Activity]
    Settings --> Dashboard
    ProfileCheck -- Yes --> Dashboard[1. Dashboard<br>Turnover Gauge, 80% Alert, Deadlines]

    Dashboard --> InvoicesNav[2. Invoices List]
    Dashboard --> ComplianceNav[4. Compliance & Simulator]
    Dashboard --> AssistantNav[5. Regulatory Assistant]

    InvoicesNav --> CreateInv[3. Create Invoice<br>Client Details, Items in DZD]
    CreateInv --> PreviewInv[Invoice Preview<br>Mandatory Mentions Auto-Injected]
    PreviewInv --> FinalizeInv[Finalize Invoice<br>Status: Pending]

    FinalizeInv --> DownloadPDF[Client-Side PDF Generation<br>@react-pdf/renderer]
    FinalizeInv --> RecordPayment[Record Payment Received]

    RecordPayment --> StatusPaid[Status: Paid<br>Cash Basis Accounting]
    StatusPaid --> UpdateTurnover[Update Annual Turnover<br>& 5M DZD Ceiling on Dashboard]

    FinalizeInv -- Invoicing Error --> CreditNote[Issue Credit Note (Avoir)<br>Sequence AV-YYYY-NNN]
    CreditNote --> DeductTurnover[Deduct from Net Turnover]

    ComplianceNav --> ReviewDeadlines[View Administrative Calendar<br>G12, CASNOS, G12 bis]
    ComplianceNav --> RunSim[Run IFU & CASNOS Simulator]

    AssistantNav --> AskQuery[Ask Legal / Tax Question]
    AskQuery --> GroundedAnswer[Receive Grounded Answer<br>with Law / Decree Citations]
```

---

## 2. Stage-by-Stage User Experience

### Stage 1: Onboarding & Profile Setup

- **What the user sees:**
  - Initial configuration screen requiring their official freelancer identity attributes.
  - Form fields for: Full Name, Address, Approved Activity (dropdown filtered by Décret 23-197), 15-digit NIF, RNAE Registration Card Number, and CASNOS contribution option (Forfait 24,000 DZD vs. General Regime 15%).
  - Language selector (French by default, Arabic with full RTL support, English).
- **What action they take:**
  - Fills in their official identifiers received from the ANAE and Centre des Impôts (CDI/CPI).
  - Selects their preferred UI language.
  - Clicks "Save Profile".
- **What happens next:**
  - The system validates field formats (e.g., exactly 15 digits for NIF).
  - Profile is saved to Supabase database.
  - User is routed directly to the Dashboard.

---

### Stage 2: Dashboard (Operational Command Center)

- **What the user sees:**
  - **Stat Cards:**
    - Annual Collected Turnover (Chiffre d'Affaires Encaissé) for the active year.
    - Pending Receivables (En attente d'encaissement).
    - Next Approaching Statutory Obligation (e.g., "Déclaration IFU G12 — dans 45 jours").
  - **Ceiling Progress Bar:**
    - Real-time gauge tracking progress against the 5,000,000 DZD statutory ceiling (*Loi 22-23*).
    - Preventative 80% alert threshold marker (4,000,000 DZD).
    - Consecutive years status indicator (e.g., "Année 1 sous le plafond").
  - **Upcoming Obligations Widget:**
    - Cards showing the next official filings (G12, CASNOS, G12 bis) with status badges (`À venir`, `Dans X jours`, `En retard`, `Accomplie`).
  - **Recent Invoices Table:**
    - Last 5 invoices with client name, date, amount in DZD, and status badge.
- **What action they take:**
  - Assesses their financial headroom before reaching the 5M DZD threshold.
  - Clicks "New Invoice" to bill a client, or clicks an obligation to see compliance details.
- **What happens next:**
  - User navigates to the selected workflow.

---

### Stage 3: Invoice Creation

- **What the user sees:**
  - Clean invoice builder form.
  - Automatically populated sequential invoice number (`FA-YYYY-NNN`).
  - Read-only summary of freelancer's statutory details (Name, NIF, ANAE Card, Address).
  - Client selector / creation inputs (Client Name, Client Address, Client NIF if company).
  - Line items table (Description, Quantity, Unit Price in DZD).
  - Live subtotal and total display in DZD.
  - Auto-injected mandatory Algerian statutory mentions displayed below total:
    - *« Franchise de TVA — Article 282 sexies du CIDTA — TVA non applicable »*
    - *« Dispensé d'immatriculation au Registre du Commerce (Loi n° 22-23) »*
- **What action they take:**
  - Selects an existing client or enters new client details.
  - Enters invoice date and payment due date.
  - Adds one or more item lines (e.g., "UI/UX Design Mobile App", quantity 1, 150,000 DZD).
  - Clicks "Preview Invoice" or "Finalize Invoice".
- **What happens next:**
  - System validates that items exist and amounts are positive integers/numbers.
  - If profile lacks NIF or ANAE number, finalization is blocked with a notice to update Settings.
  - When finalized, the invoice is saved as `pending`, locked against modification, and chronological sequence is committed.

---

### Stage 4: Invoice Management, PDF Export & Avoirs

- **What the user sees:**
  - Paginated list of all issued invoices and credit notes.
  - Status filters: `All`, `Draft`, `Pending`, `Paid`, `Overdue`, `Credited`.
  - Action buttons per invoice: "Preview", "Download PDF", "Record Payment", "Issue Credit Note".
- **What action they take:**
  - **Scenario A (Exporting):** Clicks "Download PDF" → View modal displays standardized Algerian A4 invoice layout with clean typography, seller/client columns, itemized table, DZD total, and mandatory legal footer. PDF downloads instantly to local computer.
  - **Scenario B (Payment Received):** Clicks "Record Payment" → Selects settlement date and payment method (Virement, Chèque, Espèces, CCP) → Clicks confirm.
  - **Scenario C (Billing Error):** Discovers an error on a finalized invoice. Since "Edit" is disabled by law (*Décret 05-468*), clicks "Issue Credit Note" → Inputs adjustment details → Confirms.
- **What happens next:**
  - If payment recorded: Invoice status updates to `paid`. Collected revenue is immediately reflected in the Dashboard turnover gauge and current-year IFU tax liability.
  - If credit note issued: A new linked document (`AV-YYYY-NNN`) is created, referencing the original invoice. Net collected turnover is adjusted accordingly.

---

### Stage 5: Revenue & Compliance Tracking

- **What the user sees:**
  - **Annual Tax Summary:**
    - Gross Turnover Encaissé vs. Billed.
    - Calculated IFU amount (0.5% with statutory 10,000 DZD floor applied).
    - Split installment timeline (June 30, Sept 15, Dec 15).
  - **CASNOS Social Security Summary:**
    - Annual contribution amount based on selected regime (24,000 DZD flat vs. 15% general regime).
    - Due date: June 30.
  - **Statutory Calendar:**
    - Chronological timeline with exact legal citations (*CIDTA art. 282 quater, Décret 15-289 art. 14*).
  - **Interactive Tax Simulator:**
    - Input box to simulate any hypothetical annual revenue (e.g., 2,500,000 DZD) and compare IFU and CASNOS costs in real time.
- **What action they take:**
  - Reviews obligations before fiscal deadlines.
  - Tests simulated scenarios to understand tax impacts of upcoming projects.
- **What happens next:**
  - System provides transparent calculation steps without offering speculative tax advice. Prominent disclaimer points user to official DGI/CASNOS channels for filing.

---

### Stage 6: Regulatory RAG Assistant

- **What the user sees:**
  - Conversational interface tailored to Algerian freelance regulations.
  - Introductory banner: *« Réponses fondées exclusivement sur les textes officiels (Loi 22-23, CIDTA, Décrets exécutifs). Aucune extrapolation. »*
  - Quick question prompt chips (e.g., *"Quel est le taux de l'IFU ?"*, *"Quand payer la CASNOS ?"*, *"Plafond de chiffre d'affaires"*).
- **What action they take:**
  - Types a specific administrative question or clicks a suggestion chip.
- **What happens next:**
  - System queries the vector database (`pgvector`) for verified legal articles.
  - Returns a concise, structured response containing:
    1. Direct operational answer.
    2. Exact legal citation (Law number, decree number, article, JORADP date).
    3. Verification status badge (`verified-official`, `secondary-only`, `conflicting`, `unknown`).
  - If the topic is unverified or outside official statutory guidelines, the system displays an honest refusal message with direct contact info for the relevant agency.
