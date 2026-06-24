import type {LucideIcon} from 'lucide-react'

/* A small, consistent icon chip used on feature cards and steps. Tighter
   radius + soft sage (or highlight) fill keeps it premium and on-theme. */
export function IconBadge({
  icon: Icon,
  tone = 'sage',
}: {
  icon: LucideIcon
  tone?: 'sage' | 'highlight' | 'on-dark'
}) {
  const tones = {
    sage: 'bg-sage text-forest',
    highlight: 'bg-highlight text-highlight-ink',
    'on-dark': 'bg-paper/10 text-highlight',
  }
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
    </span>
  )
}
