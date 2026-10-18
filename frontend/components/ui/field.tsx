import { cn } from "@/lib/cn";

export const inputClass =
  "h-10 w-full rounded bg-white px-3 text-sm text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30";

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
