import {useCallback, useEffect, useRef, useState} from 'react'
import {type AppNotification, api} from './api'

const POLL_MS = 45_000

/** Loads the current user's notifications and polls for new ones. */
export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([])
  const [loaded, setLoaded] = useState(false)
  // Avoid overlapping refreshes if a poll fires while one is in flight.
  const inFlight = useRef(false)

  const refresh = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    try {
      const data = await api.notifications()
      setItems(data)
    } catch {
      // Leave the last good list in place on a transient failure.
    } finally {
      inFlight.current = false
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, POLL_MS)
    // Refresh when the tab regains focus, so it feels current after switching back.
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  const markRead = useCallback(async (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? {...n, is_read: true} : n)),
    )
    try {
      await api.markNotificationRead(id)
    } catch {
      // best effort; a later poll will reconcile
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({...n, is_read: true})))
    try {
      await api.markAllNotificationsRead()
    } catch {
      // best effort; a later poll will reconcile
    }
  }, [])

  const unreadCount = items.filter((n) => !n.is_read).length

  return {items, unreadCount, loaded, refresh, markRead, markAllRead}
}
