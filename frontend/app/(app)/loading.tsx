export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 rounded-lg bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
        </div>
      </div>

      {/* Ceiling Card Skeleton */}
      <div className="rounded-xl border border-slate-200/80 bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
          <div className="h-6 w-44 rounded-full bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <div className="h-10 w-52 rounded-lg bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
          <div className="h-5 w-12 rounded bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        </div>
        <div className="mt-4 h-3.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
        <div className="mt-3 flex items-center justify-between">
          <div className="h-5 w-40 rounded-full bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          <div className="h-7 w-36 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        </div>
      </div>

      {/* Secondary KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-slate-200/80 bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
            <div className="size-8 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          </div>
          <div className="mt-4 h-8 w-48 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
          <div className="mt-2 h-4 w-full rounded bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
          <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="h-6 w-36 rounded bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
            <div className="size-8 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          </div>
          <div className="mt-4 h-8 w-40 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
          <div className="mt-2 h-4 w-full rounded bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
          <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="h-6 w-32 rounded bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
          <div className="h-5 w-36 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
          <div className="h-7 w-28 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between py-3 px-3">
              <div className="h-4 w-28 rounded bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
              <div className="h-4 w-36 rounded bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
              <div className="h-4 w-20 rounded bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
              <div className="h-4 w-24 rounded bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Synchronizing Footer */}
      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted">
        <span className="size-2 rounded-full bg-accent animate-ping" />
        <span>Synchronizing fiscal registry under Law 22-23...</span>
      </div>
    </div>
  );
}
