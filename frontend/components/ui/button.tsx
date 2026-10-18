import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "soft" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2.5 text-sm font-medium",
  outline: "bg-white text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)] rounded-lg px-3 py-2.5 text-sm font-medium",
  soft: "bg-surface-low text-ink rounded-xl px-3 py-1.5 text-xs font-medium tracking-[0.02em]",
  ghost: "text-primary-ink rounded-xl px-3 py-1 text-sm font-medium",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export const buttonClass = (variant: Variant = "primary", className?: string) =>
  cn("inline-flex items-center gap-1 whitespace-nowrap", variants[variant], className);
