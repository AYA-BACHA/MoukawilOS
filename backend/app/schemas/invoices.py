from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from app.core.lookups import PaymentRail

from pydantic import BaseModel, Field


class ItemIn(BaseModel):
    description: str = Field(min_length=1, max_length=500)
    quantity: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    unit: str | None = Field(default=None, max_length=30)
    unit_price: Decimal = Field(gt=0, max_digits=14, decimal_places=2)


class ItemOut(BaseModel):
    id: int
    description: str
    quantity: Decimal
    unit: str | None
    unit_price: Decimal
    line_total: Decimal


class InvoiceBase(BaseModel):
    client_id: int
    due_date: date | None = None
    note: str | None = Field(default=None, max_length=1000)
    currency: Literal["DZD"] = "DZD"
    items: list[ItemIn] = []


class PayRequest(BaseModel):
    paid_at: date
    payment_rail: PaymentRail | None = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(InvoiceBase):
    """Full replacement of a draft (items included)."""


class CancelRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=500)


class SnapshotOut(BaseModel):
    seller_name: str
    seller_address: str
    seller_nif: str
    seller_ai: str | None
    seller_card_number: str
    seller_rib: str
    client_type: str
    client_name: str
    client_address: str
    client_rc: str | None
    client_nif: str | None
    client_nis: str | None


class AuditEventOut(BaseModel):
    id: int
    event_type: str            # issued | paid | unpaid | cancelled
    details: dict = {}
    created_at: datetime


class InvoiceOut(BaseModel):
    id: int
    client_id: int
    client_name: str          # snapshot if issued, live client if draft
    status: str
    number: str | None        # FAC-2026-001
    sequence_number: int | None
    number_year: int | None
    issue_date: date | None
    due_date: date | None
    currency: str
    total: Decimal
    paid_at: date | None     
    payment_rail: str | None = None
    cancelled_at: datetime | None
    cancellation_reason: str | None
    note: str | None
    created_at: datetime
    items: list[ItemOut]
    warning: str | None = None
    snapshot: SnapshotOut | None = None
    audit_log: list[AuditEventOut] | None = None
    credit_notes: list[dict] = []
    has_credit_notes: bool = False
    total_credited: Decimal = Decimal("0.00")


class InvoicePage(BaseModel):
    items: list[InvoiceOut]
    total: int
    limit: int
    offset: int
