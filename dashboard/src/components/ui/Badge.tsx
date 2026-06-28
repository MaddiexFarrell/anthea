import type {ReactNode} from 'react'

// Visual tones mapped to Anthea palette tokens. Keeps every pill in the app
// drawing from one place instead of ad-hoc class strings.
export type BadgeTone =
  | 'sage'
  | 'sageSoft'
  | 'forest'
  | 'highlight'
  | 'amber'
  | 'stone'
  | 'cream'

const TONES: Record<BadgeTone, string> = {
  sage: 'bg-sage text-forest',
  sageSoft: 'bg-sage-soft text-forest',
  forest: 'bg-forest text-paper',
  highlight: 'bg-highlight text-highlight-ink',
  amber: 'bg-amber-100 text-amber-800',
  stone: 'bg-stone-200 text-stone-600',
  cream: 'bg-cream text-muted',
}

export function Badge({
  tone = 'sageSoft',
  className = '',
  children,
}: {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
