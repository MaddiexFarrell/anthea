import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ArrowRight, ExternalLink, Inbox, ListChecks} from 'lucide-react'
import {type Assignment, api} from '../lib/api'
import {AssignmentStatusTag} from '../components/AssignmentStatusTag'
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  useToast,
} from '../components/ui'

// Compact "2 days ago" style relative time for when a candidate was shared.
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const day = 86_400_000
  if (diff < day) {
    const hrs = Math.floor(diff / 3_600_000)
    if (hrs < 1) return 'just now'
    return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  }
  const days = Math.floor(diff / day)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

const IN_PROGRESS_STATUSES = ['accepted', 'meeting', 'interviewing', 'placed']

export function ClientPortalPage({view}: {view: 'to-review' | 'in-progress'}) {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .assignments()
      .then(setAssignments)
      .catch(() => setError(true))
  }, [])

  function updateLocal(updated: Assignment) {
    setAssignments((prev) =>
      prev ? prev.map((a) => (a.id === updated.id ? updated : a)) : prev,
    )
  }

  const title = view === 'to-review' ? 'To review' : 'Pipeline'
  const subtitle =
    view === 'to-review'
      ? 'New candidates Anthea has shared with you. Accept the ones you’d like to meet.'
      : 'Candidates you’ve accepted and where they are in the process.'

  const visible =
    assignments?.filter((a) =>
      view === 'to-review'
        ? a.status === 'shared'
        : IN_PROGRESS_STATUSES.includes(a.status),
    ) ?? null

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      {error && (
        <Card>
          <p className="p-5 text-sm text-muted">
            Couldn't load your candidates. Please refresh, or contact Anthea if it
            keeps happening.
          </p>
        </Card>
      )}

      {!error && visible === null && (
        <div className="flex flex-col gap-2">
          {Array.from({length: 2}).map((_, i) => (
            <Card key={i}>
              <div className="flex items-center gap-4 p-5">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!error && visible?.length === 0 && (
        <EmptyState
          icon={view === 'to-review' ? Inbox : ListChecks}
          title={view === 'to-review' ? 'You’re all caught up' : 'Nothing in your pipeline yet'}
          description={
            view === 'to-review'
              ? 'No new candidates to review right now. We’ll let you know when there are.'
              : 'Accept someone from “To review” and they’ll show up here.'
          }
        />
      )}

      {!error && visible && visible.length > 0 && (
        <div className="flex flex-col gap-2">
          {visible.map((a) =>
            view === 'to-review' ? (
              <ReviewCard key={a.id} assignment={a} onUpdated={updateLocal} />
            ) : (
              <InProgressCard key={a.id} assignment={a} />
            ),
          )}
        </div>
      )}
    </div>
  )
}

// A single labeled fact, e.g. "Looking for — Growth Marketing".
function Fact({label, value}: {label: string; value?: string}) {
  if (!value) return null
  return (
    <div>
      <p className="eyebrow mb-0.5">{label}</p>
      <p className="text-sm font-medium text-ink">{value}</p>
    </div>
  )
}

function QuickLinks({assignment}: {assignment: Assignment}) {
  const c = assignment.candidate_detail
  const links = [
    {label: 'Resume', url: c.resume_url},
    {label: 'LinkedIn', url: c.linkedin_url},
    {label: 'Portfolio', url: c.portfolio_url},
  ].filter((l) => l.url)
  if (links.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-forest transition-colors hover:bg-hover"
        >
          {l.label}
          <ExternalLink className="h-3 w-3" />
        </a>
      ))}
    </div>
  )
}

// A text button that takes the client to the full candidate detail page.
function ViewDetails({assignmentId, className = ''}: {assignmentId: number; className?: string}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(`/portal/candidate/${assignmentId}`)}
      className={`inline-flex items-center gap-1 text-sm font-medium text-forest transition-colors hover:text-forest-hover ${className}`}
    >
      View details
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  )
}

// Single-column card frame. Header (avatar + identity, with a trailing status /
// time), then the body content flows top to bottom.
function CardShell({
  assignment,
  trailing,
  children,
}: {
  assignment: Assignment
  trailing?: React.ReactNode
  children?: React.ReactNode
}) {
  const c = assignment.candidate_detail
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={c.name} size="lg" src={c.photo_url} zoomable />
            <div className="min-w-0">
              <p className="font-display text-xl text-forest">{c.name}</p>
              {c.title && <p className="text-sm text-muted">{c.title}</p>}
            </div>
          </div>
          {trailing && <div className="shrink-0 text-right">{trailing}</div>}
        </div>
        {children}
      </div>
    </Card>
  )
}

// The shared body: a facts row, focus-area chips, experience, About, then links.
function CardBody({assignment}: {assignment: Assignment}) {
  const c = assignment.candidate_detail
  const hasFacts = c.role_wanted || c.experience_display || c.university
  return (
    <div className="mt-4 flex flex-col gap-4">
      {hasFacts && (
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          <Fact label="Looking for" value={c.role_wanted} />
          <Fact label="Stage" value={c.experience_display} />
          <Fact label="University" value={c.university} />
        </div>
      )}
      {c.focus_areas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {c.focus_areas.map((t) => (
            <span
              key={t.id}
              className="rounded-md border border-border bg-cream px-2 py-0.5 text-xs font-medium text-muted"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}
      {c.experiences.length > 0 && (
        <div>
          <p className="eyebrow mb-1">Experience</p>
          <ul className="flex flex-col gap-1.5">
            {c.experiences.map((exp, i) => (
              <li key={exp.id ?? i} className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm text-ink">{exp.title}</span>
                {exp.description && (
                  <span className="text-sm text-muted">— {exp.description}</span>
                )}
                {exp.url && (
                  <a
                    href={exp.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-forest underline underline-offset-2"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {c.about && (
        <div>
          <p className="eyebrow mb-1">Notes</p>
          <p className="line-clamp-3 text-sm leading-relaxed text-ink">{c.about}</p>
        </div>
      )}
      <QuickLinks assignment={assignment} />
    </div>
  )
}

function ReviewCard({
  assignment,
  onUpdated,
}: {
  assignment: Assignment
  onUpdated: (a: Assignment) => void
}) {
  const c = assignment.candidate_detail
  const notify = useToast()
  const [busy, setBusy] = useState(false)
  const [passing, setPassing] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function accept() {
    setBusy(true)
    try {
      onUpdated(await api.updateAssignment(assignment.id, {status: 'accepted'}))
      notify(`${c.name} accepted — we’ll coordinate next steps.`)
    } catch {
      notify('Something went wrong. Please try again.', 'error')
      setBusy(false)
    }
  }

  async function submitPass() {
    setBusy(true)
    try {
      onUpdated(
        await api.updateAssignment(assignment.id, {
          status: 'passed',
          pass_feedback: feedback.trim(),
        }),
      )
      notify(`Passed on ${c.name}. Thanks for the feedback.`)
    } catch {
      notify('Something went wrong. Please try again.', 'error')
      setBusy(false)
    }
  }

  return (
    <CardShell
      assignment={assignment}
      trailing={
        <span className="text-xs text-muted">
          Shared {timeAgo(assignment.created_at)}
        </span>
      }
    >
      <CardBody assignment={assignment} />

      <div className="mt-5 border-t border-border pt-4">
        {!passing ? (
          <div className="flex items-center gap-2">
            <Button onClick={accept} loading={busy}>
              Accept
            </Button>
            <Button variant="secondary" onClick={() => setPassing(true)} disabled={busy}>
              Pass
            </Button>
            <ViewDetails assignmentId={assignment.id} className="ml-auto" />
          </div>
        ) : (
          <div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink">
                Why are you passing? (helps Anthea send better candidates)
              </span>
              <textarea
                autoFocus
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/20"
                placeholder="Optional, but appreciated…"
              />
            </label>
            <div className="mt-3 flex gap-2">
              <Button onClick={submitPass} loading={busy}>
                Submit pass
              </Button>
              <Button variant="ghost" onClick={() => setPassing(false)} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </CardShell>
  )
}

function InProgressCard({assignment}: {assignment: Assignment}) {
  return (
    <CardShell
      assignment={assignment}
      trailing={
        assignment.status === 'accepted' ? undefined : (
          <AssignmentStatusTag
            status={assignment.status}
            label={assignment.status_display}
          />
        )
      }
    >
      <CardBody assignment={assignment} />

      <div className="mt-5 border-t border-border pt-4">
        <ViewDetails assignmentId={assignment.id} />
      </div>
    </CardShell>
  )
}
