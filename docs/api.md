# MoukawilOS — API Specifications & Contract

> **Status:** Canonical Specification — Sprint 0 Baseline  
> **Source of Truth:** Aligned with [`docs/developer-handoff.md`](developer-handoff.md) and Figma Prototype.  
> **Base URL:** `http://localhost:5000/api` (Local Dev) | `https://api.moukawilos.dz/api` (Production)

---

## 1. Global Conventions & Standards

### Authentication & Headers
All requests to `/api/*` (except `/health`) require a valid Supabase JWT Bearer token:
```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
Accept: application/json
```

### Standard Response Envelopes

**Success Envelope:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-03T18:00:00.000Z"
  }
}
```

**Error Envelope:**
```json
{
  "success": false,
  "error": {
    "code": "INVOICE_IMMUTABLE",
    "message": "Finalized invoices (issued or paid) cannot be modified or deleted. Correction requires issuing an Avoir (Credit Note).",
    "details": null
  },
  "meta": {
    "timestamp": "2026-10-03T18:00:00.000Z"
  }
}
```

### HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Entity successfully created.
- `400 Bad Request`: Input validation failed or invalid state transition.
- `401 Unauthorized`: Missing or expired Bearer token.
- `403 Forbidden`: Action forbidden on the resource (e.g. attempting to update/delete an `issued` or `paid` invoice).
- `404 Not Found`: Resource not found.
- `409 Conflict`: Conflict in sequential numbering or resource state.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Profile & Settings Endpoints

### 2.1. Get Freelancer Profile
`GET /api/profile`

Returns the authenticated freelancer's profile, registration data, and compliance configuration.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "amine.freelance@example.dz",
    "full_name": "Amine Benali",
    "phone": "+213 555 12 34 56",
    "address": "14 Rue Didouche Mourad, Alger Centre, Alger",
    "wilaya": "16 - Alger",
    "nif": "123456789012345",
    "anae_card_number": "AE-16-2024-00123",
    "approved_activity_code": "620101",
    "approved_activity_label": "Développement d'applications informatiques et de sites web",
    "casnos_regime": "forfait",
    "is_profile_complete": true
  }
}
```

### 2.2. Update Freelancer Profile
`PUT /api/profile`

Validates and updates profile fields. Enforces 15-digit numeric format for NIF (*Numéro d'Identification Fiscale*).

**Request Body:**
```json
{
  "full_name": "Amine Benali",
  "phone": "+213 555 12 34 56",
  "address": "14 Rue Didouche Mourad, Alger Centre, Alger",
  "wilaya": "16 - Alger",
  "nif": "123456789012345",
  "anae_card_number": "AE-16-2024-00123",
  "approved_activity_code": "620101",
  "approved_activity_label": "Développement d'applications informatiques et de sites web",
  "casnos_regime": "forfait"
}
```

---

## 3. Client Management Endpoints

### 3.1. List Clients
`GET /api/clients`

**Query Parameters:**
- `search` *(string, optional)*: Filter by client name or email.
- `page` *(number, optional, default: 1)*
- `limit` *(number, optional, default: 20)*

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cli_e3a9c72e-8a0b-41f2-9599-5ef4c1a2d645",
      "name": "Sarl TechSolutions Algérie",
      "contact_person": "Karim Meziane",
      "email": "contact@techsolutions.dz",
      "phone": "+213 21 60 70 80",
      "address": "Zone d'Activité, Bab Ezzouar, Alger",
      "nif": "001216012345678",
      "created_at": "2026-02-10T10:00:00Z"
    }
  ]
}
```

### 3.2. Create Client
`POST /api/clients`

**Request Body:**
```json
{
  "name": "Sarl TechSolutions Algérie",
  "contact_person": "Karim Meziane",
  "email": "contact@techsolutions.dz",
  "phone": "+213 21 60 70 80",
  "address": "Zone d'Activité, Bab Ezzouar, Alger",
  "nif": "001216012345678"
}
```

---

## 4. Invoicing Endpoints & Immutability Rules

### Canonical Invoicing Lifecycle
- `DRAFT`: Editable, can be deleted, excluded from turnover and tax.
- `ISSUED` *(UI: Pending)*: Locked, permanent sequential number assigned, included in billed receivables, cannot be edited or deleted.
- `PAID`: Strictly immutable, included in official cash-basis turnover, cannot be edited or deleted. View & PDF download only.

### 4.1. List Invoices
`GET /api/invoices`

**Query Parameters:**
- `status` *(string, optional)*: `draft`, `issued`, `paid`, `credited`
- `year` *(number, optional)*: Filter by fiscal calendar year (e.g. `2026`)
- `client_id` *(uuid, optional)*

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv_4a7c1b82-9923-41fa-8a21-9e7b91d24a91",
      "invoice_number": "FA-2026-001",
      "client": {
        "id": "cli_e3a9c72e-8a0b-41f2-9599-5ef4c1a2d645",
        "name": "Sarl TechSolutions Algérie"
      },
      "issue_date": "2026-03-01",
      "due_date": "2026-03-31",
      "status": "issued",
      "total_amount": 180000.00,
      "currency": "DZD",
      "has_credit_note": false,
      "created_at": "2026-03-01T09:30:00Z"
    }
  ]
}
```

### 4.2. Create Invoice
`POST /api/invoices`

Creates a new invoice. If `status` is `"draft"`, no permanent number is allocated. If `status` is `"issued"`, the next atomic sequential number (`FA-YYYY-NNN`) is allocated.

**Request Body:**
```json
{
  "client_id": "cli_e3a9c72e-8a0b-41f2-9599-5ef4c1a2d645",
  "issue_date": "2026-03-01",
  "due_date": "2026-03-31",
  "status": "draft",
  "notes": "Paiement par virement bancaire sous 30 jours.",
  "items": [
    {
      "description": "Développement du module d'authentification et API REST",
      "quantity": 1,
      "unit_price": 180000.00
    }
  ]
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "inv_4a7c1b82-9923-41fa-8a21-9e7b91d24a91",
    "invoice_number": null,
    "status": "draft",
    "total_amount": 180000.00,
    "currency": "DZD",
    "vat_exempt_clause": "Franchise de TVA — Article 282 sexies du CIDTA — TVA non applicable",
    "rc_exempt_clause": "Dispensé d'immatriculation au Registre du Commerce (Loi n° 22-23)",
    "items": [
      {
        "id": "itm_71a0e1b2-1144-42b1-912b-34a8e91d8821",
        "description": "Développement du module d'authentification et API REST",
        "quantity": 1,
        "unit_price": 180000.00,
        "line_total": 180000.00
      }
    ]
  }
}
```

### 4.3. Finalize Invoice (Draft → Issued)
`POST /api/invoices/:id/finalize`

Finalizes a draft invoice. Assigns the next sequential chronological number `FA-YYYY-NNN` and permanently locks the invoice.

**Validation Preconditions:**
- Freelancer's profile must have a valid 15-digit NIF and ANAE card number.
- Invoice must currently be in `draft` status.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "inv_4a7c1b82-9923-41fa-8a21-9e7b91d24a91",
    "invoice_number": "FA-2026-001",
    "status": "issued",
    "finalized_at": "2026-03-01T10:15:00Z"
  }
}
```

### 4.4. Update Invoice
`PUT /api/invoices/:id`

Allowed **only** when `status == 'draft'`.

**Error Response `403 Forbidden` (if status is `issued` or `paid`):**
```json
{
  "success": false,
  "error": {
    "code": "INVOICE_IMMUTABLE",
    "message": "Finalized invoices cannot be modified. Any billing error must be rectified using a Credit Note (Avoir)."
  }
}
```

### 4.5. Delete Invoice
`DELETE /api/invoices/:id`

Allowed **only** when `status == 'draft'`. Returns `403 Forbidden` for `issued` or `paid` invoices.

### 4.6. Record Payment (Issued → Paid)
`POST /api/invoices/:id/payment`

Records payment receipt with confirmation. Transitions status from `issued` to `paid`. This invoice immediately enters the official annual turnover calculation (*CIDTA art. 282 sexies*).

**Request Body:**
```json
{
  "payment_date": "2026-03-15",
  "payment_method": "Virement bancaire",
  "payment_reference": "VIR-2026-98124"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "inv_4a7c1b82-9923-41fa-8a21-9e7b91d24a91",
    "invoice_number": "FA-2026-001",
    "status": "paid",
    "paid_at": "2026-03-15",
    "payment_method": "Virement bancaire",
    "is_immutable": true
  }
}
```

### 4.7. Issue Credit Note (Facture d'Avoir)
`POST /api/invoices/:id/credit-note`

Generates an official credit note (`AV-YYYY-NNN`) referencing the original invoice per *Décret exécutif n° 05-468 art. 11*. Automatically adjusts net annual turnover.

**Request Body:**
```json
{
  "reason": "Annulation pour prestation non effectuée d'un commun accord",
  "credit_amount": 180000.00
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "cn_88bf213e-43a9-467f-94d1-872f91a27192",
    "credit_note_number": "AV-2026-001",
    "original_invoice_id": "inv_4a7c1b82-9923-41fa-8a21-9e7b91d24a91",
    "original_invoice_number": "FA-2026-001",
    "amount": 180000.00,
    "issue_date": "2026-03-20"
  }
}
```

---

## 5. Analytics & Compliance Endpoints

### 5.1. Annual Turnover & Ceiling Metrics
`GET /api/analytics/turnover`

**Query Parameters:**
- `year` *(number, optional, default: current calendar year)*

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "fiscal_year": 2026,
    "currency": "DZD",
    "collected_turnover": 3850000.00,
    "pending_receivables": 450000.00,
    "total_credit_notes": 0.00,
    "net_turnover": 3850000.00,
    "statutory_ceiling": 5000000.00,
    "ceiling_percentage": 77.0,
    "is_near_ceiling": false,
    "near_ceiling_threshold": 4000000.00,
    "is_ceiling_exceeded": false,
    "consecutive_exceeded_years": 0,
    "warning_banner": null
  }
}
```

*Note:* If `net_turnover >= 4,000,000 DZD`, `is_near_ceiling` is `true` with warning:
`"[Fonctionnalité MoukawilOS - Alerte Préventive] Vous avez atteint 80% du seuil annuel légal (4 000 000 DA)."`

### 5.2. Statutory Calendar & Obligations
`GET /api/compliance/calendar`

Returns all statutory administrative and fiscal obligations for the current calendar year with dynamic relative statuses.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "obl_g12",
      "code": "G12_DECLARATION",
      "title": "Déclaration Annuelle Série G n° 12 (IFU)",
      "due_date": "2026-06-30",
      "legal_reference": "CIDTA art. 282 sexies & 365 bis",
      "status": "upcoming",
      "days_remaining": 88,
      "authority": "Direction Générale des Impôts (DGI)",
      "notes": "Paiement intégral ou fractionné (50% au 30/06, 25% au 15/09, 25% au 15/12)"
    },
    {
      "id": "obl_casnos",
      "code": "CASNOS_COTISATION",
      "title": "Cotisation Annuelle CASNOS",
      "due_date": "2026-06-30",
      "legal_reference": "Décret exécutif n° 26-257",
      "status": "upcoming",
      "days_remaining": 88,
      "authority": "Caisse Nationale de Sécurité Sociale des Non-Salariés (CASNOS)",
      "notes": "Cotisation forfaitaire de 24 000 DA ou 15% selon régime choisi"
    },
    {
      "id": "obl_g12_bis",
      "code": "G12_BIS_REGULARIZATION",
      "title": "Déclaration Définitive Série G n° 12 bis",
      "due_date": "2027-01-20",
      "legal_reference": "CIDTA art. 282 sexies",
      "status": "pending_future",
      "days_remaining": 292,
      "authority": "Direction Générale des Impôts (DGI)",
      "notes": "Régularisation du chiffre d'affaires effectif de l'année précédente"
    }
  ]
}
```

### 5.3. Deterministic Tax Simulator
`POST /api/compliance/simulate`

Pure calculation service to simulate tax and social charges based on any hypothetical turnover figure.

**Request Body:**
```json
{
  "annual_turnover": 4500000.00,
  "casnos_regime": "forfait"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "annual_turnover": 4500000.00,
    "ifu": {
      "rate": 0.005,
      "raw_amount": 22500.00,
      "statutory_floor": 10000.00,
      "final_tax": 22500.00,
      "schedule": {
        "installment_1_june_30": 11250.00,
        "installment_2_sept_15": 5625.00,
        "installment_3_dec_15": 5625.00
      }
    },
    "casnos": {
      "regime": "forfait",
      "annual_contribution": 24000.00,
      "deadline": "2026-06-30"
    },
    "total_statutory_charges": 46500.00,
    "net_income_after_charges": 4453500.00,
    "effective_charge_rate_pct": 1.03,
    "ceiling_status": {
      "limit": 5000000.00,
      "percentage": 90.0,
      "is_exceeded": false,
      "warning": "[Fonctionnalité MoukawilOS - Alerte Préventive] Chiffre d'affaires supérieur à 80% du plafond légal."
    }
  }
}
```

---

## 6. Regulatory Assistant (RAG) Endpoints

### 6.1. Ask Regulatory Question
`POST /api/assistant/query`

Proxies the user query to the internal FastAPI RAG service (`rag/`), ensuring strict grounded retrieval from verified Algerian legal sources.

**Request Body:**
```json
{
  "query": "Quel est le taux de l'IFU pour un auto-entrepreneur développeur web et quand dois-je le déclarer ?",
  "conversation_id": "conv_92384910-2b1d-409c-9c31-9a7f9b8c91a0"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "query": "Quel est le taux de l'IFU pour un auto-entrepreneur développeur web et quand dois-je le déclarer ?",
    "answer": "Pour un auto-entrepreneur exerçant une activité de service numérique (telle que le développement web), le taux de l'Impôt Forfaitaire Unique (IFU) est fixé à 0,5% du chiffre d'affaires effectivement encaissé, avec un minimum légal de 10 000 DA par an. La déclaration prévisionnelle (Série G n° 12) doit être souscrite au plus tard le 30 juin de chaque année, accompagnée du paiement intégral ou de la première tranche (50%).",
    "sources": [
      {
        "document": "Code des Impôts Directs et Taxes Assimilées (CIDTA)",
        "article": "Article 282 sexies",
        "official_reference": "Loi de Finances 2024",
        "status": "verified-official",
        "url": "https://mfdgi.gov.dz"
      },
      {
        "document": "Code des Impôts Directs et Taxes Assimilées (CIDTA)",
        "article": "Article 365 bis",
        "official_reference": "Loi de Finances 2024",
        "status": "verified-official",
        "url": "https://mfdgi.gov.dz"
      }
    ],
    "confidence_score": 0.94,
    "fallback_triggered": false
  }
}
```

### 6.2. Internal RAG Service Endpoint (FastAPI Microservice)
`POST http://localhost:8000/query`

**Payload:**
```json
{
  "query": "text query",
  "top_k": 4,
  "similarity_threshold": 0.75
}
```
