import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "soft" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-primary hover:bg-[#0c312d] text-white shadow-xs rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.98]",
  outline: "bg-white hover:bg-slate-50 text-ink border border-slate-200/80 shadow-xs rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 hover:border-slate-300 active:scale-[0.98]",
  soft: "bg-surface-low hover:bg-surface text-ink rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200/60 transition-all duration-150",
  ghost: "text-primary hover:bg-mint/40 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export const buttonClass = (variant: Variant = "primary", className?: string) =>
  cn("inline-flex items-center gap-1 whitespace-nowrap", variants[variant], className);
