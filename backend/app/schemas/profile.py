from datetime import date

from pydantic import BaseModel, Field, model_validator

from app.core.lookups import Language, Theme
from app.services.numbering import parse_number

REQUIRED_NOT_NULL = {"first_name", "last_name"}


class ProfileUpdate(BaseModel):
    """Every field optional. Only the fields sent are changed."""
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    address: str | None = Field(default=None, max_length=255)
    trade_address: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    nif: str | None = Field(default=None, pattern=r"^[0-9]{15}$")
    ai_number: str | None = Field(default=None, pattern=r"^[0-9]{11}$")
    rib: str | None = Field(default=None, pattern=r"^[0-9]{20}$")
    anae_card_number: str | None = Field(default=None, pattern=r"^[0-9]{2}-[0-9]{6}$")
    anae_card_issue_date: date | None = None
    activity_start_date: date | None = None
    past_years_confirmed: bool | None = None
    last_invoice_number: str | None = Field(default=None, max_length=30)

    @model_validator(mode="after")
    def no_null_names(self):
        for f in REQUIRED_NOT_NULL:
            if f in self.model_fields_set and getattr(self, f) is None:
                raise ValueError(f"{f} cannot be null")
        if "last_invoice_number" in self.model_fields_set:
            if self.last_invoice_number is None:
                raise ValueError("last_invoice_number cannot be null")
            parse_number(self.last_invoice_number)  # ValueError -> 422
        return self


class PreferencesUpdate(BaseModel):
    language: Language | None = None
    theme: Theme | None = None