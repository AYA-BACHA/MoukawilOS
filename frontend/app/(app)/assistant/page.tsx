import { cookies } from "next/headers";
import { AssistantView } from "@/components/assistant/assistant-view";
import { getAssistantMessages, getCurrentUser, getInvoices, getStatutes, type DemoScenario } from "@/lib/api";
import { computeStats } from "@/lib/stats";

export default async function AssistantPage() {
  const cookieStore = await cookies();
  const scenarioCookie = (cookieStore.get("moukawil_demo_scenario")?.value as DemoScenario) || "standard";

  const [user, invoices, statutes, messages] = await Promise.all([
    getCurrentUser(),
    getInvoices(scenarioCookie),
    getStatutes(),
    getAssistantMessages(),
  ]);
  const activeYearInvoices = invoices.filter((i) => !i.issueDate || i.issueDate.startsWith("2026"));
  return <AssistantView user={user} stats={computeStats(user, activeYearInvoices)} statutes={statutes} initialMessages={messages} />;
}
