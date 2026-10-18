import db from "@/data/db.json";
import type {
  AssistantMessage,
  Client,
  ClientInput,
  Deadline,
  InvoiceDraft,
  InvoiceWithClient,
  Statute,
  User,
  UserSettings,
} from "@/types/models";

const CURRENT_USER_ID = "usr_1";

const ownClients = () => (db.clients as Client[]).filter((client) => client.userId === CURRENT_USER_ID);

export async function getCurrentUser(): Promise<User> {
  const user = db.users.find((item) => item.id === CURRENT_USER_ID);
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateUserSettings(settings: UserSettings): Promise<User> {
  return { ...(await getCurrentUser()), ...settings };
}

export async function getClients(): Promise<Client[]> {
  return ownClients();
}

export async function createClient(input: ClientInput): Promise<Client> {
  return {
    ...input,
    id: `cli_${Date.now()}`,
    userId: CURRENT_USER_ID,
    description: null,
    location: input.address ?? "",
    anaeVerified: false,
  };
}

export async function updateClient(client: Client, input: ClientInput): Promise<Client> {
  return { ...client, ...input, location: input.address ?? client.location };
}

export async function getInvoices(): Promise<InvoiceWithClient[]> {
  const clients = new Map(ownClients().map((client) => [client.id, client]));
  return (db.invoices as InvoiceWithClient[])
    .filter((invoice) => invoice.userId === CURRENT_USER_ID && clients.has(invoice.clientId))
    .map((invoice) => ({ ...invoice, client: clients.get(invoice.clientId)! }))
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}

export async function getNextDeadline(): Promise<Deadline> {
  const deadline = (db.deadlines as Deadline[]).find((item) => item.userId === CURRENT_USER_ID);
  if (!deadline) throw new Error("Deadline not found");
  return deadline;
}

export async function getInvoiceDraft(clientId?: string): Promise<InvoiceDraft> {
  const stored = (db.invoiceDrafts as InvoiceDraft[]).find((item) => item.userId === CURRENT_USER_ID);
  const lastNumber = Math.max(0, ...db.invoices.filter((invoice) => invoice.userId === CURRENT_USER_ID).map((invoice) => Number(invoice.number.split("-")[1])));
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
    client: { name: client.name, nif: client.nif ?? "", nis: client.nis ?? "", rc: client.rc ?? "", address: client.address ?? "" },
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
    .map((statute) => ({ statute, score: statute.keywords.filter((keyword) => text.includes(keyword)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ statute }) => statute);

  const content = matches.length
    ? matches.map((statute) => `${statute.code}: ${statute.summary}`).join("\n\n")
    : "I can only answer questions grounded in the auto-entrepreneur regulations listed in the reference vault, such as the turnover ceiling, cash-basis recognition, VAT exemption, the IFU rate or the G50-A declaration. Try rephrasing around one of them.";

  return {
    id: `msg_${Date.now()}`,
    userId: CURRENT_USER_ID,
    role: "assistant",
    content,
    citations: matches.map((statute) => statute.id),
    createdAt: new Date().toISOString(),
  };
}
