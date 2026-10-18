import { cn } from "@/lib/cn";

export const inputClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3.5 text-sm font-medium text-ink shadow-xs outline-none transition-all duration-150 placeholder:text-muted/70 hover:border-slate-400 hover:bg-white focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20";

interface FieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="flex items-center justify-between gap-1 text-xs font-medium tracking-[0.02em] text-body">
        {label}
        {hint && <span className="font-num font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
