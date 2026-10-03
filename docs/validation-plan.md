# MoukawilOS — Product Usability & Legal Validation Plan

> **Status:** Sprint 0 Baseline Protocol  
> **Target Execution:** Week 2 – Week 4 of MVP  
> **Lead:** Aya (Product Lead)  
> **Notice:** This document defines the testing methodology, target profile, and interview protocol. It does NOT claim prior user research results.

---

## 1. Target Testing Cohort (Who Should Be Tested)

To ensure meaningful and grounded feedback, usability and concept validation must recruit **5 to 8 real Algerian independent workers** meeting the following profile criteria:

### Primary Persona
- **Profile:** Algerian digital or creative freelancers (e.g., Software Developers, UI/UX Designers, Graphic Designers, Digital Marketers, Video Editors).
- **Regulatory Status:** Either registered under the auto-entrepreneur status (*Loi n° 22-23*) with an active ANAE card, or actively planning to register within the next 30 days.
- **Client Base:** Working with local Algerian clients (requiring DZD invoicing) or remote international clients converting payments.

### Secondary Persona
- **Profile:** 1 certified Algerian chartered accountant (*expert-comptable*) or tax advisor familiar with the *Impôt Forfaitaire Unique (IFU)* and *CIDTA art. 282 sexies*.

---

## 2. Core Assumptions to Validate

| # | Assumption | Risk if Invalid | Validation Method |
|---|---|---|---|
| **A1** | Freelancers do not understand how the 5M DZD ceiling works (specifically the 3-consecutive-year rule vs. single-year breach). | Users panic or avoid billing legitimately. | Dashboard ceiling gauge comprehension test. |
| **A2** | Freelancers struggle to formulate correct legal mentions on invoices (VAT exemption, ANAE reference, sequential numbering). | Generated invoices rejected by corporate clients or tax audits. | Invoice builder task walkthrough. |
| **A3** | Freelancers are confused by internet rumors regarding "monthly tax declarations" or "quarterly CASNOS payments". | Users perform unnecessary administrative steps or miss real deadlines. | Compliance timeline review & interview. |
| **A4** | Freelancers trust an AI assistant only if direct statutory article citations and verification badges are provided. | Users disregard AI answers as generic or unreliable. | Regulatory Assistant scenario testing. |
| **A5** | The immutability of invoices (prohibiting edit/delete, requiring credit notes) is counter-intuitive for users used to editable templates. | Users attempt to modify finalized invoices and become frustrated. | Error correction scenario test. |

---

## 3. Scope of MVP Testing (What Parts to Test)

The validation sessions will focus exclusively on four interactive flows:
1. **Profile Setup & Onboarding:** Setting up NIF, ANAE card number, and approved activity.
2. **Invoice Generation & PDF Export:** Creating a compliant invoice for an Algerian company client, downloading the PDF, and attempting to correct an error via a Credit Note (*Avoir*).
3. **Turnover & Ceiling Tracking:** Interpreting the 80% warning banner and the 5M DZD ceiling status on the Dashboard.
4. **Regulatory Q&A via Assistant:** Asking the assistant ambiguous administrative questions (e.g., "Do I declare monthly?", "Can I deduct laptop expenses under IFU?").

---

## 4. Scenario-Based Testing Protocol

### Scenario 1: Onboarding
- **Task:** "You just received your auto-entrepreneur card from ANAE and your NIF from the tax office. Complete your profile setup in MoukawilOS."
- **Observe:** Does the user easily identify what the 15-digit NIF is? Do they find their approved activity in the dropdown?

### Scenario 2: Issuing a Legal Invoice
- **Task:** "You completed a UI design project for a client in Algiers for 180,000 DZD. Issue an invoice and download the PDF to send to them."
- **Observe:** Does the user notice the automatic VAT exemption text? Do they attempt to manually add a tax line? How long does it take to complete the invoice?

### Scenario 3: Correcting an Error
- **Task:** "You realized you billed for 180,000 DZD instead of 150,000 DZD on the finalized invoice. Correct the mistake."
- **Observe:** Does the user understand why the invoice cannot simply be edited or deleted? Do they understand how the credit note (*avoir*) rectifies the transaction?

### Scenario 4: Interpreting Compliance & Tax Deadlines
- **Task:** "Look at the Compliance screen. When is your next major tax deadline, and how much IFU will you owe if your collected turnover is 2,000,000 DZD?"
- **Observe:** Does the user locate the G12 deadline (June 30)? Do they understand that the minimum IFU of 10,000 DZD applies at 2,000,000 DZD (2M * 0.5% = 10,000 DZD)?

### Scenario 5: Regulatory Q&A
- **Task:** "Ask the assistant: 'Do I have to file taxes every month on the ANAE platform?'"
- **Observe:** Does the user notice the source citation badge? Do they find the answer reassuring?

---

## 5. Structured Interview Questions

### Pre-Test Questions
1. "How do you currently issue invoices to your clients (Word, Excel, Canva, paper)?"
2. "What is your understanding of the tax rate and deadlines under the auto-entrepreneur status?"
3. "Have you ever worried about exceeding the 5,000,000 DZD annual ceiling? What do you believe happens if you exceed it?"

### Post-Test Debrief Questions
1. "Looking at the PDF invoice generated, would you feel confident sending this to an Algerian corporate client or your bank?"
2. "Was the distinction between 'Billed' and 'Collected (Encaissé)' turnover clear on the dashboard?"
3. "Did the regulatory assistant give you sufficient confidence, or did you feel the need to double-check elsewhere? Why?"
4. "What was the single most confusing step during the session?"

---

## 6. Evaluation Indicators: Useful vs. Confusing

### Evidence that a Feature is Useful:
- User unprompted remarks: *"Finally, an invoice that has the right Algerian legal mentions so I don't have to look them up."*
- User immediately recognizes the 5M DZD ceiling gauge and remarks on their remaining capacity for the year.
- User clicks through the statutory citation link on an assistant response and confirms the article.
- User completes invoice creation in under 3 minutes without assistance.

### Evidence that a Feature is Confusing / Problematic:
- User searches for a "TVA / VAT" input field and tries to calculate 19% VAT manually.
- User becomes frustrated that they cannot edit an issued invoice and does not understand what a "facture d'avoir" means without explanation.
- User interprets the 80% preventative warning (4M DZD) as a legal sanction rather than a platform management tool.
- User ignores source badges in the assistant and treats answers like a generic ChatGPT conversation.

---

## 7. Action Plan Following User Testing

1. Log all observed friction points in `docs/usability-feedback-log.md`.
2. Review findings during weekly sprint review with the full 5-person team.
3. If legal terminology causes hesitation, adjust helper tooltips and onboarding micro-copy in `frontend/lib/i18n/`.
4. Refine RAG prompt templates if answers fail to clearly emphasize the specific article number.
