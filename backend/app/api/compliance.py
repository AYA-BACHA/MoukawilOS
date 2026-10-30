from datetime import date, datetime
from decimal import Decimal
import logging
import time
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.db import pool
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
logger = logging.getLogger(__name__)

ALERT_RULE_CODES = svc.CAP_RULE_CODES + ("REMINDER_DAYS",)


def _calendar_items(fid, year, today, dates=None, done=None):
    if dates is None:
        card_date, start_date = repo.get_dates(fid)
    else:
        card_date, start_date = dates
    if done is None:
        done = repo.completions(fid)
    return svc.build_calendar(
        repo.obligation_defs(date(year, 1, 1)), done,
        card_date, start_date, year, today,
    )


def _amounts_by_year(fid, items, today, rules_today=None, turnover_cache=None):
    """Estimated amounts per deadline code, for each period year in the items."""
    years = {i["period_year"] for i in items if i["code"] in svc.AMOUNT_CODES}
    out = {}
    for y in sorted(years):
        target_date = min(today, date(y, 12, 31))
        rules = rules_today if (rules_today and target_date == today) else repo.get_rules(svc.RULE_CODES, target_date)
        t_val = turnover_cache.get(y) if (turnover_cache and y in turnover_cache) else repo.paid_turnover(fid, y)
        s = svc.build_summary(y, t_val, rules)
        out[y] = {
            "G12": s["ifu_estimate_da"],
            "G12_BIS": s["ifu_estimate_da"],
            "CASNOS_PAYMENT": s["casnos_flat_da"],
        }
    return out


def _cap_alert(fid, today, rules=None, turnover_cache=None, ceilings_cache=None):
    y = today.year
    if rules is None:
        rules = repo.get_rules(svc.CAP_RULE_CODES, today)
    strikes = int(rules["CEILING_STRIKES"]["value"]) if "CEILING_STRIKES" in rules else 3
    turnover, ceilings = {}, {}
    for yr in range(y - strikes, y + 1):
        turnover[yr] = turnover_cache.get(yr) if (turnover_cache and yr in turnover_cache) else repo.paid_turnover(fid, yr)
        if yr == y:
            ceilings[yr] = rules["CEILING"]["value"] if "CEILING" in rules else None
        elif ceilings_cache and yr in ceilings_cache:
            ceilings[yr] = ceilings_cache[yr]
        else:
            r = repo.get_rules(("CEILING",), date(yr, 12, 31))
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
    with pool.connection() as conn:
        dates = repo.get_dates(fid, conn=conn)
        done = repo.completions(fid, conn=conn)
    items = _calendar_items(fid, y, today, dates=dates, done=done)
    amounts = _amounts_by_year(fid, items, today)
    for i in items:
        i["amount_da"] = svc.amount_for(i["code"], i["period_year"], amounts)
        i["due_date"] = str(i["end_date"])
        i["legal_reference"] = i.get("note") or i.get("official_link") or "Law 22-23"
    return {
        "year": y,
        "items": items,
        "total": len(items),
        "data": items,
        "success": True,
    }


@router.get("/compliance/alerts", response_model=AlertList)
def compliance_alerts(
    response: Response,
    on: Optional[date] = Query(None, description="test only: pretend it is this date"),
    fid: int = Depends(get_current_freelancer_id),
):
    t0 = time.perf_counter()
    today = on or svc.today_dz()

    rules_today = repo.get_rules(ALERT_RULE_CODES, today)
    reminder = (
        int(rules_today["REMINDER_DAYS"]["value"])
        if "REMINDER_DAYS" in rules_today
        else svc.DEFAULT_REMINDER_DAYS
    )
    strikes = int(rules_today["CEILING_STRIKES"]["value"]) if "CEILING_STRIKES" in rules_today else 3
    cap_years = set(range(today.year - strikes, today.year + 1))

    with pool.connection() as conn:
        dates = repo.get_dates(fid, conn=conn)
        _, activity_start = dates
        done = repo.completions(fid, conn=conn)

        items = (
            _calendar_items(fid, today.year, today, dates=dates, done=done)
            + _calendar_items(fid, today.year + 1, today, dates=dates, done=done)
        )  # January deadlines in December

        if activity_start is None:
            items = [i for i in items if i["status"] != "overdue"]

        amount_years = {i["period_year"] for i in items if i["code"] in svc.AMOUNT_CODES}
        needed_years = sorted(cap_years | amount_years)
        turnover_cache = repo.paid_turnover_by_years(fid, needed_years, conn=conn)

    past_years = [yr for yr in cap_years if yr < today.year]
    ceilings_cache = repo.get_ceilings_by_years(past_years)

    amounts = _amounts_by_year(fid, items, today, rules_today=rules_today, turnover_cache=turnover_cache)
    alerts = svc.build_alerts(items, reminder, amounts)
    cap = _cap_alert(fid, today, rules=rules_today, turnover_cache=turnover_cache, ceilings_cache=ceilings_cache)
    if cap:
        alerts.insert(0, cap)

    elapsed = time.perf_counter() - t0
    if response is not None:
        response.headers["Server-Timing"] = f"compliance_alerts;dur={elapsed * 1000:.1f}"
    logger.info("compliance_alerts: fid=%s total=%d in %.3fs", fid, len(alerts), elapsed)

    return {"items": alerts, "total": len(alerts)}


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def dashboard_summary(
    year: Optional[int] = Query(None, ge=2020, le=2100),
    fid: int = Depends(get_current_freelancer_id),
):
    today = svc.today_dz()
    y = year or today.year
    rules = repo.get_rules(svc.CAP_RULE_CODES, min(today, date(y, 12, 31)))
    with pool.connection() as conn:
        out = svc.build_summary(y, repo.paid_turnover(fid, y), rules)
        counts, pending = repo.invoice_stats(fid, y, conn=conn)
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
