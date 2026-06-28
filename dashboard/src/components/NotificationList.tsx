import type {DisplayItem} from '../lib/notificationGroups'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function NotificationList({
  items,
  onSelect,
  empty,
}: {
  items: DisplayItem[]
  onSelect: (item: DisplayItem) => void
  empty: string
}) {
  if (items.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-muted">{empty}</p>
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const unread =
          item.type === 'group' ? true : !item.notification.is_read
        const message =
          item.type === 'group' ? item.message : item.notification.message
        const time = item.type === 'group' ? item.created_at : item.notification.created_at
        const key = item.type === 'group' ? `group-${item.ids.join('-')}` : item.notification.id

        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-hover ${
                unread ? 'bg-sage-soft/40' : ''
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  unread ? 'bg-forest' : 'bg-transparent'
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink">{message}</span>
                <span className="mt-0.5 block text-xs text-muted">{timeAgo(time)}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
