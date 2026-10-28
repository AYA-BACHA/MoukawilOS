from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from zoneinfo import ZoneInfo

from app.core.security import get_current_freelancer_id
from app.calculation.calendar import generate_annual_obligations_calendar
from app.calculation.taxes import simulate_total_obligations
from app.calculation.turnover import calculate_turnover_metrics
from app.repositories import analytics as repo
from app.schemas.compliance import (
    CalendarResponse,
    ObligationItem,
    SimulateRequest,
    SimulateResponse,
    SimulationResultData,
    IFUDetailsOut,
    IFUScheduleOut,
    CASNOSDetailsOut,
    CeilingStatusOut,
)

router = APIRouter(prefix="/compliance", tags=["compliance"])
TZ = ZoneInfo("Africa/Algiers")


@router.get("/calendar", response_model=CalendarResponse)
def get_compliance_calendar(
    year: int = Query(default_factory=lambda: datetime.now(TZ).year, ge=2020, le=2050),
    fid: int = Depends(get_current_freelancer_id),
):
    """
    Returns all statutory administrative and fiscal obligations for the specified calendar year
    with dynamic relative statuses (CIDTA Art. 282 quater, Décret 26-257).
    """
    completed = repo.get_completed_obligation_codes(fid, year)
    items = generate_annual_obligations_calendar(fiscal_year=year, completed_codes=completed)

    data = [
        ObligationItem(
            id=f"obl_{item['code'].lower()}",
            code=item["code"],
            title=item["title"],
            due_date=item["due_date"],
            legal_reference=item["statutory_reference"],
            status="upcoming" if item["status"] in ("pending", "due_soon") else item["status"],
            days_remaining=item["days_remaining"],
            authority=(
                "Direction Générale des Impôts (DGI)"
                if "G12" in item["code"]
                else "Caisse Nationale de Sécurité Sociale des Non-Salariés (CASNOS)"
            ),
            notes=item["description"],
        )
        for item in items
    ]
    return {"success": True, "data": data}


@router.post("/simulate", response_model=SimulateResponse)
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

