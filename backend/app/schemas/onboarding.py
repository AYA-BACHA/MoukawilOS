from datetime import date

from pydantic import BaseModel, Field, field_validator

from app.services.numbering import parse_number


class OnboardingIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)

    address: str | None = Field(default=None, max_length=255)
    trade_address: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    nif: str | None = Field(default=None, pattern=r"^[0-9]{15}$")
    ai_number: str | None = Field(default=None, pattern=r"^[0-9]{11}$")
    rib: str | None = Field(default=None, pattern=r"^[0-9]{20}$")
    anae_card_number: str | None = Field(default=None, pattern=r"^[0-9]{2}-[0-9]{6}$")
    anae_card_issue_date: date | None = None
    activity_start_date: date | None = None

    # last invoice issued this year, e.g. "FAC-2026-037". Omit if none.
    last_invoice_number: str | None = None
    past_years_confirmed: bool = False

    @field_validator("last_invoice_number")
    @classmethod
    def check_last_number(cls, v: str | None) -> str | None:
        if v is None or not v.strip():
            return None
        parse_number(v)  # raises ValueError -> 422
        return v.strip().upper()


class OnboardingOut(BaseModel):
    freelancer_id: int