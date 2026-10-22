import pytest
from app.services.numbering import (
    current_year, format_number, next_number, parse_number)

Y = current_year()


def test_parse_valid():
    assert parse_number(f"FAC-{Y}-037") == (Y, 37)
    assert parse_number(f" fac-{Y}-5000 ") == (Y, 5000)


@pytest.mark.parametrize("bad", [
    "037", "FAC-26-001", f"FAC-{Y}-1", f"FAC-{Y}-000",
    f"INV-{Y}-001", f"FAC-{Y + 1}-001", "",
])
def test_parse_invalid(bad):
    with pytest.raises(ValueError):
        parse_number(bad)


def test_format_pads_to_three_digits():
    assert format_number(2026, 5) == "FAC-2026-005"
    assert format_number(2026, 1234) == "FAC-2026-1234"


def test_next_number_continues_same_year():
    assert next_number(37, Y, Y) == f"FAC-{Y}-038"


def test_next_number_restarts_new_year_or_empty():
    assert next_number(40, Y - 1, Y) == f"FAC-{Y}-001"
    assert next_number(0, None, Y) == f"FAC-{Y}-001"