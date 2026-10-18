import Link from "next/link";
import { Bookmark, ChevronRight, ShieldCheck } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

interface BuilderStripProps {
  number: string;
  saved: boolean;
  onSave: () => void;
  onIssue: () => void;
}

export function BuilderStrip({ number, saved, onSave, onIssue }: BuilderStripProps) {
  return (
    <div className="flex items-center justify-between bg-white px-6 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/invoices" className="font-medium text-body">
              Invoices
            </Link>
            <ChevronRight className="size-3 text-body" />
            <span className="font-semibold text-ink">New Invoice (Draft #{number})</span>
          </nav>
          <span className="inline-flex items-center gap-1 rounded-xl bg-mint px-2 py-1 text-xs font-medium tracking-[0.02em] text-mint-ink">
            <span className="size-1.5 rounded-full bg-primary" />
            {saved ? "Draft saved" : "Unsaved changes"} • 0% VAT Applied
          </span>
        </div>
        <span className="w-fit rounded bg-surface-low px-1 py-0.5 font-num text-xs uppercase text-muted">Law 22-23 Compliant</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onSave} className={buttonClass("soft", "rounded px-3 py-2 text-sm tracking-normal")}>
          <Bookmark className="size-3.5" />
          Save Draft
        </button>
        <button onClick={onIssue} className={buttonClass("primary", "rounded px-4 py-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]")}>
          <ShieldCheck className="size-3.5" />
          Issue & Download PDF
        </button>
      </div>
    </div>
  );
}
