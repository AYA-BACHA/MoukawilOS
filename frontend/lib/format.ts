const amount = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const formatWhole = (value: number) => whole.format(value);
export const formatAmount = (value: number) => amount.format(value);
export const formatDate = (iso: string) => shortDate.format(new Date(iso));
export const formatLongDate = (iso: string) => longDate.format(new Date(iso));
export const clientDetail = (client: { nif: string | null; description: string | null }) => (client.nif ? `NIF: ${client.nif}` : (client.description ?? ""));
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
