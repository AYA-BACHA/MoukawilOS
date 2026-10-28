"""Shared test data for the compliance tests (no database needed)."""
import copy
from datetime import date
from decimal import Decimal

import pytest

TODAY = date(2026, 10, 25)          # the "current" day in every test
SARA_START = date(2025, 10, 15)     # card date and activity start of the test freelancer


def _rule(value, source="test"):
    return {"value": Decimal(value), "source": source}


# same shape as repositories.compliance.get_rules(), values as the database stores them
RULES = {
    "CEILING": _rule("5000000.000000", "LF 2023 art. 51 (loi 22-24)"),
    "IFU_RATE": _rule("0.005000", "LF 2024, CIDTA art. 282 sexies"),
    "IFU_MIN": _rule("10000.000000", "CIDTA art. 365 bis"),
    "CASNOS_FLAT": _rule("24000.000000", "Decree 24-49"),
    "WARN_LEVEL_1": _rule("0.800000", "Internal choice"),
    "WARN_LEVEL_2": _rule("0.950000", "Internal choice"),
    "CEILING_STRIKES": _rule("3.000000", "Law 22-23"),
    "REMINDER_DAYS": _rule("30.000000", "Internal choice"),
}


def _def(code, **kw):
    base = dict(code=code, start_month=None, start_day=None, end_month=None,
                end_day=None, year_offset=0, days=None, anchor_start=False,
                official_link=None, note=None, verified=False)
    base.update(kw)
    return base


# same shape as repositories.compliance.obligation_defs(), mirroring the database rows
DEFS = [
    _def("G12", start_month=5, start_day=1, end_month=6, end_day=30),
    _def("IFU_MINIMUM", start_month=1, start_day=1, end_month=6, end_day=30),
    _def("G12_BIS", start_month=1, start_day=20, end_month=1, end_day=20, year_offset=1),
    _def("CASNOS_PAYMENT", start_month=6, start_day=30, end_month=6, end_day=30),
    _def("NIF_DECLARATION", days=30, verified=True),
    _def("CASNOS_AFFILIATION", days=10, anchor_start=True),
    _def("IFU_INSTALLMENT_1", start_month=5, start_day=1, end_month=6, end_day=30),
    _def("IFU_INSTALLMENT_2", start_month=9, start_day=1, end_month=9, end_day=15),
    _def("IFU_INSTALLMENT_3", start_month=12, start_day=1, end_month=12, end_day=15),
]


@pytest.fixture
def rules():
    return copy.deepcopy(RULES)


@pytest.fixture
def defs():
    return copy.deepcopy(DEFS)


@pytest.fixture
def today():
    return TODAY