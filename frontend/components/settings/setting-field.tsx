import { cn } from "@/lib/cn";

export const controlClass =
  "min-h-[44px] sm:min-h-10 h-11 sm:h-10 w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3.5 text-base sm:text-sm font-medium text-ink shadow-xs outline-none transition-all duration-150 placeholder:text-muted hover:border-slate-400 hover:bg-card focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20";

interface SettingFieldProps {
  label: string;
  badge?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function SettingField({ label, badge, hint, className, children }: SettingFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-body">{label}</span>
        {badge}
      </div>
      {children}
      {hint && <p className="text-xs tracking-[0.01em] text-muted">{hint}</p>}
    </div>
  );
}

interface ReadOnlyProps {
  className?: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}

export function ReadOnly({ className, children, trailing }: ReadOnlyProps) {
  return (
    <div className={cn("flex min-h-10 items-center justify-between gap-2 rounded bg-surface-low px-3 py-2.5 text-sm text-ink shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]", className)}>
      <span className="flex items-center gap-1.5">{children}</span>
      {trailing}
    </div>
  );
}

export function IconInput({ icon, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <span className="relative flex items-center">
      <span className="pointer-events-none absolute start-3 text-body">{icon}</span>
      <input className={cn(controlClass, "ps-9", className)} {...props} />
    </span>
  );
}
