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
