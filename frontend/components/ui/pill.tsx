import { cn } from "@/lib/cn";

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  dot?: string;
}

export function Pill({ dot, className, children, ...props }: PillProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-xl text-xs font-medium tracking-[0.02em]", className)} {...props}>
      {dot && <span className={cn("size-1.5 rounded-full", dot)} />}
      {children}
    </span>
  );
}
