"""
Unit Test Suite for MoukawilOS Calculation Engine
12 Verified Baseline Statutory Test Cases covering boundary conditions:
- Impôt Forfaitaire Unique (IFU) minimum floor, rates (0.5% & 5%), and split schedule
- CASNOS social security contributions (flat 24k vs 15% bracket clamps)
- Annual 5M DZD turnover ceiling, 80% preventative warning, and 3-year radiation rule
- Statutory calendar deadlines (G12, G12 bis, CASNOS) and relative status transitions
"""

from datetime import date
from decimal import Decimal
import pytest

from app.calculation.turnover import (
    calculate_turnover_metrics,
    STATUTORY_CEILING,
    PREVENTATIVE_THRESHOLD_AMOUNT,
)
from app.calculation.taxes import (
    calculate_ifu_tax,
    calculate_casnos_contribution,
    simulate_total_obligations,
    STATUTORY_MINIMUM_IFU_FLOOR,
    CASNOS_FLAT_FORFAIT,
    CASNOS_GENERAL_FLOOR,
    CASNOS_GENERAL_CEILING,
)
from app.calculation.calendar import (
    compute_next_statutory_deadline,
    generate_annual_obligations_calendar,
)


def test_01_ifu_minimum_floor_when_low_or_zero_turnover():
    """
    Test Case 1: CIDTA Art. 365 bis statutory minimum floor (10,000 DZD).
    For zero or low turnover, the tax must not drop below 10,000 DZD.
    """
    # 500,000 DZD * 0.005 = 2,500 DZD (< 10,000 DZD) -> Must apply floor
    res_low = calculate_ifu_tax(turnover=Decimal("500000.00"))
    assert res_low["raw_amount"] == Decimal("2500.00")
    assert res_low["final_tax"] == STATUTORY_MINIMUM_IFU_FLOOR
    assert res_low["is_floor_applied"] is True

    # 0 DZD turnover -> Must still apply 10,000 DZD floor
    res_zero = calculate_ifu_tax(turnover=0)
    assert res_zero["raw_amount"] == Decimal("0.00")
    assert res_zero["final_tax"] == Decimal("10000.00")
    assert res_zero["is_floor_applied"] is True


def test_02_ifu_calculated_at_half_percent_above_floor():
    """
    Test Case 2: LF 2024 / CIDTA Art. 282 sexies (0.5% flat IFU rate).
    When raw tax exceeds 10,000 DZD, exact 0.5% is charged.
    """
    # 4,000,000 DZD * 0.005 = 20,000 DZD (> 10,000 DZD)
    res = calculate_ifu_tax(turnover=Decimal("4000000.00"))
    assert res["raw_amount"] == Decimal("20000.00")
    assert res["final_tax"] == Decimal("20000.00")
    assert res["is_floor_applied"] is False


def test_03_ifu_five_percent_regime():
    """
    Test Case 3: Standard IFU regime at 5% rate.
    Verifies support for 5% IFU option (e.g. general regime / standard services).
    """
    # 1,000,000 DZD * 0.05 = 50,000 DZD
    res = calculate_ifu_tax(turnover=Decimal("1000000.00"), rate=Decimal("0.05"))
    assert res["rate"] == Decimal("0.05")
    assert res["raw_amount"] == Decimal("50000.00")
    assert res["final_tax"] == Decimal("50000.00")
    assert res["is_floor_applied"] is False


def test_04_ifu_exact_split_payment_schedule():
    """
    Test Case 4: CIDTA Art. 365 split payment schedule (50% / 25% / 25%).
    Installments must reconcile to the exact cent, even with rounding.
    """
    # Test on an amount with potential rounding fractions
    turnover = Decimal("3752500.00")
    res = calculate_ifu_tax(turnover)
    sched = res["schedule"]

    assert sched["installment_1_june_30"] > 0
    assert sched["installment_2_sept_15"] > 0
    assert sched["installment_3_dec_15"] > 0

    reconciled_sum = (
        sched["installment_1_june_30"]
        + sched["installment_2_sept_15"]
        + sched["installment_3_dec_15"]
    )
    assert reconciled_sum == res["final_tax"]


def test_05_casnos_flat_forfait_option():
    """
    Test Case 5: Décret exécutif n° 26-257 art. 14 (Auto-Entrepreneur flat rate).
    CASNOS forfait is strictly fixed at 24,000 DZD regardless of revenue.
    """
    res_zero = calculate_casnos_contribution(income_base=0, regime="forfait")
    assert res_zero["annual_contribution"] == CASNOS_FLAT_FORFAIT
    assert res_zero["annual_contribution"] == Decimal("24000.00")

    res_high = calculate_casnos_contribution(income_base=4500000, regime="forfait")
    assert res_high["annual_contribution"] == Decimal("24000.00")


def test_06_casnos_general_regime_floor_clamp():
    """
    Test Case 6: Décret 15-289 art. 14 (1x SNMG floor clamp of 43,200 DZD).
    If 15% of declared income is below 43,200 DZD, it is clamped to 43,200 DZD.
    """
    # 200,000 DZD * 0.15 = 30,000 DZD (< 43,200 DZD floor)
    res = calculate_casnos_contribution(income_base=200000, regime="general")
    assert res["annual_contribution"] == CASNOS_GENERAL_FLOOR
    assert res["annual_contribution"] == Decimal("43200.00")
    assert res["is_floor_clamped"] is True
    assert res["is_ceiling_clamped"] is False


def test_07_casnos_general_regime_ceiling_clamp():
    """
    Test Case 7: Décret 15-289 art. 14 (20x SNMG ceiling clamp of 864,000 DZD).
    If 15% of declared income exceeds 864,000 DZD, it is clamped to 864,000 DZD.
    """
    # 7,000,000 DZD * 0.15 = 1,050,000 DZD (> 864,000 DZD ceiling)
    res = calculate_casnos_contribution(income_base=7000000, regime="general")
    assert res["annual_contribution"] == CASNOS_GENERAL_CEILING
    assert res["annual_contribution"] == Decimal("864000.00")
    assert res["is_floor_clamped"] is False
    assert res["is_ceiling_clamped"] is True


def test_08_casnos_general_regime_unbounded_bracket():
    """
    Test Case 8: Décret 15-289 general regime normal bracket (15%).
    Between 43,200 and 864,000 DZD, exact 15% is charged.
    """
    # 2,000,000 DZD * 0.15 = 300,000 DZD (Between 43,200 and 864,000)
    res = calculate_casnos_contribution(income_base=2000000, regime="general")
    assert res["annual_contribution"] == Decimal("300000.00")
    assert res["is_floor_clamped"] is False
    assert res["is_ceiling_clamped"] is False


def test_09_turnover_safe_headroom_and_credit_note_deduction():
    """
    Test Case 9: Loi 22-23 art. 2 & cash-basis credit note deduction.
    Credit notes decrement gross revenue; remaining ceiling is correctly computed.
    """
    # Gross = 3,000,000 DZD, Credit Notes = 500,000 DZD -> Net = 2,500,000 DZD
    res = calculate_turnover_metrics(
        collected_revenue=Decimal("3000000.00"),
        credit_notes_total=Decimal("500000.00"),
    )
    assert res["net_collected"] == Decimal("2500000.00")
    assert res["ceiling"] == STATUTORY_CEILING
    assert res["remaining"] == Decimal("2500000.00")
    assert res["percentage"] == Decimal("50.00")
    assert res["threshold_80_exceeded"] is False
    assert res["ceiling_exceeded"] is False
    assert res["status"] == "normal"


def test_10_turnover_80_percent_alert_exact_boundary():
    """
    Test Case 10: 80% Preventative Alert boundary condition.
    Exactly 4,000,000.00 DZD triggers the warning; 3,999,999.99 DZD does not.
    """
    # Boundary: 1 cent below 80%
    below_boundary = calculate_turnover_metrics(collected_revenue=Decimal("3999999.99"))
    assert below_boundary["threshold_80_exceeded"] is False
    assert below_boundary["status"] == "normal"

    # Boundary: Exactly 80% (4,000,000.00 DZD)
    at_boundary = calculate_turnover_metrics(collected_revenue=PREVENTATIVE_THRESHOLD_AMOUNT)
    assert at_boundary["threshold_80_exceeded"] is True
    assert at_boundary["ceiling_exceeded"] is False
    assert at_boundary["percentage"] == Decimal("80.00")
    assert at_boundary["status"] == "warning_80"


def test_11_turnover_ceiling_exceeded_and_consecutive_years_radiation():
    """
    Test Case 11: Loi 22-23 Articles 13 & 14 (3 Consecutive Years Radiation Rule).
    Exceeding 5M in 1 or 2 years does not trigger radiation; year 3 triggers radiation.
    """
    # Year 1 exceedance (5,200,000 DZD)
    y1 = calculate_turnover_metrics(collected_revenue=5200000, consecutive_breach_years=0)
    assert y1["ceiling_exceeded"] is True
    assert y1["consecutive_breach_years"] == 1
    assert y1["radiation_warning"] is False
    assert y1["status"] == "exceeded"

    # Year 2 exceedance
    y2 = calculate_turnover_metrics(collected_revenue=5200000, consecutive_breach_years=1)
    assert y2["consecutive_breach_years"] == 2
    assert y2["radiation_warning"] is False
    assert y2["status"] == "exceeded"

    # Year 3 exceedance -> Mandatory radiation trigger
    y3 = calculate_turnover_metrics(collected_revenue=5200000, consecutive_breach_years=2)
    assert y3["consecutive_breach_years"] == 3
    assert y3["radiation_warning"] is True
    assert y3["status"] == "radiation_risk"


def test_12_statutory_calendar_date_boundaries_and_status():
    """
    Test Case 12: CIDTA Art. 282 quater statutory deadline boundaries.
    Correctly shifts between G12 (June 30) and G12 bis (Jan 20) in Africa/Algiers timezone.
    """
    # 1. Before June 30 (e.g. 2026-04-15) -> Next is June 30 G12
    dl_spring = compute_next_statutory_deadline(from_date=date(2026, 4, 15))
    assert dl_spring["form_code"] == "G12"
    assert dl_spring["due_date"] == "2026-06-30"
    assert dl_spring["days_remaining"] == 76

    # 2. On June 30 -> days_remaining is 0
    dl_june30 = compute_next_statutory_deadline(from_date=date(2026, 6, 30))
    assert dl_june30["due_date"] == "2026-06-30"
    assert dl_june30["days_remaining"] == 0

    # 3. Day after June 30 (July 1) -> Shifts to January 20 G12 bis of year N+1
    dl_july1 = compute_next_statutory_deadline(from_date=date(2026, 7, 1))
    assert dl_july1["form_code"] == "G12 bis"
    assert dl_july1["due_date"] == "2027-01-20"

    # 4. Early January (Jan 10, 2027) -> Due on Jan 20, 2027
    dl_jan10 = compute_next_statutory_deadline(from_date=date(2027, 1, 10))
    assert dl_jan10["form_code"] == "G12 bis"
    assert dl_jan10["due_date"] == "2027-01-20"
    assert dl_jan10["days_remaining"] == 10

    # 5. Annual obligations calendar status generation
    cal = generate_annual_obligations_calendar(
        fiscal_year=2026,
        reference_date=date(2026, 6, 15),
        completed_codes=["CASNOS_ANNUAL"],
    )
    statuses = {item["code"]: item["status"] for item in cal}
    assert statuses["CASNOS_ANNUAL"] == "completed"
    assert statuses["G12_PROVISIONAL"] == "due_soon"  # 15 days before June 30
    assert statuses["G12_BIS_REGULARISATION"] == "pending"  # Over 30 days before Jan 2027

