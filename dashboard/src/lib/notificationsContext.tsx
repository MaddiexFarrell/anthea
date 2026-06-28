import {createContext, useContext, type ReactNode} from 'react'
import {useNotifications} from './useNotifications'

type NotificationsValue = ReturnType<typeof useNotifications>

const NotificationsContext = createContext<NotificationsValue | null>(null)

// Single source of notifications for the whole app, so the sidebar badge, the
// admin page, and the client bell stay in sync and only one poll runs.
export function NotificationsProvider({children}: {children: ReactNode}) {
  const value = useNotifications()
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext(): NotificationsValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider')
  }
  return ctx
}
