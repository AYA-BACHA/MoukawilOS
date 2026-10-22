import type { Deadline } from "@/types/models";

export interface ExtendedDeadline extends Deadline {
  label: string;
  formCode: "G12" | "G12 bis";
  daysRemaining: number;
}

/**
 * Returns year, month (1-12), and day for a given date in Africa/Algiers timezone.
 */
export function getAlgiersDateParts(d: Date = new Date()): { year: number; month: number; day: number; dateString: string } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(d);
  const year = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const month = parseInt(parts.find((p) => p.type === "month")!.value, 10);
  const day = parseInt(parts.find((p) => p.type === "day")!.value, 10);
  const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, dateString };
}

/**
 * Dynamically computes the nearest upcoming statutory tax deadline under Algerian Auto-Entrepreneur law (CIDTA art. 282 quater).
 *
 * Candidate statutory deadlines:
 * 1. June 30 of current year: Formulaire G12 (Provisional turnover declaration & 50% IFU installment)
 * 2. January 20 of next year: Formulaire G12 bis (Definitive annual IFU regularisation on collected turnover)
 * 3. January 20 of current year: Formulaire G12 bis (if current date is between Jan 1 and Jan 20)
 *
 * @param fromDate Date to compute from (defaults to now in Africa/Algiers)
 */
export function computeNextDeadline(fromDate: Date = new Date(), userId: string = "usr_1"): ExtendedDeadline {
  const { year, month, day } = getAlgiersDateParts(fromDate);

  let targetYear = year;
  let targetMonth = 6;
  let targetDay = 30;
  let formCode: "G12" | "G12 bis" = "G12";
  let label = "G12 Provisional Declaration";
  let description = "Provisional declaration of estimated turnover and optional 50% split installment";

  if (month === 1 && day <= 20) {
    // Before or on January 20 of current year: G12 bis for previous year is due
    targetYear = year;
    targetMonth = 1;
    targetDay = 20;
    formCode = "G12 bis";
    label = "Annual G12 bis Regularisation";
    description = "Definitive annual regularisation of 0.5% IFU tax on collected turnover";
  } else if (month < 6 || (month === 6 && day <= 30)) {
    // Between Jan 21 and June 30 of current year: G12 provisional is due
    targetYear = year;
    targetMonth = 6;
    targetDay = 30;
    formCode = "G12";
    label = "G12 Provisional Declaration";
    description = "Provisional declaration of estimated turnover and optional 50% split installment";
  } else {
    // After June 30 of current year: G12 bis due on January 20 of next year
    targetYear = year + 1;
    targetMonth = 1;
    targetDay = 20;
    formCode = "G12 bis";
    label = "Annual G12 bis Regularisation";
    description = "Definitive annual regularisation of 0.5% IFU tax on collected turnover";
  }

  const dueDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;

  // Calculate days remaining based on UTC date boundaries
  const todayUtc = Date.UTC(year, month - 1, day);
  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const diffMs = targetUtc - todayUtc;
  const daysRemaining = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  return {
    id: `dl_${formCode.toLowerCase().replace(/\s+/g, "_")}_${targetYear}`,
    userId,
    dueDate,
    description,
    label,
    formCode,
    daysRemaining,
  };
}
