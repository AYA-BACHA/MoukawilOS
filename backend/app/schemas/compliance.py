from datetime import date
from decimal import Decimal
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


# ---------------- Turnover & Analytics Schemas ----------------

class TurnoverMetricsData(BaseModel):
    fiscal_year: int
    currency: Literal["DZD"] = "DZD"
    collected_turnover: Decimal
    pending_receivables: Decimal
    total_credit_notes: Decimal
    net_turnover: Decimal
    statutory_ceiling: Decimal = Decimal("5000000.00")
    ceiling_percentage: Decimal
    is_near_ceiling: bool
    near_ceiling_threshold: Decimal = Decimal("4000000.00")
    is_ceiling_exceeded: bool
    consecutive_exceeded_years: int = 0
    warning_banner: Optional[str] = None


class TurnoverResponse(BaseModel):
    success: bool = True
    data: TurnoverMetricsData


# ---------------- Calendar & Obligations Schemas ----------------

class ObligationItem(BaseModel):
    id: str
    code: str
    title: str
    due_date: str
    legal_reference: str
    status: str
    days_remaining: int
    authority: str
    notes: Optional[str] = None


class CalendarResponse(BaseModel):
    success: bool = True
    data: List[ObligationItem]


# ---------------- Tax Simulator Schemas ----------------

class SimulateRequest(BaseModel):
    annual_turnover: Decimal = Field(..., ge=0, description="Gross hypothetical turnover in DZD")
    casnos_regime: Literal["forfait", "general"] = Field(
        default="forfait", description="CASNOS contribution regime: forfait (24k) or general (15%)"
    )


class IFUScheduleOut(BaseModel):
    installment_1_june_30: Decimal
    installment_2_sept_15: Decimal
    installment_3_dec_15: Decimal


class IFUDetailsOut(BaseModel):
    rate: Decimal
    raw_amount: Decimal
    statutory_floor: Decimal
    final_tax: Decimal
    schedule: IFUScheduleOut


class CASNOSDetailsOut(BaseModel):
    regime: str
    annual_contribution: Decimal
    deadline: str = "2026-06-30"


class CeilingStatusOut(BaseModel):
    limit: Decimal = Decimal("5000000.00")
    percentage: Decimal
    is_exceeded: bool
    warning: Optional[str] = None


class SimulationResultData(BaseModel):
    annual_turnover: Decimal
    ifu: IFUDetailsOut
    casnos: CASNOSDetailsOut
    total_statutory_charges: Decimal
    net_income_after_charges: Decimal
    effective_charge_rate_pct: Decimal
    ceiling_status: CeilingStatusOut


class SimulateResponse(BaseModel):
    success: bool = True
    data: SimulationResultData


# ---------------- Credit Note Schemas ----------------

class CreditNoteCreateRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500, description="Statutory justification for the credit note")
    credit_amount: Decimal = Field(..., gt=0, description="Credit amount in DZD, must not exceed invoice balance")


class CreditNoteData(BaseModel):
    id: str
    credit_note_number: str
    original_invoice_id: str
    original_invoice_number: str
    amount: Decimal
    issue_date: str


class CreditNoteResponse(BaseModel):
    success: bool = True
    data: CreditNoteData


# ---------------- Dashboard & Statutory Compliance Schemas (Kawther) ----------------

class ObligationOut(BaseModel):
    code: str
    period_year: int
    start_date: date
    end_date: date
    status: Literal["upcoming", "open", "overdue", "done"]
    days_left: Optional[int] = None
    official_link: Optional[str] = None
    note: Optional[str] = None
    verified: bool
    amount_da: Optional[Decimal] = None


class CalendarOut(BaseModel):
    year: int
    items: List[ObligationOut]
    total: int
    data: Optional[List[ObligationOut]] = None
    success: bool = True


class SummaryOut(BaseModel):
    year: int
    collected_da: Decimal
    ceiling_da: Optional[Decimal] = None
    percent_of_ceiling: Optional[Decimal] = None
    remaining_da: Optional[Decimal] = None
    over_ceiling: bool
    ifu_estimate_da: Optional[Decimal] = None
    casnos_flat_da: Optional[Decimal] = None
    total_estimate_da: Optional[Decimal] = None
    missing_rules: List[str] = Field(default_factory=list)
    sources: Dict[str, str] = Field(default_factory=dict)
    note: str
    ifu_rate_percent: Optional[Decimal] = None
    ifu_minimum_da: Optional[Decimal] = None
    ceiling_level: Optional[Literal["ok", "warning", "high", "exceeded"]] = None


class DashboardSummaryOut(SummaryOut):
    pending_da: Decimal
    invoice_counts: Dict[str, int]


class AlertOut(BaseModel):
    id: str
    kind: Literal["deadline", "ceiling"] = "deadline"
    code: str
    title: str
    message: str
    severity: Literal["info", "warning", "overdue", "critical"]
    due_date: Optional[date] = None
    days_left: Optional[int] = None
    period_year: int
    amount_da: Optional[Decimal] = None
    verified: bool


class AlertList(BaseModel):
    items: List[AlertOut]
    total: int


