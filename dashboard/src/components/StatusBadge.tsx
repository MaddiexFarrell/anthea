import type {CompanyStatus} from '../lib/api'
import {Badge, StatusDot} from './ui'

const DOT: Record<CompanyStatus, string> = {
  needs_candidates: 'bg-amber-500',
  reviewing: 'bg-forest',
  paused: 'bg-stone-400',
  placed: 'bg-forest',
}

export function StatusBadge({status, label}: {status: CompanyStatus; label: string}) {
  // Placed closes things out, so give it a filled pill; the rest are quiet dots.
  if (status === 'placed') return <Badge tone="forest">{label}</Badge>
  return <StatusDot dotClass={DOT[status]}>{label}</StatusDot>
}
