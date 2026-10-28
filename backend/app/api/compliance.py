from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.security import get_current_freelancer_id
from app.repositories import compliance as repo
from app.schemas.compliance import (
    AlertList,
    CalendarOut,
    DashboardSummaryOut,
    SimulateRequest,
    SimulateResponse,
    SimulationResultData,
    IFUDetailsOut,
    IFUScheduleOut,
    CASNOSDetailsOut,
    CeilingStatusOut,
)
from app.services import compliance as svc
from app.calculation.taxes import simulate_total_obligations
from app.calculation.turnover import calculate_turnover_metrics

router = APIRouter(tags=["compliance"])
TZ = ZoneInfo("Africa/Algiers")


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
        out[y] = {
            "G12": s["ifu_estimate_da"],
            "G12_BIS": s["ifu_estimate_da"],
            "CASNOS_PAYMENT": s["casnos_flat_da"],
        }
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
def compliance_calendar(
    year: Optional[int] = Query(None, ge=2020, le=2100),
    fid: int = Depends(get_current_freelancer_id),
):
    today = svc.today_dz()
    y = year or today.year
    items = _calendar_items(fid, y, today)
    amounts = _amounts_by_year(fid, items, today)
    for i in items:
        i["amount_da"] = svc.amount_for(i["code"], i["period_year"], amounts)
    return {
        "year": y,
        "items": items,
        "total": len(items),
        "data": items,
        "success": True,
    }


@router.get("/compliance/alerts", response_model=AlertList)
def compliance_alerts(
    on: Optional[date] = Query(None, description="test only: pretend it is this date"),
    fid: int = Depends(get_current_freelancer_id),
):
    today = on or svc.today_dz()
    items = (
        _calendar_items(fid, today.year, today)
        + _calendar_items(fid, today.year + 1, today)
    )  # January deadlines in December
    rules = repo.get_rules(("REMINDER_DAYS",), today)
    reminder = (
        int(rules["REMINDER_DAYS"]["value"])
        if "REMINDER_DAYS" in rules
        else svc.DEFAULT_REMINDER_DAYS
    )
    _, activity_start = repo.get_dates(fid)
    if activity_start is None:
        items = [i for i in items if i["status"] != "overdue"]
    alerts = svc.build_alerts(items, reminder, _amounts_by_year(fid, items, today))
    cap = _cap_alert(fid, today)
    if cap:
        alerts.insert(0, cap)
    return {"items": alerts, "total": len(alerts)}


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def dashboard_summary(
    year: Optional[int] = Query(None, ge=2020, le=2100),
    fid: int = Depends(get_current_freelancer_id),
):
    today = svc.today_dz()
    y = year or today.year
    rules = repo.get_rules(svc.CAP_RULE_CODES, min(today, date(y, 12, 31)))
    out = svc.build_summary(y, repo.paid_turnover(fid, y), rules)
    counts, pending = repo.invoice_stats(fid, y)
    return {**out, "pending_da": pending, "invoice_counts": counts}


@router.post("/obligations/{code}/complete", status_code=204)
def complete_obligation(
    code: str,
    period_year: int = Query(ge=2020, le=2100),
    fid: int = Depends(get_current_freelancer_id),
):
    if not repo.complete(fid, code, period_year):
        raise HTTPException(404, "unknown obligation")
    return Response(status_code=204)


@router.delete("/obligations/{code}/complete", status_code=204)
def undo_obligation(
    code: str,
    period_year: int = Query(ge=2020, le=2100),
    fid: int = Depends(get_current_freelancer_id),
):
    if not repo.uncomplete(fid, code, period_year):
        raise HTTPException(404, "unknown obligation")
    return Response(status_code=204)


@router.post("/compliance/simulate", response_model=SimulateResponse)
def simulate_tax_and_social_obligations(data: SimulateRequest):
    """
    Deterministic calculation service simulating statutory tax (IFU) and social security (CASNOS)
    charges based on any arbitrary hypothetical turnover figure.
    """
    sim = simulate_total_obligations(turnover=data.annual_turnover, casnos_regime=data.casnos_regime)
    turnover_metrics = calculate_turnover_metrics(collected_revenue=data.annual_turnover)

    result = SimulationResultData(
        annual_turnover=sim["annual_turnover"],
        ifu=IFUDetailsOut(
            rate=sim["ifu"]["rate"],
            raw_amount=sim["ifu"]["raw_amount"],
            statutory_floor=sim["ifu"]["statutory_floor"],
            final_tax=sim["ifu"]["final_tax"],
            schedule=IFUScheduleOut(
                installment_1_june_30=sim["ifu"]["schedule"]["installment_1_june_30"],
                installment_2_sept_15=sim["ifu"]["schedule"]["installment_2_sept_15"],
                installment_3_dec_15=sim["ifu"]["schedule"]["installment_3_dec_15"],
            ),
        ),
        casnos=CASNOSDetailsOut(
            regime=sim["casnos"]["regime"],
            annual_contribution=sim["casnos"]["annual_contribution"],
            deadline=f"{datetime.now(TZ).year}-06-30",
        ),
        total_statutory_charges=sim["total_statutory_charges"],
        net_income_after_charges=sim["net_income_after_charges"],
        effective_charge_rate_pct=sim["effective_charge_rate_pct"],
        ceiling_status=CeilingStatusOut(
            limit=Decimal("5000000.00"),
            percentage=turnover_metrics["percentage"],
            is_exceeded=turnover_metrics["ceiling_exceeded"],
            warning=turnover_metrics["status_message"] if turnover_metrics["threshold_80_exceeded"] else None,
        ),
    )
    return {"success": True, "data": result}
