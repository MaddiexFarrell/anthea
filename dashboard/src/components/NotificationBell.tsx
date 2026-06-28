import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {groupNotifications, type DisplayItem} from '../lib/notificationGroups'
import {useNotificationsContext} from '../lib/notificationsContext'
import {NotificationList} from './NotificationList'

export function NotificationBell() {
  const {items, unreadCount, markRead, markAllRead} = useNotificationsContext()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const display = groupNotifications(items)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  function onSelect(item: DisplayItem) {
    if (item.type === 'group') {
      item.ids.forEach((id) => markRead(id))
      navigate(item.link)
    } else {
      if (!item.notification.is_read) markRead(item.notification.id)
      if (item.notification.link) navigate(item.notification.link)
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-hover"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1 text-[10px] font-semibold text-paper">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-muted hover:text-forest"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            <NotificationList
              items={display}
              onSelect={onSelect}
              empty="You're all caught up."
            />
          </div>
        </div>
      )}
    </div>
  )
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
