"use client";

import React from "react";
import { cn } from "@/lib/cn";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Formats inline markdown tokens:
 * - Bold: **text**
 * - Italic: *text*
 * - Code: `text`
 * - Currency/Law emphasis
 */
function FormattedInline({ text }: { text: string }) {
  if (!text) return null;

  // Split on bold (**...**), italic (*...*), or inline code (`...`)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;

        // Bold: **text**
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          const inner = part.slice(2, -2);
          const isHighlight =
            inner.includes("5,000,000") ||
            inner.includes("5 000 000") ||
            inner.includes("0.5%") ||
            inner.includes("0%");

          return (
            <strong
              key={idx}
              className={cn(
                "font-bold text-ink",
                isHighlight && "text-emerald-800 dark:text-emerald-400 font-extrabold",
              )}
            >
              {inner}
            </strong>
          );
        }

        // Italic: *text*
        if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
          const inner = part.slice(1, -1);
          return (
            <em key={idx} className="italic text-slate-700 dark:text-slate-300">
              {inner}
            </em>
          );
        }

        // Inline code: `text`
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
          const inner = part.slice(1, -1);
          return (
            <code
              key={idx}
              className="rounded bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100"
            >
              {inner}
            </code>
          );
        }

        // Regular text
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

/**
 * Clean block-level Markdown renderer for AI assistant responses.
 * Replaces raw asterisks, hash headers, and lists with elegant structured typography.
 */
export function FormattedMarkdown({ content, className }: FormattedMarkdownProps) {
  if (!content) return null;

  // Split content into paragraphs or block groups by 2+ newlines
  const blocks = content.split(/\n\n+/);

  return (
    <div className={cn("flex flex-col gap-2.5 text-xs sm:text-sm leading-relaxed text-ink", className)}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Header 3 or 4: ### Title
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={bIdx} className="font-bold text-ink text-sm sm:text-base mt-1.5 tracking-tight">
              <FormattedInline text={trimmed.slice(4)} />
            </h4>
          );
        }

        // Header 2: ## Title
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={bIdx} className="font-extrabold text-ink text-base sm:text-lg mt-2 tracking-tight">
              <FormattedInline text={trimmed.slice(3)} />
            </h3>
          );
        }

        const lines = trimmed.split("\n");

        // Bullet list block
        const isBulletList = lines.every((l) => {
          const t = l.trim();
          return t.startsWith("- ") || t.startsWith("* ") || t.startsWith("• ");
        });

        if (isBulletList) {
          return (
            <ul key={bIdx} className="flex flex-col gap-1.5 ps-1 my-0.5">
              {lines.map((line, lIdx) => {
                const lineTrimmed = line.trim();
                const itemContent = lineTrimmed.replace(/^[-*•]\s+/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="flex-1">
                      <FormattedInline text={itemContent} />
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Numbered list block
        const isNumberedList = lines.every((l) => /^\d+[\.\)]\s/.test(l.trim()));
        if (isNumberedList) {
          return (
            <ol key={bIdx} className="flex flex-col gap-1.5 ps-1 my-0.5">
              {lines.map((line, lIdx) => {
                const lineTrimmed = line.trim();
                const match = /^(\d+)[\.\)]\s+(.*)$/.exec(lineTrimmed);
                const num = match ? match[1] : `${lIdx + 1}`;
                const itemContent = match ? match[2] : lineTrimmed;

                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="font-num text-[11px] font-bold text-accent shrink-0 min-w-4">
                      {num}.
                    </span>
                    <span className="flex-1">
                      <FormattedInline text={itemContent} />
                    </span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Regular paragraph with single newline breaks
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                <FormattedInline text={line} />
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
