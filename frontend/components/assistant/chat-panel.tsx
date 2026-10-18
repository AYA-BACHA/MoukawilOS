"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, SendHorizontal } from "lucide-react";
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
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  const submit = () => {
    const question = draft.trim();
    if (!question || pending) return;
    setDraft("");
    onAsk(question);
  };

  const codeOf = (id: string) => statutes.find((statute) => statute.id === id)?.code ?? id;

  return (
    <section className="col-span-8 flex h-[640px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="ml-auto max-w-[75%] whitespace-pre-line rounded-lg rounded-br-sm bg-primary px-4 py-3 text-sm leading-6 text-white">
              {message.content}
            </div>
          ) : (
            <div key={message.id} className="flex max-w-[85%] items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-mint text-primary">
                <Bot className="size-4" strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-2">
                <div className="whitespace-pre-line rounded-lg rounded-tl-sm bg-surface-low px-4 py-3 text-sm leading-6 text-ink">{message.content}</div>
                {message.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {message.citations.map((id) => (
                      <span key={id} className="rounded-sm bg-mint px-2 py-0.5 font-num text-xs text-mint-ink">
                        {codeOf(id)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ),
        )}
        {pending && <p className="pl-11 text-xs font-medium tracking-[0.02em] text-muted">Checking the statutory texts…</p>}
        <div ref={endRef} />
      </div>

      <div className="flex flex-col gap-3 bg-surface-low p-4">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button key={suggestion} onClick={() => onAsk(suggestion)} className="rounded-xl bg-white px-3 py-1.5 text-xs font-medium tracking-[0.02em] text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            placeholder="Ask about your ceiling, VAT exemption, IFU, declarations..."
            className="h-11 flex-1 rounded bg-white px-3 text-sm text-ink shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
          />
          <button
            aria-label="Send question"
            onClick={submit}
            disabled={!draft.trim() || pending}
            className={cn("grid size-11 place-items-center rounded bg-primary text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]", "disabled:opacity-50")}
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
