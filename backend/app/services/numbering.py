import re
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Africa/Algiers")
_PATTERN = re.compile(r"^FAC-(\d{4})-(\d{3,})$")


def current_year() -> int:
    return datetime.now(TZ).year


def format_number(year: int, seq: int) -> str:
    return f"FAC-{year}-{seq:03d}"


def parse_number(value: str) -> tuple[int, int]:
    """'FAC-2026-037' -> (2026, 37). Raises ValueError if invalid."""
    m = _PATTERN.match(value.strip().upper())
    if not m:
        raise ValueError("invoice number must look like FAC-2026-037")
    year, seq = int(m[1]), int(m[2])
    if seq < 1:
        raise ValueError("the sequence must be at least 1")
    if year > current_year():
        raise ValueError("the year cannot be in the future")
    return year, seq


def next_number(last_seq: int, last_year: int | None, year: int) -> str:
    """Counter restarts at 1 when the stored year is not the current year."""
    seq = last_seq + 1 if last_year == year else 1
    return format_number(year, seq)