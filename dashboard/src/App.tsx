import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import {AppLayout} from './components/AppLayout'
import {SignIn} from './components/SignIn'
import type {CurrentUser} from './lib/api'
import {NotificationsProvider} from './lib/notificationsContext'
import {ToastProvider} from './components/ui'
import {useCurrentUser} from './lib/useCurrentUser'
import {AssignPage} from './pages/AssignPage'
import {CandidateDetailPage} from './pages/CandidateDetailPage'
import {CandidatesPage} from './pages/CandidatesPage'
import {ClientCandidateDetailPage} from './pages/ClientCandidateDetailPage'
import {ClientPortalPage} from './pages/ClientPortalPage'
import {ClientSettingsPage} from './pages/ClientSettingsPage'
import {CompaniesPage} from './pages/CompaniesPage'
import {CompanyDetailPage} from './pages/CompanyDetailPage'
import {NotificationsPage} from './pages/NotificationsPage'
import {TagsPage} from './pages/TagsPage'

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/companies" replace />} />
      <Route path="/companies" element={<CompaniesPage />} />
      <Route path="/companies/:id" element={<CompanyDetailPage />} />
      <Route path="/candidates" element={<CandidatesPage />} />
      <Route path="/candidates/:id" element={<CandidateDetailPage />} />
      <Route path="/assign" element={<AssignPage />} />
      <Route path="/tags" element={<TagsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="*" element={<Navigate to="/companies" replace />} />
    </Routes>
  )
}

function ClientRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/portal/to-review" replace />} />
      <Route path="/portal/to-review" element={<ClientPortalPage view="to-review" />} />
      <Route
        path="/portal/in-progress"
        element={<ClientPortalPage view="in-progress" />}
      />
      <Route path="/portal/candidate/:id" element={<ClientCandidateDetailPage />} />
      <Route path="/portal/settings" element={<ClientSettingsPage />} />
      <Route path="*" element={<Navigate to="/portal/to-review" replace />} />
    </Routes>
  )
}

function App() {
  const state = useCurrentUser()

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="max-w-sm text-center text-sm text-muted">
          Could not reach the server. Make sure the Django backend is running on
          port 8000, then refresh.
        </p>
      </div>
    )
  }

  if (state.status === 'anonymous') {
    return <SignIn />
  }

  const user: CurrentUser = state.user
  return (
    <BrowserRouter>
      <ToastProvider>
        <NotificationsProvider>
          <AppLayout user={user}>
            {user.is_admin ? <AdminRoutes /> : <ClientRoutes />}
          </AppLayout>
        </NotificationsProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
