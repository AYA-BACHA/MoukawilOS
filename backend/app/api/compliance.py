from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.security import get_current_freelancer_id
from app.repositories import compliance as repo
from app.schemas.compliance import AlertList, CalendarOut, DashboardSummaryOut
from app.services import compliance as svc

router = APIRouter(tags=["compliance"])


def _calendar_items(fid, year, today):
    card_date, start_date = repo.get_dates(fid)
    return svc.build_calendar(
        repo.obligation_defs(date(year, 1, 1)), repo.completions(fid),
        card_date, start_date, year, today,
    )


def _amounts_by_year(fid, items, today):
    """Estimated amounts per deadline code, for each period year in the items."""
    years = {i["period_year"] for i in items if i["code"] in svc.AMOUNT_CODES}
    out = {}
    for y in sorted(years):
        rules = repo.get_rules(svc.RULE_CODES, min(today, date(y, 12, 31)))
        s = svc.build_summary(y, repo.paid_turnover(fid, y), rules)
        out[y] = {"G12": s["ifu_estimate_da"], "G12_BIS": s["ifu_estimate_da"],
                  "CASNOS_PAYMENT": s["casnos_flat_da"]}
    return out


def _cap_alert(fid, today):
    y = today.year
    rules = repo.get_rules(svc.CAP_RULE_CODES, today)
    strikes = int(rules["CEILING_STRIKES"]["value"]) if "CEILING_STRIKES" in rules else 3
    turnover, ceilings = {}, {}
    for yr in range(y - strikes, y + 1):
        r = rules if yr == y else repo.get_rules(("CEILING",), date(yr, 12, 31))
        turnover[yr] = repo.paid_turnover(fid, yr)
        ceilings[yr] = r["CEILING"]["value"] if "CEILING" in r else None
    n = svc.consecutive_years_over(turnover, ceilings, y, strikes)
    return svc.build_cap_alert(y, turnover[y], rules, n)


@router.get("/compliance/calendar", response_model=CalendarOut)
def compliance_calendar(year: int | None = Query(None, ge=2020, le=2100),
                        fid: int = Depends(get_current_freelancer_id)):
    today = svc.today_dz()
    y = year or today.year
    items = _calendar_items(fid, y, today)
    amounts = _amounts_by_year(fid, items, today)
    for i in items:
        i["amount_da"] = svc.amount_for(i["code"], i["period_year"], amounts)
    return {"year": y, "items": items, "total": len(items)}


@router.get("/compliance/alerts", response_model=AlertList)
def compliance_alerts(on: date | None = Query(None, description="test only: pretend it is this date"),
                      fid: int = Depends(get_current_freelancer_id)):
    today = on or svc.today_dz()
    items = (_calendar_items(fid, today.year, today)
             + _calendar_items(fid, today.year + 1, today))   # January deadlines in December
    rules = repo.get_rules(("REMINDER_DAYS",), today)
    reminder = (int(rules["REMINDER_DAYS"]["value"]) if "REMINDER_DAYS" in rules
                else svc.DEFAULT_REMINDER_DAYS)
    _, activity_start = repo.get_dates(fid)
    if activity_start is None:
        # without a start date we cannot tell that a past deadline applied to the user
        items = [i for i in items if i["status"] != "overdue"]
    alerts = svc.build_alerts(items, reminder, _amounts_by_year(fid, items, today))
    cap = _cap_alert(fid, today)
    if cap:
        alerts.insert(0, cap)            # the ceiling comes first
    return {"items": alerts, "total": len(alerts)}


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def dashboard_summary(year: int | None = Query(None, ge=2020, le=2100),
                      fid: int = Depends(get_current_freelancer_id)):
    today = svc.today_dz()
    y = year or today.year
    rules = repo.get_rules(svc.CAP_RULE_CODES, min(today, date(y, 12, 31)))
    out = svc.build_summary(y, repo.paid_turnover(fid, y), rules)
    counts, pending = repo.invoice_stats(fid, y)
    return {**out, "pending_da": pending, "invoice_counts": counts}


@router.post("/obligations/{code}/complete", status_code=204)
def complete_obligation(code: str, period_year: int = Query(ge=2020, le=2100),
                        fid: int = Depends(get_current_freelancer_id)):
    if not repo.complete(fid, code, period_year):
        raise HTTPException(404, "unknown obligation")
    return Response(status_code=204)


@router.delete("/obligations/{code}/complete", status_code=204)
def undo_obligation(code: str, period_year: int = Query(ge=2020, le=2100),
                    fid: int = Depends(get_current_freelancer_id)):
    if not repo.uncomplete(fid, code, period_year):
        raise HTTPException(404, "unknown obligation")
    return Response(status_code=204)