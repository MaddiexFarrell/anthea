import {type FormEvent, useEffect, useMemo, useState} from 'react'
import {Send} from 'lucide-react'
import {
  type Assignment,
  type AssignmentStatus,
  type Candidate,
  type Company,
  api,
} from '../lib/api'
import {ASSIGNMENT_STATUSES, STATUS_LABELS} from '../lib/assignmentStatus'
import {StatusSelect} from '../components/StatusSelect'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  FormField,
  PageHeader,
  SkeletonList,
  inputClass,
  useToast,
} from '../components/ui'

export function AssignPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [assignments, setAssignments] = useState<Assignment[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const notify = useToast()

  const [candidateId, setCandidateId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [removing, setRemoving] = useState<Assignment | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)

  useEffect(() => {
    Promise.all([api.companies(), api.candidates(), api.assignments()])
      .then(([co, ca, as]) => {
        setCompanies(co)
        setCandidates(ca)
        setAssignments(as)
      })
      .catch(() => setLoadError(true))
  }, [])

  async function handleAssign(e: FormEvent) {
    e.preventDefault()
    if (!candidateId || !companyId) return
    setSubmitting(true)
    try {
      const created = await api.createAssignment({
        candidate: Number(candidateId),
        company: Number(companyId),
      })
      setAssignments((prev) => (prev ? [created, ...prev] : [created]))
      setCandidateId('')
      setCompanyId('')
      notify(`Shared ${created.candidate_name} with ${created.company_name}.`)
    } catch {
      notify(
        'Could not create that assignment — they may already be shared with this company.',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(assignment: Assignment, status: AssignmentStatus) {
    const previous = assignment.status
    setAssignments((prev) =>
      prev
        ? prev.map((a) =>
            a.id === assignment.id
              ? {...a, status, status_display: STATUS_LABELS[status]}
              : a,
          )
        : prev,
    )
    try {
      await api.updateAssignment(assignment.id, {status})
    } catch {
      setAssignments((prev) =>
        prev
          ? prev.map((a) => (a.id === assignment.id ? {...a, status: previous} : a))
          : prev,
      )
      notify('Could not update status. Please try again.', 'error')
    }
  }

  async function confirmRemove() {
    if (!removing) return
    setRemoveBusy(true)
    const snapshot = assignments
    const target = removing
    setAssignments((prev) => (prev ? prev.filter((a) => a.id !== target.id) : prev))
    try {
      await api.deleteAssignment(target.id)
      notify(`Removed ${target.candidate_name} from ${target.company_name}.`)
    } catch {
      setAssignments(snapshot ?? null)
      notify('Could not remove. Please try again.', 'error')
    } finally {
      setRemoveBusy(false)
      setRemoving(null)
    }
  }

  // Group by company, ordered by pipeline stage within each group.
  const groups = useMemo(() => {
    if (!assignments) return []
    const byCompany = new Map<string, Assignment[]>()
    for (const a of assignments) {
      const list = byCompany.get(a.company_name) ?? []
      list.push(a)
      byCompany.set(a.company_name, list)
    }
    return [...byCompany.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([company, items]) => ({
        company,
        items: [...items].sort(
          (x, y) =>
            ASSIGNMENT_STATUSES.indexOf(x.status) - ASSIGNMENT_STATUSES.indexOf(y.status),
        ),
      }))
  }, [assignments])

  return (
    <div>
      <PageHeader
        title="Assign"
        subtitle="Share a candidate with a company, then move them through the pipeline."
      />

      {loadError && (
        <Card>
          <p className="p-5 text-sm text-muted">
            Couldn't load data. Make sure the Django server is running.
          </p>
        </Card>
      )}

      {!loadError && (
        <>
          <Card className="mb-4">
            <form
              onSubmit={handleAssign}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <FormField label="Candidate">
                  <select
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a candidate…</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.title ? ` — ${c.title}` : ''}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="flex-1">
                <FormField label="Company">
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a company…</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <Button
                type="submit"
                icon={Send}
                loading={submitting}
                disabled={!candidateId || !companyId}
              >
                Share
              </Button>
            </form>

            {candidates.length === 0 && (
              <p className="border-t border-border px-5 py-3 text-sm text-muted">
                Add a candidate first, then come back to share them.
              </p>
            )}
          </Card>

          {assignments === null && <SkeletonList rows={4} />}

          {assignments?.length === 0 && (
            <EmptyState
              icon={Send}
              title="Nothing shared yet"
              description="Pick a candidate and a company above to start the pipeline."
            />
          )}

          {groups.length > 0 && (
            <div className="flex flex-col gap-3">
              {groups.map(({company, items}) => (
                <Card key={company} as="section">
                  <CardHeader
                    title={company}
                    action={
                      <span className="text-xs text-muted">
                        {items.length} candidate{items.length === 1 ? '' : 's'}
                      </span>
                    }
                  />
                  <ul>
                    {items.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
                      >
                        <Avatar
                          name={a.candidate_name}
                          size="sm"
                          src={a.candidate_detail.photo_url}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {a.candidate_name}
                          </p>
                          {a.status === 'passed' && a.pass_feedback && (
                            <p className="mt-0.5 truncate text-xs text-muted">
                              Passed: {a.pass_feedback}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <StatusSelect
                            value={a.status}
                            onChange={(status) => handleStatusChange(a, status)}
                          />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setRemoving(a)}>
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {removing && (
        <ConfirmDialog
          title="Remove assignment?"
          body={`Remove ${removing.candidate_name} from ${removing.company_name}?`}
          confirmLabel="Remove"
          danger
          busy={removeBusy}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </div>
  )
}
