"""
Deterministic Tax and Social Security Calculation Engine
Algerian Auto-Entrepreneur Tax Regime (LF 2024 / CIDTA Art. 282 sexies & 365 bis)
CASNOS Social Security Contributions (Décret 26-257 & Décret 15-289)
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, Literal, Union

# Statutory IFU Constants
AUTO_ENTREPRENEUR_IFU_RATE = Decimal("0.005")  # Flat 0.5% rate under LF 2024 / CIDTA Art. 282 sexies
STANDARD_IFU_RATE = Decimal("0.05")           # 5% rate under standard general IFU regime
STATUTORY_MINIMUM_IFU_FLOOR = Decimal("10000.00")  # Minimum 10,000 DZD floor per year (CIDTA Art. 365 bis)

# Statutory CASNOS Constants
CASNOS_FLAT_FORFAIT = Decimal("24000.00")  # Auto-Entrepreneur flat rate (Décret 26-257 art. 14)
CASNOS_GENERAL_RATE = Decimal("0.15")      # 15% rate on declared income (Décret 15-289)
CASNOS_GENERAL_FLOOR = Decimal("43200.00") # 1x SNMG floor (Décret 15-289 art. 14)
CASNOS_GENERAL_CEILING = Decimal("864000.00")  # 20x SNMG ceiling (Décret 15-289 art. 14)


def to_decimal(val: Union[Decimal, float, int, str, None]) -> Decimal:
    if val is None:
        return Decimal("0.00")
    if isinstance(val, Decimal):
        return val
    return Decimal(str(val))


def calculate_ifu_tax(
    turnover: Union[Decimal, float, int, str],
    rate: Union[Decimal, float, int, str] = AUTO_ENTREPRENEUR_IFU_RATE,
) -> Dict[str, Any]:
    """
    Calculates the Impôt Forfaitaire Unique (IFU) according to Algerian tax law.

    Formula:
        Raw Tax = turnover * rate
        Final Tax = max(10,000 DZD, Raw Tax)
        (CIDTA Art. 282 sexies and 365 bis)

    Optional Split Schedule (CIDTA Art. 365):
        - Installment 1 (June 30): 50%
        - Installment 2 (Sept 1–15): 25%
        - Installment 3 (Dec 1–15): 25%
    """
    t_dec = to_decimal(turnover)
    r_dec = to_decimal(rate)

    if t_dec < Decimal("0.00"):
        raise ValueError("Turnover cannot be negative")
    if r_dec <= Decimal("0.00"):
        raise ValueError("IFU tax rate must be strictly positive")

    raw_tax = (t_dec * r_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    final_tax = max(STATUTORY_MINIMUM_IFU_FLOOR, raw_tax)
    is_floor_applied = raw_tax < STATUTORY_MINIMUM_IFU_FLOOR

    # Split Schedule (CIDTA art. 365)
    installment_1 = (final_tax * Decimal("0.50")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    installment_2 = (final_tax * Decimal("0.25")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    installment_3 = final_tax - installment_1 - installment_2  # Guarantees exact reconciliation

    return {
        "turnover": t_dec,
        "rate": r_dec,
        "raw_amount": raw_tax,
        "statutory_floor": STATUTORY_MINIMUM_IFU_FLOOR,
        "final_tax": final_tax,
        "is_floor_applied": is_floor_applied,
        "schedule": {
            "installment_1_june_30": installment_1,
            "installment_2_sept_15": installment_2,
            "installment_3_dec_15": installment_3,
        },
    }


def calculate_casnos_contribution(
    income_base: Union[Decimal, float, int, str],
    regime: Literal["forfait", "general"] = "forfait",
) -> Dict[str, Any]:
    """
    Calculates CASNOS social security contributions under Algerian law.

    Regimes:
        - 'forfait': Fixed 24,000 DZD/year for registered auto-entrepreneurs (Décret exécutif 26-257).
        - 'general': 15% of declared income, bounded between floor of 43,200 DZD and ceiling of 864,000 DZD (Décret 15-289).
    """
    inc_dec = to_decimal(income_base)
    if inc_dec < Decimal("0.00"):
        raise ValueError("Income base cannot be negative")

    if regime == "forfait":
        contribution = CASNOS_FLAT_FORFAIT
        is_floor_clamped = False
        is_ceiling_clamped = False
    elif regime == "general":
        raw_contrib = (inc_dec * CASNOS_GENERAL_RATE).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if raw_contrib < CASNOS_GENERAL_FLOOR:
            contribution = CASNOS_GENERAL_FLOOR
            is_floor_clamped = True
            is_ceiling_clamped = False
        elif raw_contrib > CASNOS_GENERAL_CEILING:
            contribution = CASNOS_GENERAL_CEILING
            is_floor_clamped = False
            is_ceiling_clamped = True
        else:
            contribution = raw_contrib
            is_floor_clamped = False
            is_ceiling_clamped = False
    else:
        raise ValueError(f"Unknown CASNOS regime '{regime}'. Must be 'forfait' or 'general'")

    return {
        "regime": regime,
        "income_base": inc_dec,
        "annual_contribution": contribution,
        "is_floor_clamped": is_floor_clamped,
        "is_ceiling_clamped": is_ceiling_clamped,
        "statutory_deadline": "June 30",
    }


def simulate_total_obligations(
    turnover: Union[Decimal, float, int, str],
    casnos_regime: Literal["forfait", "general"] = "forfait",
    ifu_rate: Union[Decimal, float, int, str] = AUTO_ENTREPRENEUR_IFU_RATE,
) -> Dict[str, Any]:
    """
    Deterministic simulator computing the complete statutory tax and social security
    obligations for any given gross or net turnover figure.
    """
    t_dec = to_decimal(turnover)
    ifu_result = calculate_ifu_tax(t_dec, rate=ifu_rate)
    casnos_result = calculate_casnos_contribution(t_dec, regime=casnos_regime)

    total_charges = ifu_result["final_tax"] + casnos_result["annual_contribution"]
    net_income = max(Decimal("0.00"), t_dec - total_charges)

    if t_dec > Decimal("0.00"):
        effective_rate = ((total_charges / t_dec) * Decimal("100.00")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
    else:
        effective_rate = Decimal("0.00")

    return {
        "annual_turnover": t_dec,
        "ifu": ifu_result,
        "casnos": casnos_result,
        "total_statutory_charges": total_charges,
        "net_income_after_charges": net_income,
        "effective_charge_rate_pct": effective_rate,
    }

