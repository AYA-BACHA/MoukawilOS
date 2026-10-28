"""Turnover, ceiling and tax-estimate maths. Pure functions: no database, no clock."""
from decimal import ROUND_HALF_UP, Decimal

RULE_CODES = ("CEILING", "IFU_RATE", "IFU_MIN", "CASNOS_FLAT")
NOTE = "Estimate based on your paid invoices. It is not a tax declaration."
CAP_RULE_CODES = RULE_CODES + ("WARN_LEVEL_1", "WARN_LEVEL_2", "CEILING_STRIKES")


def _money(x: Decimal) -> Decimal:
    return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def build_summary(year: int, collected: Decimal, rules: dict) -> dict:
    def val(code):
        return rules[code]["value"] if code in rules else None

    ceiling, rate = val("CEILING"), val("IFU_RATE")
    minimum, casnos = val("IFU_MIN"), val("CASNOS_FLAT")

    percent = remaining = None
    if ceiling:
        percent = (collected / ceiling * 100).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        remaining = _money(max(ceiling - collected, Decimal("0")))

    ifu = None
    if rate is not None:
        ifu = collected * rate           # IFU_RATE is a fraction: 0.005 = 0.5%
        if minimum is not None:
            ifu = max(ifu, minimum)
        ifu = _money(ifu)

    casnos = _money(casnos) if casnos is not None else None
    total = _money(ifu + casnos) if ifu is not None and casnos is not None else None

    return {
        "year": year,
        "collected_da": collected,
        "ceiling_da": _money(ceiling) if ceiling is not None else None,
        "percent_of_ceiling": percent,
        "remaining_da": remaining,
        "over_ceiling": bool(ceiling) and collected > ceiling,
        "ifu_estimate_da": ifu,
        "casnos_flat_da": casnos,
        "total_estimate_da": total,
        "missing_rules": [c for c in RULE_CODES if c not in rules],
        "sources": {c: rules[c]["source"] for c in RULE_CODES if c in rules},
        "note": NOTE,
        "ifu_rate_percent": _money(rate * 100) if rate is not None else None,
        "ifu_minimum_da": _money(minimum) if minimum is not None else None,
        "ceiling_level": ceiling_level(collected, ceiling, val("WARN_LEVEL_1"), val("WARN_LEVEL_2")),
    }


def _fmt(x) -> str:
    return f"{x:,.0f}"


def ceiling_level(collected, ceiling, w1, w2):
    """'ok' | 'warning' | 'high' | 'exceeded' (None if there is no ceiling rule)."""
    if not ceiling:
        return None
    if collected > ceiling:
        return "exceeded"
    ratio = collected / ceiling
    if w2 is not None and ratio >= w2:
        return "high"
    if w1 is not None and ratio >= w1:
        return "warning"
    return "ok"


def consecutive_years_over(turnover, ceilings, year, max_years):
    """Years in a row above the ceiling, counted back from `year`
    (or from last year if this year is not above it yet)."""
    def over(y):
        return ceilings.get(y) is not None and turnover.get(y, Decimal("0")) > ceilings[y]

    y = year if over(year) else year - 1
    n = 0
    while n < max_years and over(y):
        n += 1
        y -= 1
    return n


def build_cap_alert(year, collected, rules, years_over):
    ceiling = rules.get("CEILING", {}).get("value")
    w1 = rules.get("WARN_LEVEL_1", {}).get("value")
    w2 = rules.get("WARN_LEVEL_2", {}).get("value")
    strikes = int(rules["CEILING_STRIKES"]["value"]) if "CEILING_STRIKES" in rules else 3
    level = ceiling_level(collected, ceiling, w1, w2)
    if level in (None, "ok"):
        return None
    pct = (collected / ceiling * 100).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
    if level == "exceeded":
        excess = _money(collected - ceiling)
        title, severity, amount = "Annual Turnover Ceiling Exceeded", "critical", excess
        message = (f"Your {year} turnover is {_fmt(collected)} DA, above the "
                   f"{_fmt(ceiling)} DA annual ceiling by {_fmt(excess)} DA.")
        if years_over >= strikes:
            message += (f" This is {years_over} consecutive years above the ceiling: "
                        "you must register in the commercial register to continue. "
                        "Check with ANAE.")
        else:
            message += (f" This is year {years_over} above the ceiling. After {strikes} "
                        "consecutive years you must register in the commercial register.")
    else:
        remaining = _money(ceiling - collected)
        severity = "critical" if level == "high" else "warning"
        title = ("Annual Turnover Ceiling Almost Reached" if level == "high"
                 else "Approaching Annual Turnover Ceiling")
        amount = remaining
        message = (f"You have reached {pct}% of your {_fmt(ceiling)} DA annual ceiling. "
                   f"{_fmt(remaining)} DA remaining for {year}.")
    return {
        "id": f"CEILING-{year}", "kind": "ceiling", "code": "CEILING",
        "title": title, "message": message, "severity": severity,
        "due_date": None, "days_left": None, "period_year": year,
        "amount_da": amount, "verified": False,
    }