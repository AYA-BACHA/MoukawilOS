"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ChatPanel } from "@/components/assistant/chat-panel";
import { ReferenceVault } from "@/components/assistant/reference-vault";
import { StatuteModal } from "@/components/assistant/statute-modal";
import { askAssistant } from "@/lib/api";
import type { AssistantMessage, Statute, TurnoverStats, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

interface AssistantViewProps {
  user: User;
  stats: TurnoverStats;
  statutes: Statute[];
  initialMessages: AssistantMessage[];
}

export function AssistantView({ user, stats, statutes, initialMessages }: AssistantViewProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState(false);
  const [inspectingStatute, setInspectingStatute] = useState<Statute | null>(null);

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
    <div className="flex flex-col gap-5 py-3 pb-20 lg:pb-6">
      {/* Sleek Copilot Command Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {t("Statutory Intelligence")}
            </span>
            <span className="text-[11px] text-slate-400">{t("Official Algerian Gazettes · Law 22-23 & Executive Decrees 23-196 / 23-197")}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t("Al-Moukawil Regulatory Assistant")}</h1>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {t("Verified legal and fiscal references for Algerian auto-entrepreneurs. Query ceiling enforcement (5,000,000 DZD), 0.5% IFU taxation, 0% VAT exemption, and statutory invoicing rules.")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setMessages(initialMessages)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200/80 bg-surface-low px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs transition-all hover:bg-surface hover:border-slate-300 active:scale-95"
          >
            <RotateCcw className="size-3.5 text-muted" />
            {t("New conversation")}
          </button>
        </div>
      </header>

      {/* Main Grid: ChatPanel (8 cols) + ReferenceVault (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-5">
        <ChatPanel
          messages={messages}
          statutes={statutes}
          pending={pending}
          onAsk={ask}
          onInspectStatute={setInspectingStatute}
        />
        <ReferenceVault
          statutes={statutes}
          cited={cited}
          user={user}
          stats={stats}
          onInspectStatute={setInspectingStatute}
        />
      </div>

      {/* Official Statute Inspector Modal */}
      <StatuteModal statute={inspectingStatute} onClose={() => setInspectingStatute(null)} />
    </div>
  );
}
