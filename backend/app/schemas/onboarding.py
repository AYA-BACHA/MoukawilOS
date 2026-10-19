from datetime import date

from pydantic import BaseModel, Field


class OnboardingIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=1, max_length=255)
    trade_address: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=20)

    nif: str = Field(pattern=r"^[0-9]{15}$")
    ai_number: str | None = Field(default=None, pattern=r"^[0-9]{11}$")
    rib: str = Field(pattern=r"^[0-9]{20}$")
    anae_card_number: str = Field(pattern=r"^[0-9]{2}-[0-9]{6}$")
    anae_card_issue_date: date
    activity_start_date: date

    # for users who already issued invoices this year (0 = none)
    last_invoice_number: int = Field(default=0, ge=0)
    past_years_confirmed: bool = False


class OnboardingOut(BaseModel):
    freelancer_id: int