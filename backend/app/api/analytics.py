from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from zoneinfo import ZoneInfo

from app.core.security import get_current_freelancer_id
from app.calculation.turnover import calculate_turnover_metrics
from app.repositories import analytics as repo
from app.schemas.compliance import TurnoverMetricsData, TurnoverResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])
TZ = ZoneInfo("Africa/Algiers")


@router.get("/turnover", response_model=TurnoverResponse)
def get_annual_turnover(
    year: int = Query(default_factory=lambda: datetime.now(TZ).year, ge=2020, le=2050),
    fid: int = Depends(get_current_freelancer_id),
):
    """
    Computes annual cash-basis collected turnover against the 5,000,000 DZD statutory ceiling (Loi 22-23).
    Includes 80% preventative warning trigger and consecutive year breach counter.
    """
    aggregates = repo.get_turnover_aggregates(fid, year)
    metrics = calculate_turnover_metrics(
        collected_revenue=aggregates["collected"],
        credit_notes_total=aggregates["credit_notes"],
        consecutive_breach_years=aggregates["prior_consecutive"],
    )

    data = TurnoverMetricsData(
        fiscal_year=year,
        currency="DZD",
        collected_turnover=metrics["gross_collected"],
        pending_receivables=aggregates["pending"],
        total_credit_notes=metrics["credit_notes_total"],
        net_turnover=metrics["net_collected"],
        statutory_ceiling=metrics["ceiling"],
        ceiling_percentage=metrics["percentage"],
        is_near_ceiling=metrics["threshold_80_exceeded"],
        near_ceiling_threshold=Decimal("4000000.00"),
        is_ceiling_exceeded=metrics["ceiling_exceeded"],
        consecutive_exceeded_years=metrics["consecutive_breach_years"],
        warning_banner=metrics["status_message"] if metrics["threshold_80_exceeded"] else None,
    )
    return {"success": True, "data": data}

