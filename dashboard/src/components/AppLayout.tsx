import {type ReactNode, useEffect, useState} from 'react'
import {NavLink} from 'react-router-dom'
import {
  Bell,
  Building2,
  Inbox,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  Tag,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import type {CurrentUser} from '../lib/api'
import {useNotificationsContext} from '../lib/notificationsContext'
import {NotificationBell} from './NotificationBell'
import {Avatar} from './ui'

type NavItem = {to: string; label: string; icon: React.ComponentType<{className?: string}>}

const ADMIN_NAV: NavItem[] = [
  {to: '/companies', label: 'Companies', icon: Building2},
  {to: '/candidates', label: 'Candidates', icon: Users},
  {to: '/assign', label: 'Assign', icon: Workflow},
  {to: '/tags', label: 'Tags', icon: Tag},
  {to: '/notifications', label: 'Notifications', icon: Bell},
]

const CLIENT_NAV: NavItem[] = [
  {to: '/portal/to-review', label: 'To review', icon: Inbox},
  {to: '/portal/in-progress', label: 'Pipeline', icon: ListChecks},
  {to: '/portal/settings', label: 'Settings', icon: Settings},
]

export function AppLayout({user, children}: {user: CurrentUser; children: ReactNode}) {
  const nav = user.is_admin ? ADMIN_NAV : CLIENT_NAV
  const {unreadCount} = useNotificationsContext()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-forest-deep/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        nav={nav}
        unreadCount={unreadCount}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-10">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-muted hover:bg-hover hover:text-ink md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg text-forest md:hidden">Anthea</span>
          <div className="ml-auto">{!user.is_admin && <NotificationBell />}</div>
        </header>

        <main className="px-4 py-8 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

function Sidebar({
  user,
  nav,
  unreadCount,
  mobileOpen,
  onNavigate,
}: {
  user: CurrentUser
  nav: NavItem[]
  unreadCount: number
  mobileOpen: boolean
  onNavigate: () => void
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border bg-background px-4 py-6 transition-transform md:static md:z-auto md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="font-display text-2xl text-forest">Anthea</p>
          {user.is_admin && <p className="eyebrow mt-1">Admin</p>}
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-muted hover:bg-hover hover:text-ink md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {nav.map(({to, label, icon: Icon}) => {
          const showBadge = to === '/notifications' && unreadCount > 0
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({isActive}) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-surface font-medium text-forest shadow-sm'
                    : 'text-muted hover:bg-hover hover:text-ink'
                }`
              }
            >
              {({isActive}) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-forest" />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1">{label}</span>
                  {showBadge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1 text-[10px] font-semibold text-paper">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <UserMenu user={user} />
    </aside>
  )
}

function UserMenu({user}: {user: CurrentUser}) {
  const [open, setOpen] = useState(false)
  const label = user.email || user.username

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative mt-4 border-t border-border pt-4">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-card">
          <a
            href="/accounts/logout/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-hover"
      >
        <Avatar name={label} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink">{label}</span>
          <span className="block text-xs text-muted">
            {user.is_admin ? 'Administrator' : 'Client'}
          </span>
        </span>
      </button>
    </div>
  )
}
