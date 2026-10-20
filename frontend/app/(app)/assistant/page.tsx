import { AssistantView } from "@/components/assistant/assistant-view";
import { getAssistantMessages, getCurrentUser, getInvoices, getStatutes } from "@/lib/api";
import { computeStats } from "@/lib/stats";

export default async function AssistantPage() {
  const [user, invoices, statutes, messages] = await Promise.all([
    getCurrentUser(),
    getInvoices(),
    getStatutes(),
    getAssistantMessages(),
    new Promise((resolve) => setTimeout(resolve, 400)),
  ]);
  return <AssistantView user={user} stats={computeStats(user, invoices)} statutes={statutes} initialMessages={messages} />;
}
