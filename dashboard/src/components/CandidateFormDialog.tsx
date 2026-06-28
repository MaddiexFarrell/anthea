import {type FormEvent, useEffect, useState} from 'react'
import {Plus, X} from 'lucide-react'
import {
  type Candidate,
  type CandidateExperience,
  type ExperienceLevel,
  type Tag,
  EXPERIENCE_OPTIONS,
  api,
} from '../lib/api'
import {Button, Dialog, FormField, ImagePicker, inputClass} from './ui'

// Used for both adding a new candidate and editing an existing one. Pass a
// `candidate` to edit; omit it to create.
export function CandidateFormDialog({
  candidate,
  onClose,
  onSaved,
}: {
  candidate?: Candidate
  onClose: () => void
  onSaved: (candidate: Candidate) => void
}) {
  const editing = !!candidate
  const [name, setName] = useState(candidate?.name ?? '')
  const [title, setTitle] = useState(candidate?.title ?? '')
  const [roleWanted, setRoleWanted] = useState(candidate?.role_wanted ?? '')
  const [university, setUniversity] = useState(candidate?.university ?? '')
  const [experience, setExperience] = useState<ExperienceLevel>(
    candidate?.experience ?? '',
  )
  const [email, setEmail] = useState(candidate?.email ?? '')
  const [resumeUrl, setResumeUrl] = useState(candidate?.resume_url ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(candidate?.linkedin_url ?? '')
  const [portfolioUrl, setPortfolioUrl] = useState(candidate?.portfolio_url ?? '')
  const [about, setAbout] = useState(candidate?.about ?? '')
  const [intakeNotes, setIntakeNotes] = useState(candidate?.intake_notes ?? '')
  const [photo, setPhoto] = useState<File | null>(null)

  // Selectable chips: seed with the candidate's existing tags so they render
  // before the server list loads, then merge in the full predefined list.
  const [allTags, setAllTags] = useState<Tag[]>(candidate?.focus_areas ?? [])
  const [focusAreas, setFocusAreas] = useState<string[]>(
    candidate?.focus_areas.map((t) => t.name) ?? [],
  )
  const [newTag, setNewTag] = useState('')
  const [experiences, setExperiences] = useState<CandidateExperience[]>(
    candidate?.experiences.map((e) => ({
      title: e.title,
      description: e.description,
      url: e.url,
    })) ?? [],
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .tags()
      .then((server) =>
        setAllTags((prev) => {
          const byName = new Map(prev.map((t) => [t.name.toLowerCase(), t]))
          for (const t of server) byName.set(t.name.toLowerCase(), t)
          return Array.from(byName.values())
        }),
      )
      .catch(() => {})
  }, [])

  function toggleTag(tagName: string) {
    setFocusAreas((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    )
  }

  // Add a new tag to the selectable pool (if it's not already there) and select
  // it. Keeping it in the pool means clicking it later just unselects — it stays
  // available to re-select instead of disappearing.
  function addNewTag() {
    const value = newTag.trim()
    setNewTag('')
    if (!value) return
    const existing = allTags.find(
      (t) => t.name.toLowerCase() === value.toLowerCase(),
    )
    const name = existing ? existing.name : value
    if (!existing) {
      setAllTags((prev) => [...prev, {id: -Date.now(), name, order: 999}])
    }
    setFocusAreas((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }

  function updateExperience(index: number, patch: Partial<CandidateExperience>) {
    setExperiences((prev) =>
      prev.map((e, i) => (i === index ? {...e, ...patch} : e)),
    )
  }

  function addExperience() {
    setExperiences((prev) => [...prev, {title: '', description: '', url: ''}])
  }

  function removeExperience(index: number) {
    setExperiences((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    // Flush any text still sitting in the "+ Add" pill so it isn't lost when the
    // user clicks Save without pressing Enter first.
    const pending = newTag.trim()
    const finalFocusAreas =
      pending && !focusAreas.includes(pending)
        ? [...focusAreas, pending]
        : focusAreas
    const data = {
      name: name.trim(),
      title: title.trim(),
      role_wanted: roleWanted.trim(),
      university: university.trim(),
      experience,
      focus_area_names: finalFocusAreas,
      experiences: experiences
        .filter((x) => x.title.trim())
        .map((x, i) => ({
          title: x.title.trim(),
          description: x.description.trim(),
          url: x.url.trim(),
          order: i,
        })),
      email: email.trim(),
      resume_url: resumeUrl.trim(),
      linkedin_url: linkedinUrl.trim(),
      portfolio_url: portfolioUrl.trim(),
      about: about.trim(),
      intake_notes: intakeNotes.trim(),
      ...(photo ? {photo} : {}),
    }
    try {
      const saved = editing
        ? await api.updateCandidate(candidate.id, data)
        : await api.createCandidate(data)
      onSaved(saved)
    } catch {
      setError('Could not save the candidate. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title={editing ? 'Edit candidate' : 'Add candidate'}
      subtitle={
        editing
          ? 'Update this candidate’s details.'
          : 'Someone you can put forward to companies.'
      }
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="candidate-form"
            loading={submitting}
            disabled={!name.trim()}
          >
            {editing ? 'Save changes' : 'Add candidate'}
          </Button>
        </>
      }
    >
      <form id="candidate-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FormField label="Profile photo">
          <ImagePicker name={name} src={candidate?.photo_url} onChange={setPhoto} />
        </FormField>

        <FormField label="Name">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Jane Doe"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Current / most recent role">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Marketing Intern at Acme"
            />
          </FormField>

          <FormField label="Role they want next">
            <input
              value={roleWanted}
              onChange={(e) => setRoleWanted(e.target.value)}
              className={inputClass}
              placeholder="Growth Marketing"
            />
          </FormField>

          <FormField label="University">
            <input
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className={inputClass}
              placeholder="Stanford University"
            />
          </FormField>

          <FormField label="Stage">
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
              className={inputClass}
            >
              <option value="">Not specified</option>
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          label="Focus areas"
          hint="Tap to select. Add your own if it’s missing."
        >
          <div className="flex flex-wrap items-center gap-2">
            {allTags.map((t) => {
              const active = focusAreas.includes(t.name)
              return (
                <button
                  key={`tag-${t.id}`}
                  type="button"
                  onClick={() => toggleTag(t.name)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-forest bg-forest text-white'
                      : 'border-border text-muted hover:bg-hover'
                  }`}
                >
                  {t.name}
                </button>
              )
            })}
            <input
              key="tag-add-control"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addNewTag()
                }
              }}
              onBlur={() => addNewTag()}
              placeholder="+ Add"
              aria-label="Add a focus area"
              className="w-24 rounded-md border border-dashed border-border-strong bg-paper px-2.5 py-1 text-xs text-ink outline-none transition-[width,border-color] placeholder:text-muted focus:w-40 focus:border-solid focus:border-forest focus:ring-2 focus:ring-forest/20"
            />
          </div>
        </FormField>

        <FormField
          label="Experience"
          hint="Internships, clubs, projects — add a link to their work if you have one."
        >
          <div className="flex flex-col gap-3">
            {experiences.map((exp, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-paper p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      value={exp.title}
                      onChange={(e) => updateExperience(i, {title: e.target.value})}
                      className={inputClass}
                      placeholder="Growth Intern at Acme"
                    />
                    <input
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(i, {description: e.target.value})
                      }
                      className={inputClass}
                      placeholder="Short detail (optional)"
                    />
                    <input
                      type="url"
                      value={exp.url}
                      onChange={(e) => updateExperience(i, {url: e.target.value})}
                      className={inputClass}
                      placeholder="Link to their work (optional)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(i)}
                    aria-label="Remove experience"
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={addExperience}
              >
                Add experience
              </Button>
            </div>
          </div>
        </FormField>

        <FormField label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="jane@email.com"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Resume link">
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className={inputClass}
              placeholder="https://…"
            />
          </FormField>

          <FormField label="LinkedIn">
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className={inputClass}
              placeholder="https://…"
            />
          </FormField>

          <FormField label="Portfolio">
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className={inputClass}
              placeholder="https://…"
            />
          </FormField>
        </div>

        <FormField label="About" hint="Candidate's own summary — shown to clients.">
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </FormField>

        <FormField label="Intake notes" hint="Private — never shown to clients.">
          <textarea
            value={intakeNotes}
            onChange={(e) => setIntakeNotes(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </FormField>

        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </Dialog>
  )
}
