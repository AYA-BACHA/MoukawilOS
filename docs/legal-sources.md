# MoukawilOS Legal Sources

> **Notice:** Legal and regulatory values must be verified against current official sources before being hard-coded into the application codebase, calculation formulas, or user interface text. This document provides the structured verification registry for all statutory assumptions used by the MoukawilOS MVP.

---

## Verification Policy

1. **Primary Sources Only:** Statutory assumptions must trace directly to official Algerian government publications:
   - *Journal Officiel de la République Algérienne Démocratique et Populaire (JORADP)*: [joradp.dz](https://www.joradp.dz)
   - *Direction Générale des Impôts (DGI)*: [mfdgi.gov.dz](https://www.mfdgi.gov.dz)
   - *Agence Nationale de l'Auto-Entrepreneur (ANAE)*: [anae.dz](https://www.anae.dz)
   - *Caisse Nationale de Sécurité Sociale des Non-Salariés (CASNOS)*: [casnos.com.dz](https://casnos.com.dz)
2. **No Speculative Coding:** If a rate, threshold, or procedural deadline cannot be verified in an official text, it must be labeled `unknown` or `to be confirmed with authorities`, and never invented.
3. **Immutability of Legal Rules:** All verified rules used in calculations must be centrally documented and referenced in calculation services with their statutory article number.

---

## Sources to Verify

### 1. Auto-Entrepreneur Legal Framework

- **Source:** Journal Officiel de la République Algérienne
- **Official URL:** https://www.joradp.dz
- **Document / Law:** Loi n° 22-23 du 18 décembre 2022 portant statut de l'auto-entrepreneur (JORADP n° 85 du 19 décembre 2022)
- **Relevant Article / Section:** Articles 1 à 16
- **What it verifies:** 
  - Establishment of the National Agency for Auto-Entrepreneurship (ANAE).
  - Definition of eligible individual activities.
  - Exemption from Commercial Register (CNRC) registration (Art. 2 & 11).
  - Conditions for radiation from the National Registry (Art. 13 & 14).
- **Last verified:** 29/09/2026
- **Notes:** Primary legal foundation establishing the status.

---

### 2. Turnover Ceiling & Exceedance Conditions

- **Source:** Journal Officiel de la République Algérienne / Code des Impôts Directs
- **Official URL:** https://www.joradp.dz / https://www.mfdgi.gov.dz
- **Document / Law:** Loi n° 22-23, art. 2 ; Code des Impôts Directs et Taxes Assimilées (CIDTA), art. 282 ter
- **Relevant Article / Section:** Loi 22-23 Art. 2, 13, 14 ; CIDTA Art. 282 ter
- **What it verifies:** 
  - Annual turnover ceiling of 5,000,000 DZD per calendar year.
  - Consequence of exceeding ceiling: Mandatory radiation from the ANAE registry and transfer to standard commercial status occurs after exceeding the ceiling for **three (3) consecutive years** (Loi 22-23 Art. 13-14).
  - Note on 80% threshold (4,000,000 DZD): Verified as a **MoukawilOS preventative software alert**, NOT a statutory threshold of Algerian law.
- **Last verified:** 29/09/2026
- **Notes:** Claims of single-year immediate radiation are contradictory to the explicit text of Loi 22-23 Art. 13.

---

### 3. IFU Tax Rules, Rates & Payment Schedule

- **Source:** Direction Générale des Impôts / Ministère des Finances
- **Official URL:** https://www.mfdgi.gov.dz
- **Document / Law:** Loi n° 23-22 du 24 décembre 2023 portant Loi de Finances pour 2024 ; CIDTA art. 282 sexies, art. 282 quater, art. 365, art. 365 bis
- **Relevant Article / Section:** 
  - CIDTA Art. 282 sexies (Taux de l'IFU)
  - CIDTA Art. 365 bis (Minimum d'imposition)
  - CIDTA Art. 282 quater (Déclarations G12 et G12 bis)
  - CIDTA Art. 365 (Modalités de fractionnement)
- **What it verifies:** 
  - Single flat IFU rate of 0.5% for auto-entrepreneurs (reduced from 5% in LF 2023).
  - Statutory annual minimum tax payment of 10,000 DZD (due even with zero or low turnover).
  - Provisional declaration (Série G n° 12) deadline: June 30 of the active year.
  - Definitive regularisation declaration (Série G n° 12 bis) deadline: January 20 of year N+1.
  - Optional split payment schedule: 50% by June 30, 25% by September 15, 25% by December 15.
- **Last verified:** 29/09/2026
- **Notes:** There is NO monthly tax declaration for auto-entrepreneurs under Algerian law.

---

### 4. CASNOS Social Security Rules & Contributions

- **Source:** Caisse Nationale de Sécurité Sociale des Non-Salariés / JORADP
- **Official URL:** https://casnos.com.dz / https://www.joradp.dz
- **Document / Law:** Décret exécutif n° 15-289 du 14 novembre 2015 modifié ; Décret exécutif n° 26-257 du 15 juillet 2026 (JORADP n° 53 du 23 juillet 2026) ; Décret présidentiel n° 26-01 (SNMG)
- **Relevant Article / Section:** Décret 15-289 Art. 8 & 14 ; Décret 26-257 Art. 14
- **What it verifies:** 
  - Affiliation deadline: Within 10 days of starting activity / receiving ANAE card.
  - Annual contribution deadline: June 30 of each calendar year.
  - Specific Auto-Entrepreneur Flat Option: Fixed contribution of 24,000 DZD / year.
  - General Regime Option: 15% of declared income, bounded between:
    - Floor: 43,200 DZD / year (1x annual SNMG of 288,000 DZD).
    - Ceiling: 864,000 DZD / year (20x annual SNMG of 5,760,000 DZD).
- **Last verified:** 29/09/2026
- **Notes:** Ordinary CASNOS contributions are strictly annual. There is NO quarterly CASNOS contribution schedule for non-salaried workers in Algeria.

---

### 5. Mandatory Commercial Invoicing Requirements

- **Source:** Journal Officiel de la République Algérienne / Ministère du Commerce
- **Official URL:** https://www.joradp.dz
- **Document / Law:** Décret exécutif n° 05-468 du 10 décembre 2005 fixant les conditions et les modalités d'établissement de la facture ; Code de commerce art. 12 ; CIDTA art. 282 sexies
- **Relevant Article / Section:** Décret 05-468 Art. 4, 10, 11 ; Code de commerce Art. 12
- **What it verifies:** 
  - Mandatory seller fields: Name, address, approved ANAE activity, 15-digit NIF, ANAE card number.
  - Mandatory client fields: Full name / company name, address (+ client NIF if corporate/professional entity).
  - Chronological unique sequential numbering (`FA-YYYY-NNN`).
  - Itemized descriptions, quantities, unit prices, and total amount in Algerian Dinars (DZD).
  - Mandatory VAT exemption notice: *« Franchise de TVA — Article 282 sexies du CIDTA — TVA non applicable »*.
  - Commercial register exemption notice: *« Dispensé d'immatriculation au Registre du Commerce (Loi n° 22-23) »*.
  - Invoice Immutability: Invoices cannot be modified or deleted once issued; errors must be rectified via Credit Notes (*Factures d'avoir*, Décret 05-468 art. 11).
  - 10-year archiving obligation (*Code de commerce art. 12*).
- **Last verified:** 29/09/2026
- **Notes:** Invoices must never include a calculated VAT line since IFU replaces VAT.

---

### 6. Official Activity-Code Nomenclature (ANAE)

- **Source:** Journal Officiel de la République Algérienne / ANAE
- **Official URL:** https://www.anae.dz / https://www.joradp.dz
- **Document / Law:** Décret exécutif n° 23-197 du 25 mai 2023 fixant la liste des activités éligibles au statut de l'auto-entrepreneur (JORADP n° 37 du 4 juin 2023)
- **Relevant Article / Section:** Annexe (Nomenclature des 7 domaines d'activité)
- **What it verifies:** 
  - 7 eligible activity domains:
    1. Conseil et expertise (*Consulting, management, translation*)
    2. Services numériques et activités connexes (*Software development, web development, data, AI, IT support*)
    3. Prestations à domicile (*Home services*)
    4. Services à la personne (*Personal care and assistance*)
    5. Services de loisirs, récréation et animation (*Event planning, audio-visual*)
    6. Services culturels et artistiques (*Graphic design, content creation, copywriting*)
    7. Services d'enseignement et de formation (*Tutoring, professional training*)
  - Explicit exclusions: Regulated liberal professions (lawyers, doctors, accountants, notaries) and craft/artisanal trades governed by Chambre de l'Artisanat et des Métiers (CAM).
- **Last verified:** 29/09/2026
- **Notes:** Only activity codes matching these 7 domains are allowed in the platform's profile settings.

---

### 7. Tax Identification Number (NIF) Declaration

- **Source:** Journal Officiel / Direction Générale des Impôts
- **Official URL:** https://www.mfdgi.gov.dz
- **Document / Law:** Loi n° 22-23 art. 11 ; CIDTA art. 183
- **Relevant Article / Section:** Formulaire Série G n° 8 (Déclaration d'existence)
- **What it verifies:** 
  - Requirement to file a declaration of existence at the local tax center (CDI / CPI) within 30 days of receiving the ANAE card.
  - Results in the assignment of the official 15-digit NIF.
- **Last verified:** 29/09/2026
- **Notes:** Freelancers cannot legally issue commercial invoices without their 15-digit NIF.
