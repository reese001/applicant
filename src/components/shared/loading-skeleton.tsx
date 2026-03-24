export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[280px] space-y-3">
          <div className="h-8 w-32 rounded-lg bg-white/[0.04] animate-pulse" />
          {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
            <div key={j} className="h-28 w-full rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <div className="h-10 w-full rounded-lg bg-white/[0.04] animate-pulse" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 w-full rounded-lg bg-white/[0.04] animate-pulse" />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-white/[0.04] animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-32 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
      </div>
      <div className="h-32 w-full rounded-xl bg-white/[0.04] animate-pulse" />
      <div className="h-48 w-full rounded-xl bg-white/[0.04] animate-pulse" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl liquid-glass p-6 space-y-4">
      <div className="h-5 w-2/3 rounded-lg bg-white/[0.04] animate-pulse" />
      <div className="h-4 w-1/2 rounded-lg bg-white/[0.04] animate-pulse" />
      <div className="h-20 w-full rounded-lg bg-white/[0.04] animate-pulse" />
    </div>
  );
}
