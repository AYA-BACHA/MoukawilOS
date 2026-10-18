"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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
    setMessages((current) => [
      ...current,
      {
        id: `msg_u_${current.length}`,
        userId: user.id,
        role: "user",
        content: question,
        citations: [],
        createdAt: new Date().toISOString(),
      },
    ]);
    setPending(true);
    const reply = await askAssistant(question);
    setMessages((current) => [...current, reply]);
    setPending(false);
  };

  const cited = [...messages].reverse().find((message) => message.role === "assistant")?.citations ?? [];

  return (
    <div className="flex flex-col gap-5 py-3">
      {/* Sleek Copilot Command Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-0.5 text-[11px] font-bold text-mint-ink">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Audited AI Copilot
            </span>
            <span className="text-[11px] font-medium text-muted">• Algerian Law 22-23 & Executive Decree 23-197</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Al-Moukawil Legal AI</h1>
          <p className="max-w-2xl text-xs leading-relaxed text-body">
            Ask any question regarding your turnover ceiling, B2B/B2C invoicing rules, or 0.5% IFU tax obligations. Every answer is legally grounded in official statutory codifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setMessages(initialMessages)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-surface-low px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs transition-all hover:bg-surface hover:border-slate-300 active:scale-95"
          >
            <RotateCcw className="size-3.5 text-muted" />
            New conversation
          </button>
        </div>
      </header>

      {/* Main Grid: ChatPanel (8 cols) + ReferenceVault (4 cols) */}
      <div className="grid grid-cols-12 items-start gap-5">
        <ChatPanel messages={messages} statutes={statutes} pending={pending} onAsk={ask} />
        <ReferenceVault statutes={statutes} cited={cited} user={user} stats={stats} />
      </div>
    </div>
  );
}
