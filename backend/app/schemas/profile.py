from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator

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

    @model_validator(mode="after")
    def no_null_names(self):
        for f in REQUIRED_NOT_NULL:
            if f in self.model_fields_set and getattr(self, f) is None:
                raise ValueError(f"{f} cannot be null")
        return self


class PreferencesUpdate(BaseModel):
    language: Literal["fr", "ar"] | None = None
    theme: Literal["light", "dark", "system"] | None = None