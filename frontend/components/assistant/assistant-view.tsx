"use client";

import { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { ChatPanel } from "@/components/assistant/chat-panel";
import { ReferenceVault } from "@/components/assistant/reference-vault";
import { askAssistant } from "@/lib/api";
import type { AssistantMessage, Statute, TurnoverStats, User } from "@/types/models";

interface AssistantViewProps {
  user: User;
  stats: TurnoverStats;
  statutes: Statute[];
  initialMessages: AssistantMessage[];
}

export function AssistantView({ user, stats, statutes, initialMessages }: AssistantViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState(false);

  const ask = async (question: string) => {
    setMessages((current) => [...current, { id: `msg_u_${current.length}`, userId: user.id, role: "user", content: question, citations: [], createdAt: new Date().toISOString() }]);
    setPending(true);
    const reply = await askAssistant(question);
    setMessages((current) => [...current, reply]);
    setPending(false);
  };

  const cited = [...messages].reverse().find((message) => message.role === "assistant")?.citations ?? [];

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <header className="flex items-end justify-between rounded-lg bg-white p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-teal">Fiscal OS / Regulatory Intelligence</p>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.025em] text-ink">Al-Moukawil AI</h1>
          <p className="max-w-xl text-sm text-body">Ask about your auto-entrepreneur obligations. Every answer cites the statutory texts it relies on.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-mint px-3 py-1 text-xs font-medium tracking-[0.02em] text-mint-ink">
            <span className="size-1.5 rounded-full bg-primary" />
            Grounded in Law 22-23
          </span>
          <button onClick={() => setMessages(initialMessages)} className="rounded bg-surface px-3 py-2 text-sm font-medium text-ink">
            New conversation
          </button>
        </div>
      </header>

      <aside className="flex items-start justify-between gap-6 rounded-lg bg-surface-low p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
          <div>
            <h2 className="text-sm font-semibold text-ink">Statutory scope &amp; verification notice</h2>
            <p className="max-w-2xl pt-0.5 text-xs leading-[19.5px] tracking-[0.01em] text-body">
              Answers are informational and limited to the texts in the reference vault. Confirm any figure with the tax administration or a certified accountant before filing.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-mint px-2 py-1 text-xs font-medium tracking-[0.02em] text-mint-ink">
          <BadgeCheck className="size-3" />
          Sources verified
        </span>
      </aside>

      <div className="grid grid-cols-12 items-start gap-6">
        <ChatPanel messages={messages} statutes={statutes} pending={pending} onAsk={ask} />
        <ReferenceVault statutes={statutes} cited={cited} user={user} stats={stats} />
      </div>
    </div>
  );
}
