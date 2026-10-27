from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator
import re
from app.core.lookups import ClientType

class ClientBase(BaseModel):
    
    name: str = Field(min_length=1, max_length=200)
    address: str = Field(min_length=1, max_length=255)
    rc: str | None = Field(default=None, max_length=50)
    nif: str | None = Field(default=None, max_length=20)
    nis: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=20)

    @model_validator(mode="after")
    def check_type_rules(self):
        # normalize whitespace
        for f in ("name", "address", "rc", "nif", "nis"):
            v = getattr(self, f)
            if isinstance(v, str):
                setattr(self, f, v.strip() or None if f in ("rc", "nif", "nis") else v.strip())

        if self.client_type == "B2B":
            if not (self.nif and self.nis):
                raise ValueError("B2B clients require nif and nis (rc is optional)")
            if not re.fullmatch(r"\d{15}", self.nif):
                raise ValueError("nif must be exactly 15 digits")
        elif any((self.rc, self.nif, self.nis)):
            raise ValueError("B2C clients must not have rc, nif or nis")
        return self

class ClientCreate(ClientBase):
    pass


class ClientUpdate(ClientBase):
    """Full replacement (PUT-style) so the B2B/B2C rule is always checked."""


class ClientOut(BaseModel):
    id: int
    client_type: str
    name: str
    address: str
    country: str
    rc: str | None
    nif: str | None
    nis: str | None
    email: str | None
    phone: str | None
    archived_at: datetime | None
    created_at: datetime


class ClientPage(BaseModel):
    items: list[ClientOut]
    total: int
    limit: int
    offset: int