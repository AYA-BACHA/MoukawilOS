import type { LucideIcon } from "lucide-react";

interface SectionCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ id, icon: Icon, title, subtitle, badge, children }: SectionCardProps) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-4 rounded-lg bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded bg-mint text-accent shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-xl font-semibold leading-7 tracking-[-0.015em] text-ink">{title}</h2>
            <p className="text-xs tracking-[0.01em] text-body">{subtitle}</p>
          </div>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}
