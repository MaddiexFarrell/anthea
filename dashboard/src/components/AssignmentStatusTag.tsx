import type {AssignmentStatus} from '../lib/api'
import {STATUS_DOT, STATUS_TONES, TERMINAL_STATUSES} from '../lib/assignmentStatus'
import {Badge, StatusDot} from './ui'

// Dot + label for in-flight statuses; a filled pill for terminal ones.
export function AssignmentStatusTag({
  status,
  label,
}: {
  status: AssignmentStatus
  label: string
}) {
  if (TERMINAL_STATUSES.includes(status)) {
    return <Badge tone={STATUS_TONES[status]}>{label}</Badge>
  }
  return <StatusDot dotClass={STATUS_DOT[status]}>{label}</StatusDot>
}
