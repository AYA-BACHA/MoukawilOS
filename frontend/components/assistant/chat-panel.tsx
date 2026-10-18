"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  HelpCircle,
  Loader2,
  SendHorizontal,
  Sparkles,
  User as UserIcon,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AssistantMessage, Statute } from "@/types/models";

const suggestions = [
  "What happens if I exceed the 5,000,000 DZD ceiling?",
  "Do pending invoices count toward my ceiling?",
  "Which clause must appear on B2B invoices?",
  "When is my G50-A declaration due?",
];

interface ChatPanelProps {
  messages: AssistantMessage[];
  statutes: Statute[];
  pending: boolean;
  onAsk: (question: string) => void;
}

export function ChatPanel({ messages, statutes, pending, onAsk }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll only the chat container internally, preventing whole-page jump
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, pending]);

  const submit = () => {
    const question = draft.trim();
    if (!question || pending) return;
    setDraft("");
    onAsk(question);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const codeOf = (id: string) => statutes.find((statute) => statute.id === id)?.code ?? id;
  const titleOf = (id: string) => statutes.find((statute) => statute.id === id)?.title ?? "";

  return (
    <section className="col-span-12 lg:col-span-8 flex h-[680px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-mint text-primary">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-ink">Al-Moukawil Statutory Copilot</h3>
            <p className="text-[10px] text-muted">Audited with official JORADP Algerian legal codifications</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          Law 22-23 Active
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={containerRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 scroll-smooth">
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="ml-auto flex max-w-[82%] items-end gap-2">
              <div className="rounded-2xl rounded-tr-xs bg-[#154b46] px-4 py-2.5 text-xs sm:text-sm leading-relaxed text-white shadow-xs">
                {message.content}
              </div>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-600 mb-0.5">
                <UserIcon className="size-3.5" />
              </span>
            </div>
          ) : (
            <div key={message.id} className="group relative flex max-w-[90%] items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-mint/80 text-primary shadow-xs">
                <Bot className="size-4" strokeWidth={2} />
              </span>
              <div className="flex flex-col gap-2">
                <div className="relative rounded-2xl rounded-tl-xs border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-xs sm:text-sm leading-relaxed text-ink shadow-2xs">
                  <p className="whitespace-pre-line">{message.content}</p>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyText(message.id, message.content)}
                    title="Copy response"
                    className="absolute right-2.5 top-2.5 rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-200/60 hover:text-slate-700 group-hover:opacity-100"
                  >
                    {copiedId === message.id ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>

                {/* Citations Badges */}
                {message.citations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-semibold text-muted flex items-center gap-1">
                      <BookOpen className="size-3 text-primary" />
                      Statutory Sources:
                    </span>
                    {message.citations.map((id) => (
                      <span
                        key={id}
                        title={titleOf(id)}
                        className="inline-flex items-center gap-1 rounded-md border border-teal/20 bg-mint/50 px-2 py-0.5 font-num text-[10px] font-bold text-teal transition-colors hover:bg-mint"
                      >
                        {codeOf(id)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ),
        )}

        {pending && (
          <div className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-mint/80 text-primary shadow-xs">
              <Bot className="size-4" />
            </span>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-slate-200/70 bg-slate-50 px-4 py-2.5 text-xs text-muted shadow-2xs">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              Cross-referencing Law 22-23 and Executive Decree 23-197...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 pt-3 pb-2">
          <p className="flex items-center gap-1 text-[11px] font-medium text-muted mb-2">
            <HelpCircle className="size-3 text-primary" /> Suggested Questions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onAsk(suggestion)}
                className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs text-body transition-all hover:border-slate-300 hover:bg-surface hover:text-ink active:scale-[0.98]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="border-t border-slate-100 bg-white p-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/70 p-1.5 transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            placeholder="Ask about your ceiling, VAT exemption, IFU, declarations..."
            className="flex-1 bg-transparent px-3 text-xs text-ink outline-none placeholder:text-muted/70"
          />
          <button
            type="button"
            aria-label="Send question"
            onClick={submit}
            disabled={!draft.trim() || pending}
            className="grid size-9 place-items-center rounded-lg bg-primary text-white shadow-xs transition-all hover:bg-primary-ink disabled:opacity-40 active:scale-95"
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted">
          <span>Press Enter ↵ to send • Shift + Enter for new line</span>
          <span>Official 0.5% IFU & Law 22-23 references</span>
        </div>
      </div>
    </section>
  );
}
