// Tiny API client. Requests go to the same origin (localhost:5173) and Vite
// proxies /api to Django, so the session cookie is sent automatically.

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Reads a cookie value by name (used for Django's csrftoken). */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[2]) : null
}

/** Builds multipart FormData from a plain object, for requests with file uploads.
 *  Skips undefined/null, appends File values as-is, and stringifies the rest. */
function toFormData(data: object): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue
    if (value instanceof File) {
      fd.append(key, value)
    } else if (Array.isArray(value) || typeof value === 'object') {
      // Nested lists/objects (focus_area_names, experiences) ride along as JSON.
      fd.append(key, JSON.stringify(value))
    } else {
      fd.append(key, String(value))
    }
  }
  return fd
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const isForm = options.body instanceof FormData
  const headers: Record<string, string> = {
    // Let the browser set the multipart boundary for FormData bodies.
    ...(isForm ? {} : {'Content-Type': 'application/json'}),
    ...((options.headers as Record<string, string>) ?? {}),
  }
  // Django/DRF session auth requires a CSRF token on unsafe methods.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = getCookie('csrftoken')
    if (csrf) headers['X-CSRFToken'] = csrf
  }

  const res = await fetch(path, {credentials: 'include', headers, ...options})
  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      message = typeof body === 'object' ? JSON.stringify(body) : String(body)
    } catch {
      // non-JSON error body; keep the default message
    }
    throw new ApiError(res.status, message)
  }
  // 204 No Content has no body.
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface CurrentUser {
  id: number
  username: string
  email: string
  role: 'admin' | 'client'
  is_admin: boolean
  companies: {id: number; name: string}[]
  email_on_new_candidate: boolean
}

export type CompanyStatus =
  | 'needs_candidates'
  | 'reviewing'
  | 'paused'
  | 'placed'

export interface CompanyMember {
  id: number
  email: string
  username: string
}

export interface Company {
  id: number
  name: string
  logo_image_url: string
  logo_url: string
  point_of_contact: string
  contact_email: string
  roles: string
  openings: number | null
  hires_count: number
  scheduling_link: string
  intake_link: string
  status: CompanyStatus
  status_display: string
  members: CompanyMember[]
  created_at: string
  updated_at: string
}

export interface InviteResult {
  created: boolean
  emailed: boolean
  member: CompanyMember
}

export interface NewCompany {
  name: string
  point_of_contact?: string
  contact_email?: string
  roles?: string
  openings?: number | null
  status?: CompanyStatus
  logo?: File | null
}

export type ExperienceLevel = '' | 'student' | 'intern' | 'new_grad'

// "Stage" in the UI; kept named EXPERIENCE_OPTIONS for the underlying field.
export const EXPERIENCE_OPTIONS: {value: ExperienceLevel; label: string}[] = [
  {value: 'student', label: 'Student'},
  {value: 'intern', label: 'Intern'},
  {value: 'new_grad', label: 'New grad'},
]

export interface Tag {
  id: number
  name: string
  order: number
}

export interface CandidateExperience {
  id?: number
  title: string
  description: string
  url: string
  order?: number
}

export interface Candidate {
  id: number
  name: string
  photo_url: string
  email: string
  title: string
  role_wanted: string
  university: string
  experience: ExperienceLevel
  experience_display: string
  focus_areas: Tag[]
  experiences: CandidateExperience[]
  resume_url: string
  linkedin_url: string
  portfolio_url: string
  about: string
  intake_notes: string
  created_at: string
  updated_at: string
}

export interface NewCandidate {
  name: string
  photo?: File | null
  title?: string
  role_wanted?: string
  university?: string
  experience?: ExperienceLevel
  focus_area_names?: string[]
  experiences?: CandidateExperience[]
  email?: string
  resume_url?: string
  linkedin_url?: string
  portfolio_url?: string
  about?: string
  intake_notes?: string
}

export type AssignmentStatus =
  | 'shared'
  | 'passed'
  | 'accepted'
  | 'meeting'
  | 'interviewing'
  | 'placed'

export interface CandidateDetail {
  id: number
  name: string
  photo_url: string
  email: string
  title: string
  role_wanted: string
  university: string
  experience: ExperienceLevel
  experience_display: string
  focus_areas: Tag[]
  experiences: CandidateExperience[]
  resume_url: string
  linkedin_url: string
  portfolio_url: string
  about: string
}

export interface Assignment {
  id: number
  candidate: number
  candidate_name: string
  candidate_detail: CandidateDetail
  company: number
  company_name: string
  status: AssignmentStatus
  status_display: string
  pass_feedback: string
  created_at: string
  updated_at: string
}

export interface NewAssignment {
  candidate: number
  company: number
  status?: AssignmentStatus
}

export type NotificationKind =
  | 'candidate_shared'
  | 'candidate_accepted'
  | 'candidate_passed'
  | 'status_changed'

// Named AppNotification to avoid clashing with the browser's global Notification.
export interface AppNotification {
  id: number
  kind: NotificationKind
  kind_display: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

export const api = {
  me: () => request<CurrentUser>('/api/me/'),
  updatePreferences: (data: {email_on_new_candidate: boolean}) =>
    request<CurrentUser>('/api/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  companies: () => request<Company[]>('/api/companies/'),
  company: (id: number) => request<Company>(`/api/companies/${id}/`),
  createCompany: (data: NewCompany) =>
    request<Company>('/api/companies/', {
      method: 'POST',
      body: toFormData(data),
    }),
  updateCompany: (id: number, data: Partial<NewCompany>) =>
    request<Company>(`/api/companies/${id}/`, {
      method: 'PATCH',
      body: toFormData(data),
    }),
  inviteClient: (companyId: number, data: {email: string; name?: string}) =>
    request<InviteResult>(`/api/companies/${companyId}/invite/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  candidates: () => request<Candidate[]>('/api/candidates/'),
  candidate: (id: number) => request<Candidate>(`/api/candidates/${id}/`),
  createCandidate: (data: NewCandidate) =>
    request<Candidate>('/api/candidates/', {
      method: 'POST',
      body: toFormData(data),
    }),
  updateCandidate: (id: number, data: Partial<NewCandidate>) =>
    request<Candidate>(`/api/candidates/${id}/`, {
      method: 'PATCH',
      body: toFormData(data),
    }),
  assignments: () => request<Assignment[]>('/api/assignments/'),
  assignment: (id: number) => request<Assignment>(`/api/assignments/${id}/`),
  assignmentsForCandidate: (candidateId: number) =>
    request<Assignment[]>(`/api/assignments/?candidate=${candidateId}`),
  assignmentsForCompany: (companyId: number) =>
    request<Assignment[]>(`/api/assignments/?company=${companyId}`),
  createAssignment: (data: NewAssignment) =>
    request<Assignment>('/api/assignments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAssignment: (
    id: number,
    data: Partial<NewAssignment> & {pass_feedback?: string},
  ) =>
    request<Assignment>(`/api/assignments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteAssignment: (id: number) =>
    request<void>(`/api/assignments/${id}/`, {method: 'DELETE'}),
  tags: () => request<Tag[]>('/api/tags/'),
  createTag: (data: {name: string; order?: number}) =>
    request<Tag>('/api/tags/', {method: 'POST', body: JSON.stringify(data)}),
  updateTag: (id: number, data: {name?: string; order?: number}) =>
    request<Tag>(`/api/tags/${id}/`, {method: 'PATCH', body: JSON.stringify(data)}),
  deleteTag: (id: number) =>
    request<void>(`/api/tags/${id}/`, {method: 'DELETE'}),
  notifications: () => request<AppNotification[]>('/api/notifications/'),
  unreadCount: () =>
    request<{count: number}>('/api/notifications/unread_count/'),
  markNotificationRead: (id: number) =>
    request<AppNotification>(`/api/notifications/${id}/mark_read/`, {method: 'POST'}),
  markAllNotificationsRead: () =>
    request<{updated: number}>('/api/notifications/mark_all_read/', {method: 'POST'}),
}
