"""
Statutory Calendar and Obligations Engine
Algerian Auto-Entrepreneur Deadlines (CIDTA Art. 282 quater, Décret 26-257, Décret 23-196)
"""

from datetime import date, datetime
from typing import Any, Dict, List, Optional
from zoneinfo import ZoneInfo

ALGIERS_TZ = ZoneInfo("Africa/Algiers")


def get_current_algiers_date() -> date:
    """Returns today's date in Africa/Algiers timezone."""
    return datetime.now(ALGIERS_TZ).date()


def compute_next_statutory_deadline(from_date: Optional[date] = None) -> Dict[str, Any]:
    """
    Dynamically computes the nearest upcoming statutory tax filing deadline
    under Algerian Auto-Entrepreneur legislation (CIDTA art. 282 quater).

    Calendar Rules:
    1. Jan 1 – Jan 20: G12 bis for preceding year is due on January 20.
    2. Jan 21 – June 30: G12 provisional declaration is due on June 30.
    3. July 1 – Dec 31: G12 bis regularisation is due on January 20 of year N+1.
    """
    if from_date is None:
        from_date = get_current_algiers_date()

    year = from_date.year
    month = from_date.month
    day = from_date.day

    if month == 1 and day <= 20:
        target_year = year
        target_month = 1
        target_day = 20
        form_code = "G12 bis"
        label = "Annual G12 bis Regularisation"
        description = "Definitive annual regularisation of 0.5% IFU tax on collected turnover"
    elif month < 6 or (month == 6 and day <= 30):
        target_year = year
        target_month = 6
        target_day = 30
        form_code = "G12"
        label = "G12 Provisional Declaration"
        description = "Provisional declaration of estimated turnover and optional 50% split installment"
    else:
        target_year = year + 1
        target_month = 1
        target_day = 20
        form_code = "G12 bis"
        label = "Annual G12 bis Regularisation"
        description = "Definitive annual regularisation of 0.5% IFU tax on collected turnover"

    due_date = date(target_year, target_month, target_day)
    days_remaining = (due_date - from_date).days

    return {
        "id": f"dl_{form_code.lower().replace(' ', '_')}_{target_year}",
        "form_code": form_code,
        "label": label,
        "description": description,
        "due_date": due_date.isoformat(),
        "days_remaining": max(0, days_remaining),
        "target_year": target_year,
    }


def generate_annual_obligations_calendar(
    fiscal_year: int,
    reference_date: Optional[date] = None,
    completed_codes: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Generates all statutory fiscal and social security obligations for a specific fiscal year.
    Statuses:
      - 'completed': if included in completed_codes
      - 'overdue': reference_date > due_date and not completed
      - 'due_soon': 0 <= days_remaining <= 30 and not completed
      - 'pending': days_remaining > 30 and not completed
    """
    if reference_date is None:
        reference_date = get_current_algiers_date()

    completed = set(completed_codes or [])

    obligations = [
        {
            "code": "G12_PROVISIONAL",
            "form_code": "G12",
            "title": "G12 Provisional Turnover Declaration",
            "statutory_reference": "CIDTA Art. 282 quater",
            "due_date": date(fiscal_year, 6, 30),
            "description": "Provisional estimated turnover declaration and optional 50% split installment",
        },
        {
            "code": "CASNOS_ANNUAL",
            "form_code": "CASNOS",
            "title": "CASNOS Social Security Contribution",
            "statutory_reference": "Décret exécutif n° 26-257 art. 14",
            "due_date": date(fiscal_year, 6, 30),
            "description": "Annual 24,000 DZD flat social security contribution for auto-entrepreneur coverage",
        },
        {
            "code": "G12_BIS_REGULARISATION",
            "form_code": "G12 bis",
            "title": "Annual G12 bis Regularisation",
            "statutory_reference": "CIDTA Art. 282 quater & Art. 282 sexies",
            "due_date": date(fiscal_year + 1, 1, 20),
            "description": "Definitive annual regularisation of 0.5% IFU tax on actual collected turnover",
        },
    ]

    results = []
    for ob in obligations:
        code = ob["code"]
        due = ob["due_date"]
        delta = (due - reference_date).days

        if code in completed:
            status = "completed"
        elif delta < 0:
            status = "overdue"
        elif 0 <= delta <= 30:
            status = "due_soon"
        else:
            status = "pending"

        results.append({
            "code": code,
            "form_code": ob["form_code"],
            "title": ob["title"],
            "statutory_reference": ob["statutory_reference"],
            "due_date": due.isoformat(),
            "days_remaining": max(0, delta) if status != "completed" else 0,
            "status": status,
            "description": ob["description"],
        })

    return results

