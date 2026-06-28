import type {AssignmentStatus} from './api'
import type {BadgeTone} from '../components/ui/Badge'

// The order admins move an assignment through. `passed` sits apart since it's a
// client decision that ends the pipeline for that candidate/company pair.
export const ASSIGNMENT_STATUSES: AssignmentStatus[] = [
  'shared',
  'accepted',
  'meeting',
  'interviewing',
  'placed',
  'passed',
]

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  shared: 'Shared',
  passed: 'Passed',
  accepted: 'Accepted',
  meeting: 'Meeting booked',
  interviewing: 'Interviewing',
  placed: 'Placed',
}

// Badge tone for each status. Single source of truth for status coloring.
export const STATUS_TONES: Record<AssignmentStatus, BadgeTone> = {
  shared: 'sageSoft',
  accepted: 'sage',
  meeting: 'amber',
  interviewing: 'amber',
  placed: 'forest',
  passed: 'stone',
}

// Dot color for non-terminal statuses. Terminal states render as filled pills.
export const STATUS_DOT: Record<AssignmentStatus, string> = {
  shared: 'bg-stone-400',
  accepted: 'bg-forest',
  meeting: 'bg-amber-500',
  interviewing: 'bg-amber-500',
  placed: 'bg-forest',
  passed: 'bg-stone-400',
}

// Placed/Passed close the pipeline, so they get a filled pill for emphasis.
export const TERMINAL_STATUSES: AssignmentStatus[] = ['placed', 'passed']
