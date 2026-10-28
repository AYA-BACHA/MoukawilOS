export type InvoiceStatus = "pending" | "paid" | "draft" | "credited" | "cancelled";
export type ClientType = "B2B" | "B2C";

export interface User {
  id: string;
  firstName: string;
  displayName: string;
  registration: string;
  fullName: string;
  profession: string;
  activity: string;
  nif: string;
  city: string;
  phone: string;
  ceiling: number;
  ifuRate: number;
  email: string;
  address: string;
  wilaya: string;
  postalCode: string;
  nis: string;
  statutoryActivity: string;
  activityCode: string;
  registeredAt: string;
  cardValidUntil: string;
  fiscalAuthority: string;
  casnosVerifiedYear: number;
  certificateValidUntil: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  paymentTermsDays: number;
  appendExemptionClause: boolean;
  exemptionClause: string;
}

export type UserSettings = Pick<
  User,
  "email" | "phone" | "address" | "city" | "wilaya" | "postalCode" | "invoicePrefix" | "nextInvoiceNumber" | "paymentTermsDays" | "appendExemptionClause" | "exemptionClause"
>;

export interface Client {
  id: string;
  userId: string;
  name: string;
  type: ClientType;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  address: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  location: string;
  anaeVerified: boolean;
}

export type ClientInput = Pick<Client, "name" | "type" | "nif" | "nis" | "rc" | "email" | "phone" | "address">;

export interface CreditNoteDetail {
  id: string;
  credit_note_number: string;
  amount: number;
  reason: string;
  issue_date: string;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  number: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  statutoryClause: string;
  paidAt: string | null;
  paymentRail: string | null;
  creditNoteNumber?: string | null;
  creditedAmount?: number | null;
  creditNotes?: CreditNoteDetail[];
}

export interface Deadline {
  id: string;
  userId: string;
  dueDate: string;
  description: string;
}

export interface InvoiceWithClient extends Invoice {
  client: Client;
}

export interface TurnoverStats {
  ceiling: number;
  collected: number;
  pending: number;
  remaining: number;
  utilization: number;
  totalInvoiced: number;
  counts: Record<InvoiceStatus | "all", number>;
}

export interface PaymentConfirmation {
  invoiceId: string;
  settlementDate: string;
  rail: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  details: string | null;
  quantity: number;
  unitPrice: number;
}

export interface DraftClient {
  name: string;
  nif: string;
  nis: string;
  rc: string;
  address: string;
}

export interface InvoiceDraft {
  id: string;
  userId: string;
  number: string;
  clientType: ClientType;
  client: DraftClient;
  issueDate: string;
  paymentTermsDays: number;
  items: InvoiceItem[];
  savedAt: string | null;
}

export interface Statute {
  id: string;
  code: string;
  title: string;
  keywords: string[];
  summary: string;
  official_url?: string;
  gazette_ref?: string;
  excerpt_fr?: string;
  excerpt_ar?: string;
}

export interface AssistantMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  citations: string[];
  createdAt: string;
}

export interface BackendDashboardSummary {
  year: number;
  collected_da: number;
  ceiling_da: number | null;
  percent_of_ceiling: number | null;
  remaining_da: number | null;
  over_ceiling: boolean;
  ifu_estimate_da: number | null;
  casnos_flat_da: number | null;
  total_estimate_da: number | null;
  missing_rules: string[];
  sources: Record<string, string>;
  note: string;
  ifu_rate_percent: number | null;
  ifu_minimum_da: number | null;
  ceiling_level?: "ok" | "warning" | "high" | "exceeded" | null;
  pending_da: number;
  invoice_counts: Record<string, number>;
}

export interface BackendComplianceAlert {
  id: string;
  kind: "deadline" | "ceiling";
  code: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "overdue" | "critical";
  due_date: string | null;
  days_left: number | null;
  period_year: number;
  amount_da: number | null;
  verified: boolean;
}

export interface BackendSimulationResult {
  annual_turnover: number;
  ifu: {
    rate: number;
    raw_amount: number;
    statutory_floor: number;
    final_tax: number;
    schedule: {
      installment_1_june_30: number;
      installment_2_sept_15: number;
      installment_3_dec_15: number;
    };
  };
  casnos: {
    regime: string;
    annual_contribution: number;
    deadline: string;
  };
  total_statutory_charges: number;
  net_income_after_charges: number;
  effective_charge_rate_pct: number;
  ceiling_status: {
    limit: number;
    percentage: number;
    is_exceeded: boolean;
    warning?: string | null;
  };
}

