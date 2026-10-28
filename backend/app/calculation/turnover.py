"""
Turnover and Statutory Ceiling Calculation Engine
Algerian Auto-Entrepreneur Law No. 22-23 (Articles 2, 13, 14) & CIDTA Art. 282 sexies.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, Union

# Statutory Invariants
STATUTORY_CEILING = Decimal("5000000.00")  # 5,000,000 DZD per calendar year (Loi 22-23 art. 2)
PREVENTATIVE_THRESHOLD_RATIO = Decimal("0.80")
PREVENTATIVE_THRESHOLD_AMOUNT = Decimal("4000000.00")  # 80% preventative warning trigger
MANDATORY_RADIATION_CONSECUTIVE_YEARS = 3  # Radiation from ANAE after 3 consecutive years (Loi 22-23 art. 13-14)


def to_decimal(val: Union[Decimal, float, int, str, None]) -> Decimal:
    if val is None:
        return Decimal("0.00")
    if isinstance(val, Decimal):
        return val
    return Decimal(str(val))


def calculate_turnover_metrics(
    collected_revenue: Union[Decimal, float, int, str],
    credit_notes_total: Union[Decimal, float, int, str] = Decimal("0.00"),
    consecutive_breach_years: int = 0,
) -> Dict[str, Any]:
    """
    Computes cash-basis collected turnover against the 5,000,000 DZD statutory ceiling.

    Cash-Basis Principle (CIDTA art. 282 sexies):
    Only effectively received payments from finalized invoices are recognized.
    Any issued Credit Notes (Factures d'Avoir) decrement the net collected turnover.

    Args:
        collected_revenue: Gross turnover collected from paid invoices in active calendar year.
        credit_notes_total: Total amount credited/refunded through formal Avoirs.
        consecutive_breach_years: Number of consecutive prior calendar years exceeding 5M DZD.

    Returns:
        Dict containing exact decimal metrics, alert flags, and legal status labels.
    """
    gross = to_decimal(collected_revenue)
    credits = to_decimal(credit_notes_total)

    if gross < Decimal("0.00"):
        raise ValueError("Gross collected revenue cannot be negative")
    if credits < Decimal("0.00"):
        raise ValueError("Credit notes total cannot be negative")

    # Net collected revenue (cash-basis)
    net_collected = max(Decimal("0.00"), gross - credits)

    # Remaining allowance under statutory ceiling
    remaining = max(Decimal("0.00"), STATUTORY_CEILING - net_collected)

    # Utilization ratio & percentage
    utilization_rate = (net_collected / STATUTORY_CEILING).quantize(
        Decimal("0.0001"), rounding=ROUND_HALF_UP
    )
    percentage = (utilization_rate * Decimal("100.00")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    # Statutory Threshold Checks
    threshold_80_exceeded = net_collected >= PREVENTATIVE_THRESHOLD_AMOUNT
    ceiling_exceeded = net_collected > STATUTORY_CEILING

    # Consecutive years evaluation
    if ceiling_exceeded:
        effective_consecutive = max(1, consecutive_breach_years + 1)
    else:
        effective_consecutive = 0

    radiation_warning = effective_consecutive >= MANDATORY_RADIATION_CONSECUTIVE_YEARS

    # Institutional legal status classification
    if radiation_warning:
        status = "radiation_risk"
        status_message = (
            f"Mandatory radiation threshold reached ({effective_consecutive} consecutive years exceeding "
            f"5,000,000 DZD). Commercial registration with CNRC required under Loi 22-23 Articles 13 & 14."
        )
    elif ceiling_exceeded:
        status = "exceeded"
        status_message = (
            f"Annual turnover ({net_collected:,.2f} DZD) has exceeded the 5,000,000 DZD legal ceiling "
            f"(Year {effective_consecutive} of 3 consecutive years threshold)."
        )
    elif threshold_80_exceeded:
        status = "warning_80"
        status_message = (
            "[Fonctionnalité MoukawilOS - Alerte Préventive] Collected turnover has reached 80% "
            f"({net_collected:,.2f} DZD / 5,000,000 DZD). Monitor billings to prevent status breach."
        )
    else:
        status = "normal"
        status_message = (
            f"Turnover within safe statutory boundaries ({net_collected:,.2f} DZD, "
            f"{remaining:,.2f} DZD remaining)."
        )

    return {
        "gross_collected": gross,
        "credit_notes_total": credits,
        "net_collected": net_collected,
        "ceiling": STATUTORY_CEILING,
        "remaining": remaining,
        "utilization_rate": utilization_rate,
        "percentage": percentage,
        "threshold_80_exceeded": threshold_80_exceeded,
        "ceiling_exceeded": ceiling_exceeded,
        "consecutive_breach_years": effective_consecutive,
        "radiation_warning": radiation_warning,
        "status": status,
        "status_message": status_message,
    }

