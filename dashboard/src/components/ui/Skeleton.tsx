export function Skeleton({className = ''}: {className?: string}) {
  return <div className={`animate-pulse rounded-md bg-cream ${className}`} />
}

// A few shimmer rows inside a card — drop-in replacement for "Loading…" lists.
export function SkeletonList({rows = 4}: {rows?: number}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {Array.from({length: rows}).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}
