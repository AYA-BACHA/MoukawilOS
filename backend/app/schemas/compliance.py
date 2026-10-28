from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class ObligationOut(BaseModel):
    code: str
    period_year: int
    start_date: date
    end_date: date
    status: Literal["upcoming", "open", "overdue", "done"]
    days_left: int | None
    official_link: str | None
    note: str | None
    verified: bool
    amount_da: Decimal | None = None


class CalendarOut(BaseModel):
    year: int
    items: list[ObligationOut]
    total: int


class SummaryOut(BaseModel):
    year: int
    collected_da: Decimal
    ceiling_da: Decimal | None
    percent_of_ceiling: Decimal | None
    remaining_da: Decimal | None
    over_ceiling: bool
    ifu_estimate_da: Decimal | None
    casnos_flat_da: Decimal | None
    total_estimate_da: Decimal | None
    missing_rules: list[str]
    sources: dict[str, str]
    note: str
    ifu_rate_percent: Decimal | None
    ifu_minimum_da: Decimal | None
    ceiling_level: Literal["ok", "warning", "high", "exceeded"] | None = None


class DashboardSummaryOut(SummaryOut):
    pending_da: Decimal
    invoice_counts: dict[str, int]


class AlertOut(BaseModel):
    id: str
    kind: Literal["deadline", "ceiling"] = "deadline"
    code: str
    title: str
    message: str
    severity: Literal["info", "warning", "overdue", "critical"]
    due_date: date | None = None
    days_left: int | None = None
    period_year: int
    amount_da: Decimal | None = None
    verified: bool


class AlertList(BaseModel):
    items: list[AlertOut]
    total: int