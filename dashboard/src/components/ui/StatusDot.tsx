import type {ReactNode} from 'react'

// Small colored dot + label — the quiet default for status, keeping color to a
// minimum. Filled pills (Badge) are reserved for terminal states.
export function StatusDot({
  dotClass,
  children,
}: {
  dotClass: string
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {children}
    </span>
  )
}
