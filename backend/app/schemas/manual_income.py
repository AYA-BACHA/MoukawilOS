from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator , model_validator


class ManualIncomeIn(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    received_date: date
    note: str | None = Field(default=None, max_length=500)

    @field_validator("note")
    @classmethod
    def blank_note_is_none(cls, v):
        return v.strip() or None if isinstance(v, str) else v


class ManualIncomeOut(BaseModel):
    id: int
    amount: Decimal
    received_date: date
    note: str | None
    created_at: datetime


class ManualIncomePage(BaseModel):
    items: list[ManualIncomeOut]
    total: int
    limit: int
    offset: int
    total_amount_da: Decimal      # sum of the entries that match the filter


class ManualIncomePatch(BaseModel):
    """Only the fields sent are changed."""
    amount: Decimal | None = Field(default=None, gt=0, max_digits=14, decimal_places=2)
    received_date: date | None = None
    note: str | None = Field(default=None, max_length=500)

    @field_validator("note")
    @classmethod
    def blank_note_is_none(cls, v):
        return v.strip() or None if isinstance(v, str) else v

    @model_validator(mode="after")
    def no_null_required(self):
        for f in ("amount", "received_date"):
            if f in self.model_fields_set and getattr(self, f) is None:
                raise ValueError(f"{f} cannot be null")
        return self