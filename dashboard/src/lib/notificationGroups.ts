import type {AppNotification} from './api'

export type DisplayItem =
  | {type: 'single'; notification: AppNotification}
  | {
      type: 'group'
      ids: number[]
      count: number
      message: string
      link: string
      created_at: string
    }

// Collapses multiple unread "new candidate to review" notifications into a single
// "N new candidates to review" line. Individual rows are kept in the database; we
// only group them for display. Everything else is shown individually.
export function groupNotifications(items: AppNotification[]): DisplayItem[] {
  const unreadShared = items.filter(
    (n) => n.kind === 'candidate_shared' && !n.is_read,
  )

  if (unreadShared.length < 2) {
    return items.map((notification) => ({type: 'single', notification}))
  }

  const groupedIds = new Set(unreadShared.map((n) => n.id))
  const group: DisplayItem = {
    type: 'group',
    ids: unreadShared.map((n) => n.id),
    count: unreadShared.length,
    message: `${unreadShared.length} new candidates to review`,
    link: '/portal/to-review',
    created_at: unreadShared[0].created_at,
  }

  const rest: DisplayItem[] = items
    .filter((n) => !groupedIds.has(n.id))
    .map((notification) => ({type: 'single', notification}))

  return [group, ...rest]
}
