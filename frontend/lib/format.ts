export function createFormatters(locale: string) {
  const amount = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const whole = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const shortDate = new Intl.DateTimeFormat(locale, { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
  const longDate = new Intl.DateTimeFormat(locale, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

  return {
    formatAmount: (value: number) => amount.format(value),
    formatWhole: (value: number) => whole.format(value),
    formatDate: (iso: string) => shortDate.format(new Date(iso)),
    formatLongDate: (iso: string) => longDate.format(new Date(iso)),
  };
}

// English formatters for non-React code (e.g. CSV export).
export const { formatAmount, formatWhole, formatDate, formatLongDate } = createFormatters("en-US");

export const clientDetail = (client: { nif: string | null; description: string | null }) => (client.nif ? `NIF: ${client.nif}` : (client.description ?? ""));
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
