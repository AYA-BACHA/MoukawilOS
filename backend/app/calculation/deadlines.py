"""Deadline calendar and alert building. Pure functions: no database, no clock."""
from datetime import date, timedelta

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