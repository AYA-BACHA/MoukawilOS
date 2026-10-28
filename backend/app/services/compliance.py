from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Africa/Algiers")
RULE_CODES = ("CEILING", "IFU_RATE", "IFU_MIN", "CASNOS_FLAT")
NOTE = "Estimate based on your paid invoices. It is not a tax declaration."
DEFAULT_REMINDER_DAYS = 30            # used only if the REMINDER_DAYS rule is missing

# the instalment plan is not modelled, so these rows are not shown
HIDDEN = {"IFU_INSTALLMENT_1", "IFU_INSTALLMENT_2", "IFU_INSTALLMENT_3"}
# users who started after 30 June file no G12 and pay no minimum by 30 June
G12_FAMILY = {"G12", "IFU_MINIMUM"}

# these deadlines carry an estimated amount
AMOUNT_CODES = {"G12", "G12_BIS", "CASNOS_PAYMENT"}

ALERT_TEXT = {
    "G12": ("Statutory G12 Declaration Due",
            "Forecast IFU declaration deadline is {date}."),
    "G12_BIS": ("Statutory G12 bis Declaration Due",
                "Annual IFU regularisation deadline is {date}."),
    "IFU_MINIMUM": ("IFU Minimum Payment Due",
                    "The IFU minimum must be paid in full by {date}."),
    "CASNOS_PAYMENT": ("CASNOS Contribution Due",
                       "Annual CASNOS contribution deadline is {date}."),
    "CASNOS_AFFILIATION": ("CASNOS Affiliation Due",
                           "CASNOS affiliation deadline is {date}."),
    "NIF_DECLARATION": ("Tax ID Declaration Due",
                        "Tax ID declaration deadline is {date}."),
}


def today_dz() -> date:
    return datetime.now(TZ).date()


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


def amount_for(code, period, amounts_by_year):
    """Estimated amount for a deadline, from the figures of its period year."""
    return amounts_by_year.get(period, {}).get(code)


def build_calendar(defs, done, card_date, activity_start, year, today):
    """Deadlines that fall in the given calendar year."""
    items = []
    for d in defs:
        if d["code"] in HIDDEN:
            continue
        if d["days"] is not None:                       # relative deadline
            anchor = activity_start if d["anchor_start"] else card_date
            if anchor is None:
                continue
            start, end, period = anchor, anchor + timedelta(days=d["days"]), anchor.year
            if end.year != year:
                continue
        else:                                           # fixed yearly window
            period = year - d["year_offset"]
            start = date(year, d["start_month"], d["start_day"])
            end = date(year, d["end_month"], d["end_day"])
            if activity_start and end < activity_start:  # activity had not started yet
                continue
            if (d["code"] in G12_FAMILY and activity_start
                    and activity_start > date(period, 6, 30)):
                continue                                 # first year: no G12
        if (d["code"], period) in done:
            status = "done"
        elif today > end:
            status = "overdue"
        elif today >= start:
            status = "open"
        else:
            status = "upcoming"
        items.append({
            "code": d["code"], "period_year": period,
            "start_date": start, "end_date": end, "status": status,
            "days_left": None if status == "done" else (end - today).days,
            "official_link": d["official_link"], "note": d["note"],
            "verified": d["verified"], "amount_da": None,
        })
    items.sort(key=lambda i: i["end_date"])
    return items


def build_alerts(items, reminder_days, ifu_by_year):
    """Not-done deadlines that are close, due today, or overdue."""
    alerts = []
    for i in items:
        if i["status"] == "done" or i["days_left"] > reminder_days:
            continue
        title, text = ALERT_TEXT.get(i["code"], (i["code"], "Deadline is {date}."))
        end, left = i["end_date"], i["days_left"]
        severity = "overdue" if left < 0 else "warning" if left <= 7 else "info"
        alerts.append({
            "id": f"{i['code']}-{i['period_year']}",
            "code": i["code"],
            "title": title,
            "message": text.format(date=f"{end:%B} {end.day}, {end.year}"),
            "severity": severity,
            "due_date": end,
            "days_left": left,
            "period_year": i["period_year"],
            "amount_da": amount_for(i["code"], i["period_year"], ifu_by_year),
            "verified": i["verified"],
            
        })
    alerts.sort(key=lambda a: a["due_date"])
    return alerts



CAP_RULE_CODES = RULE_CODES + ("WARN_LEVEL_1", "WARN_LEVEL_2", "CEILING_STRIKES")


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