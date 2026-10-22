import db from "@/data/db.json";
import { computeNextDeadline, type ExtendedDeadline } from "@/lib/deadline";
import { supabase } from "@/lib/supabase";
import type {
  AssistantMessage,
  Client,
  ClientInput,
  ClientType,
  InvoiceDraft,
  InvoiceStatus,
  InvoiceWithClient,
  Statute,
  User,
  UserSettings,
} from "@/types/models";

const CURRENT_USER_ID = "usr_1";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Lookups {
  client_types: string[];
  languages: string[];
  themes: string[];
  invoice_statuses: string[];
  invoice_event_types: string[];
  payment_rails: { value: string; label: string }[];
}

interface BackendClientOut {
  id: number;
  client_type: string;
  name: string;
  address: string;
  country: string;
  rc: string | null;
  nif: string | null;
  nis: string | null;
  email: string | null;
  phone: string | null;
  archived_at: string | null;
  created_at: string;
}

interface BackendItemOut {
  id: number;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  line_total: number;
}

interface BackendInvoiceOut {
  id: number;
  client_id: number;
  client_name: string;
  status: string;
  number: string | null;
  sequence_number: number | null;
  number_year: number | null;
  issue_date: string | null;
  due_date: string | null;
  currency: string;
  total: number;
  paid_at: string | null;
  payment_rail: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  note: string | null;
  created_at: string;
  items: BackendItemOut[];
  snapshot?: {
    seller_name: string;
    client_type: string;
    client_name: string;
    client_address: string;
    client_rc: string | null;
    client_nif: string | null;
    client_nis: string | null;
  };
}

async function getAuthHeader(): Promise<Record<string, string>> {
  let token = process.env.NEXT_PUBLIC_DEV_AUTH_TOKEN || "demo";
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("moukawil_token");
    if (local) {
      token = local;
    } else {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          token = data.session.access_token;
        }
      } catch {
        // use fallback token
      }
    }
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function fetchBackend<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const headers = await getAuthHeader();
    const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  const res = await fetchBackend<{ status: string }>("/health");
  return res?.status === "ok";
}

const ownClients = () => (db.clients as Client[]).filter((client) => client.userId === CURRENT_USER_ID);

export async function getCurrentUser(): Promise<User> {
  const fallbackUser = db.users.find((item) => item.id === CURRENT_USER_ID) || (db.users[0] as unknown as User);

  const [profileData, preferencesData] = await Promise.all([
    fetchBackend<{
      profile: {
        first_name?: string | null;
        last_name?: string | null;
        address?: string | null;
        trade_address?: string | null;
        phone?: string | null;
        nif?: string | null;
        ai_number?: string | null;
        rib?: string | null;
        anae_card_number?: string | null;
        anae_card_issue_date?: string | null;
        activity_start_date?: string | null;
      };
      completeness?: {
        percent: number;
        can_issue_invoices: boolean;
      };
      next_invoice_number?: string | null;
    }>("/profile"),
    fetchBackend<{
      language?: string;
      theme?: string;
      default_payment_rail?: string;
      default_payment_terms_days?: number;
      append_exemption_clause?: boolean;
    }>("/preferences"),
  ]);

  if (!profileData || !profileData.profile) {
    return fallbackUser;
  }

  const p = profileData.profile;
  const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || fallbackUser.fullName;
  const nextNum = profileData.next_invoice_number
    ? parseInt(profileData.next_invoice_number.split("-").pop() || "1", 10)
    : fallbackUser.nextInvoiceNumber;

  return {
    ...fallbackUser,
    fullName,
    firstName: p.first_name || fallbackUser.firstName,
    displayName: p.first_name || fallbackUser.displayName,
    registration: p.anae_card_number || fallbackUser.registration,
    nif: p.nif || fallbackUser.nif,
    phone: p.phone || fallbackUser.phone,
    address: p.trade_address || p.address || fallbackUser.address,
    nextInvoiceNumber: isNaN(nextNum) ? fallbackUser.nextInvoiceNumber : nextNum,
    paymentTermsDays: preferencesData?.default_payment_terms_days ?? fallbackUser.paymentTermsDays,
    appendExemptionClause: preferencesData?.append_exemption_clause ?? fallbackUser.appendExemptionClause,
  };
}

export async function updateUserSettings(settings: UserSettings): Promise<User> {
  await Promise.all([
    fetchBackend("/profile", {
      method: "PATCH",
      body: JSON.stringify({
        phone: settings.phone,
        address: settings.address,
        trade_address: settings.address,
      }),
    }),
    fetchBackend("/preferences", {
      method: "PATCH",
      body: JSON.stringify({
        default_payment_terms_days: settings.paymentTermsDays,
        append_exemption_clause: settings.appendExemptionClause,
      }),
    }),
  ]);

  const current = await getCurrentUser();
  return { ...current, ...settings };
}

export async function getClients(): Promise<Client[]> {
  const res = await fetchBackend<{ items: BackendClientOut[]; total: number }>("/clients?limit=100");
  if (res && res.items && res.items.length > 0) {
    return res.items.map((item) => ({
      id: String(item.id),
      userId: CURRENT_USER_ID,
      name: item.name,
      type: (item.client_type === "B2C" ? "B2C" : "B2B") as ClientType,
      nif: item.nif,
      nis: item.nis,
      rc: item.rc,
      address: item.address,
      location: item.address || "",
      description: null,
      email: item.email,
      phone: item.phone,
      anaeVerified: Boolean(item.nif && item.nif.length === 15),
    }));
  }

  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem("moukawil_clients");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return ownClients();
}

export async function createClient(input: ClientInput): Promise<Client> {
  const payload: Record<string, unknown> = {
    client_type: input.type,
    name: input.name,
    address: input.address || "Alger, Algérie",
    email: input.email || null,
    phone: input.phone || null,
  };
  if (input.type === "B2B") {
    payload.rc = input.rc || null;
    payload.nif = input.nif || null;
    payload.nis = input.nis || null;
  }

  const backendCreated = await fetchBackend<BackendClientOut>("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  let created: Client;
  if (backendCreated && backendCreated.id) {
    created = {
      id: String(backendCreated.id),
      userId: CURRENT_USER_ID,
      name: backendCreated.name,
      type: (backendCreated.client_type === "B2C" ? "B2C" : "B2B") as ClientType,
      nif: backendCreated.nif,
      nis: backendCreated.nis,
      rc: backendCreated.rc,
      address: backendCreated.address,
      location: backendCreated.address || "",
      description: null,
      email: backendCreated.email,
      phone: backendCreated.phone,
      anaeVerified: Boolean(backendCreated.nif && backendCreated.nif.length === 15),
    };
  } else {
    created = {
      ...input,
      id: `cli_${Date.now()}`,
      userId: CURRENT_USER_ID,
      description: null,
      location: input.address ?? "",
      anaeVerified: Boolean(input.nif && input.nif.length === 15),
    };
  }

  if (typeof window !== "undefined") {
    try {
      const existing = await getClients();
      const updated = [created, ...existing.filter((c) => c.id !== created.id)];
      localStorage.setItem("moukawil_clients", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return created;
}

export async function updateClient(client: Client, input: ClientInput): Promise<Client> {
  const payload: Record<string, unknown> = {
    client_type: input.type,
    name: input.name,
    address: input.address || client.address || "Alger, Algérie",
    email: input.email || null,
    phone: input.phone || null,
  };
  if (input.type === "B2B") {
    payload.rc = input.rc || null;
    payload.nif = input.nif || null;
    payload.nis = input.nis || null;
  }

  let updatedClient: Client = {
    ...client,
    ...input,
    location: input.address ?? client.location,
    anaeVerified: Boolean(input.nif && input.nif.length === 15),
  };

  if (!client.id.startsWith("cli_")) {
    const backendUpdated = await fetchBackend<BackendClientOut>(`/clients/${client.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (backendUpdated) {
      updatedClient = {
        ...updatedClient,
        name: backendUpdated.name,
        type: (backendUpdated.client_type === "B2C" ? "B2C" : "B2B") as ClientType,
        nif: backendUpdated.nif,
        nis: backendUpdated.nis,
        rc: backendUpdated.rc,
        address: backendUpdated.address,
        location: backendUpdated.address || "",
      };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const existing = await getClients();
      const nextList = existing.map((c) => (c.id === client.id ? updatedClient : c));
      localStorage.setItem("moukawil_clients", JSON.stringify(nextList));
    } catch {
      // ignore
    }
  }

  return updatedClient;
}

export async function getInvoices(): Promise<InvoiceWithClient[]> {
  const clients = await getClients();
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const res = await fetchBackend<{ items: BackendInvoiceOut[]; total: number }>("/invoices?limit=100");

  if (res && res.items && res.items.length > 0) {
    return res.items
      .filter((inv) => inv.status !== "cancelled")
      .map((item) => {
        const status: InvoiceStatus =
          item.status === "paid" ? "paid" : item.status === "draft" ? "draft" : "pending";

        const client: Client = clientMap.get(String(item.client_id)) || {
          id: String(item.client_id),
          userId: CURRENT_USER_ID,
          name: item.client_name || "Client",
          type: (item.snapshot?.client_type === "B2C" ? "B2C" : "B2B") as ClientType,
          nif: item.snapshot?.client_nif || null,
          nis: item.snapshot?.client_nis || null,
          rc: item.snapshot?.client_rc || null,
          address: item.snapshot?.client_address || null,
          location: item.snapshot?.client_address || "",
          description: null,
          email: null,
          phone: null,
          anaeVerified: Boolean(item.snapshot?.client_nif && item.snapshot.client_nif.length === 15),
        };

        const num =
          item.number ||
          (item.sequence_number
            ? `FAC-${item.number_year || 2026}-${String(item.sequence_number).padStart(3, "0")}`
            : "BROUILLON");

        return {
          id: String(item.id),
          userId: CURRENT_USER_ID,
          clientId: String(item.client_id),
          number: num,
          issueDate: item.issue_date || item.created_at.slice(0, 10),
          dueDate: item.due_date || item.issue_date || item.created_at.slice(0, 10),
          amount: Number(item.total || 0),
          status,
          statutoryClause: "TVA non applicable - Art. 13 de la LFR 2023",
          paidAt: item.paid_at,
          paymentRail: item.payment_rail,
          client,
        };
      })
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }

  let baseInvoices = (db.invoices as InvoiceWithClient[])
    .filter((invoice) => invoice.userId === CURRENT_USER_ID && clientMap.has(invoice.clientId))
    .map((invoice) => ({ ...invoice, client: clientMap.get(invoice.clientId)! }));

  if (typeof window !== "undefined") {
    try {
      const storedPayments = localStorage.getItem("moukawil_paid_invoices");
      if (storedPayments) {
        const paymentsMap: Record<string, { paidAt: string; paymentRail: string }> = JSON.parse(storedPayments);
        baseInvoices = baseInvoices.map((inv) =>
          paymentsMap[inv.id]
            ? { ...inv, status: "paid", paidAt: paymentsMap[inv.id].paidAt, paymentRail: paymentsMap[inv.id].paymentRail }
            : inv,
        );
      }
    } catch {
      // ignore
    }
  }

  return baseInvoices.sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}

export async function payInvoiceApi(
  invoiceId: string,
  settlementDate: string,
  rail: string,
): Promise<{ success: boolean; invoiceId: string }> {
  if (/^\d+$/.test(invoiceId)) {
    await fetchBackend(`/invoices/${invoiceId}/pay`, {
      method: "POST",
      body: JSON.stringify({
        paid_at: settlementDate,
        payment_rail: rail,
      }),
    });
  }

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("moukawil_paid_invoices") || "{}");
      existing[invoiceId] = { paidAt: settlementDate, paymentRail: rail };
      localStorage.setItem("moukawil_paid_invoices", JSON.stringify(existing));
    } catch {
      // ignore
    }
  }

  return { success: true, invoiceId };
}

export async function issueInvoiceApi(draft: InvoiceDraft): Promise<{ success: boolean; invoiceNumber?: string }> {
  let clientId: number | null = null;
  const clients = await getClients();
  const matchedClient = clients.find((c) => c.name.toLowerCase() === draft.client.name.toLowerCase());

  if (matchedClient && /^\d+$/.test(matchedClient.id)) {
    clientId = parseInt(matchedClient.id, 10);
  } else {
    const created = await createClient({
      name: draft.client.name,
      type: draft.clientType,
      nif: draft.client.nif || null,
      nis: draft.client.nis || null,
      rc: draft.client.rc || null,
      address: draft.client.address || "Alger",
      email: null,
      phone: null,
    });
    if (/^\d+$/.test(created.id)) {
      clientId = parseInt(created.id, 10);
    }
  }

  if (clientId) {
    const items = draft.items.map((it) => ({
      description: it.description || "Prestation de service",
      quantity: it.quantity,
      unit_price: it.unitPrice,
      unit: "unité",
    }));

    const newInv = await fetchBackend<BackendInvoiceOut>("/invoices", {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        due_date: new Date(Date.now() + draft.paymentTermsDays * 86400000).toISOString().slice(0, 10),
        items,
      }),
    });

    if (newInv && newInv.id) {
      const issued = await fetchBackend<BackendInvoiceOut>(`/invoices/${newInv.id}/issue`, {
        method: "POST",
      });
      if (issued && issued.number) {
        return { success: true, invoiceNumber: issued.number };
      }
    }
  }

  return { success: true, invoiceNumber: draft.number };
}

export async function getLookups(): Promise<Lookups> {
  const backend = await fetchBackend<Lookups>("/lookups");
  if (backend) return backend;

  return {
    client_types: ["B2B", "B2C"],
    languages: ["fr", "ar"],
    themes: ["light", "dark", "system"],
    invoice_statuses: ["draft", "issued", "paid", "cancelled"],
    invoice_event_types: ["issued", "paid", "unpaid", "cancelled"],
    payment_rails: [
      { value: "bank_transfer", label: "Virement bancaire" },
      { value: "cash", label: "Espèces (Cash)" },
      { value: "cheque", label: "Chèque bancaire" },
      { value: "ccp", label: "Virement postal CCP" },
      { value: "card", label: "Carte bancaire (CIB / EDAHABIA)" },
    ],
  };
}

export async function getNextDeadline(): Promise<ExtendedDeadline> {
  return computeNextDeadline(new Date(), CURRENT_USER_ID);
}

export async function getInvoiceDraft(clientId?: string): Promise<InvoiceDraft> {
  const stored = (db.invoiceDrafts as InvoiceDraft[]).find((item) => item.userId === CURRENT_USER_ID);
  const lastNumber = Math.max(
    0,
    ...db.invoices
      .filter((invoice) => invoice.userId === CURRENT_USER_ID)
      .map((invoice) => Number(invoice.number.split("-")[1])),
  );
  const draft: InvoiceDraft = stored ?? {
    id: "new",
    userId: CURRENT_USER_ID,
    number: `${new Date().getFullYear()}-${String(lastNumber + 1).padStart(4, "0")}`,
    clientType: "B2B",
    client: { name: "", nif: "", nis: "", rc: "", address: "" },
    issueDate: new Date().toISOString().slice(0, 10),
    paymentTermsDays: 30,
    items: [{ id: "itm_new", description: "", details: null, quantity: 1, unitPrice: 0 }],
    savedAt: null,
  };
  const client = ownClients().find((item) => item.id === clientId);
  if (!client) return draft;
  return {
    ...draft,
    clientType: client.type,
    client: {
      name: client.name,
      nif: client.nif ?? "",
      nis: client.nis ?? "",
      rc: client.rc ?? "",
      address: client.address ?? "",
    },
  };
}

export async function getStatutes(): Promise<Statute[]> {
  return db.statutes;
}

export async function getAssistantMessages(): Promise<AssistantMessage[]> {
  return (db.assistantMessages as AssistantMessage[]).filter((message) => message.userId === CURRENT_USER_ID);
}

export async function askAssistant(question: string): Promise<AssistantMessage> {
  const text = question.toLowerCase();
  const matches = db.statutes
    .map((statute) => ({
      statute,
      score: statute.keywords.filter((keyword) => text.includes(keyword)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ statute }) => statute);

  const content = matches.length
    ? matches.map((statute) => `${statute.code}: ${statute.summary}`).join("\n\n")
    : "I can only answer questions grounded in the auto-entrepreneur regulations listed in the reference vault, such as the turnover ceiling, cash-basis recognition, VAT exemption, the IFU rate or the G12 bis declaration. Try rephrasing around one of them.";

  return {
    id: `msg_${Date.now()}`,
    userId: CURRENT_USER_ID,
    role: "assistant",
    content,
    citations: matches.map((statute) => statute.id),
    createdAt: new Date().toISOString(),
  };
}
