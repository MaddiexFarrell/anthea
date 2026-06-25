import type {FormEvent, ReactNode} from 'react'
import {useEffect, useRef, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {type DocumentMeta, PageMeta} from '../components/page-meta'
import {SiteFooter} from '../components/site-footer'
import {SiteHeader} from '../components/site-header'
import {getAttribution} from '../lib/attribution'

const CONTACT_META: DocumentMeta = {
  title: 'Get started — Hiring or looking for a role | Anthea',
  description:
    'Tell us whether you\u2019re hiring growth and marketing talent or looking for your next role, and we\u2019ll take it from there. We\u2019ll be in touch within 24 hours.',
  canonical: 'https://antheatalent.com/contact',
  ogImage: 'https://antheatalent.com/hero.jpg',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': 'https://antheatalent.com/contact#webpage',
      url: 'https://antheatalent.com/contact',
      name: 'Get started with Anthea',
      description:
        'Reach Anthea to start hiring screened growth and marketing talent, or to be matched with a role that fits your strengths.',
      isPartOf: {'@id': 'https://antheatalent.com/#website'},
      about: {'@id': 'https://antheatalent.com/#agency'},
      mainEntity: {'@id': 'https://antheatalent.com/#organization'},
      inLanguage: 'en-US',
    },
  ],
}

const SUPPORT_EMAIL = 'hello@antheatalent.com'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOAST_DURATION_MS = 6000

/* Intake endpoint. The base comes from VITE_API_BASE_URL; local dev falls back
   to /api, which a Vite middleware plugin (and the production server) handles by
   writing the submission to the right Notion database. */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const INTAKE_ENDPOINT = `${API_BASE}/intake`

type Intent = 'hiring' | 'candidate'
type FieldErrors = Record<string, string[]>

type FieldDef = {
  name: string
  label: string
  kind?: 'text' | 'email' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  options?: {value: string; label: string}[]
}

/* Each form is a flat list of fields. The submit handler validates and serializes
   straight off these definitions, so the two forms stay declarative and share all
   the plumbing (validation, errors, network, toast). The `name` of every field
   doubles as the payload key and the error key the backend echoes back. */
const FORMS: Record<Intent, {fields: FieldDef[]}> = {
  hiring: {
    fields: [
      {name: 'name', label: 'Name', required: true},
      {name: 'organization', label: 'Company name', required: true},
      {name: 'email', label: 'Work email', kind: 'email', required: true},
      {
        name: 'rolesHiring',
        label: 'Role(s) you\u2019re hiring for',
        required: true,
        placeholder: 'e.g. Growth Marketer, Social Lead',
      },
      {
        name: 'roleType',
        label: 'Role type',
        kind: 'select',
        required: true,
        options: [
          {value: 'Intern', label: 'Intern'},
          {value: 'Full-time', label: 'Full-time'},
        ],
      },
      {
        name: 'message',
        label: 'What you\u2019re looking for',
        kind: 'textarea',
        required: true,
        placeholder: 'Tell us about the role and the kind of person you want.',
      },
    ],
  },
  candidate: {
    fields: [
      {name: 'name', label: 'Full name', required: true},
      {name: 'email', label: 'Email', kind: 'email', required: true},
      {name: 'university', label: 'University', placeholder: 'Optional'},
      {name: 'linkedin', label: 'LinkedIn / portfolio URL', placeholder: 'Optional'},
      {
        name: 'roleWanted',
        label: 'Role you want next',
        required: true,
        placeholder: 'e.g. Growth Marketing, Social & Community',
      },
      {
        name: 'experience',
        label: 'Experience level',
        kind: 'select',
        required: true,
        options: [
          {value: 'Student', label: 'Student'},
          {value: '0\u20132 years', label: '0\u20132 years'},
          {value: '3+ years', label: '3+ years'},
        ],
      },
      {
        name: 'message',
        label: 'About you',
        kind: 'textarea',
        required: true,
        placeholder: 'Tell us what you\u2019re great at and the role you want next.',
      },
    ],
  },
}

const fieldBox =
  'flex flex-col gap-1.5 rounded-lg border bg-surface px-4 py-3 transition-all duration-200 focus-within:border-forest'
const fieldBoxNormal = 'border-border'
const fieldBoxError = 'border-red-400'
const fieldLabel = 'text-xs font-medium text-muted'
const fieldInput =
  'bg-transparent text-[15px] text-ink leading-snug placeholder:text-muted-foreground/60 focus:outline-none'

function FieldError({message}: {message?: string}) {
  if (!message) return null
  return <span className="mt-0.5 text-[13px] text-red-600">{message}</span>
}

function Field({
  field,
  error,
  onClear,
}: {
  field: FieldDef
  error?: string
  onClear: () => void
}) {
  const boxClass = `${fieldBox} ${error ? fieldBoxError : fieldBoxNormal}`
  const labelNode = (
    <span className={fieldLabel}>
      {field.label}
      {field.required && ' *'}
    </span>
  )

  if (field.kind === 'select') {
    return (
      <SelectField field={field} error={error} onClear={onClear} boxClass={boxClass}>
        {labelNode}
      </SelectField>
    )
  }

  if (field.kind === 'textarea') {
    return (
      <label className={boxClass}>
        {labelNode}
        <textarea
          name={field.name}
          rows={4}
          placeholder={field.placeholder}
          onChange={onClear}
          aria-invalid={error ? true : undefined}
          className={`${fieldInput} resize-none`}
        />
        <FieldError message={error} />
      </label>
    )
  }

  return (
    <label className={boxClass}>
      {labelNode}
      <input
        name={field.name}
        type={field.kind === 'email' ? 'email' : 'text'}
        placeholder={field.placeholder}
        onChange={onClear}
        aria-invalid={error ? true : undefined}
        className={fieldInput}
      />
      <FieldError message={error} />
    </label>
  )
}

function SelectField({
  field,
  error,
  onClear,
  boxClass,
  children,
}: {
  field: FieldDef
  error?: string
  onClear: () => void
  boxClass: string
  children: ReactNode
}) {
  const [value, setValue] = useState('')
  return (
    <label className={boxClass}>
      {children}
      <select
        name={field.name}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onClear()
        }}
        aria-invalid={error ? true : undefined}
        className={`${fieldInput} -ml-0.5 ${value ? 'text-ink' : 'text-muted-foreground/60'}`}
      >
        <option value="">Select one</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  )
}

export function Contact() {
  const [searchParams] = useSearchParams()
  const intentParam = searchParams.get('intent')
  const initialIntent: '' | Intent =
    intentParam === 'hiring' || intentParam === 'candidate' ? intentParam : ''

  const [intent, setIntent] = useState<'' | Intent>(initialIntent)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  const clearError = (name: string) =>
    setErrors((current) => {
      if (!current[name]) return current
      const next = {...current}
      delete next[name]
      return next
    })

  const chooseIntent = (next: Intent) => {
    setIntent(next)
    setErrors({})
    setFormError(null)
  }

  useEffect(() => {
    if (!formError) return
    const handle = window.setTimeout(() => setFormError(null), TOAST_DURATION_MS)
    return () => window.clearTimeout(handle)
  }, [formError])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!intent) return

    const fields = FORMS[intent].fields
    const data = new FormData(event.currentTarget)
    const value = (key: string) => (data.get(key) as string | null)?.trim() ?? ''

    const nextErrors: FieldErrors = {}
    for (const field of fields) {
      const v = value(field.name)
      if (field.kind === 'email') {
        if (!EMAIL_PATTERN.test(v)) nextErrors[field.name] = ['Enter a valid email address.']
        continue
      }
      if (field.required && !v) {
        nextErrors[field.name] = ['This field is required.']
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload: Record<string, string> = {intent, ...getAttribution()}
    for (const field of fields) {
      const v = value(field.name)
      if (v) payload[field.name] = v
    }

    setStatus('submitting')
    setErrors({})
    setFormError(null)

    try {
      const res = await fetch(INTAKE_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setStatus('success')
        return
      }
      if (res.status === 400) {
        const body = await res.json().catch(() => null)
        setErrors(body && typeof body === 'object' ? (body as FieldErrors) : {})
        setFormError('A couple of details need a tweak — see the fields below.')
        setStatus('idle')
        return
      }
      if (res.status === 429) {
        setFormError('Too many requests in a row. Give it a minute and try again.')
        setStatus('idle')
        return
      }
      setFormError(
        `Something went wrong on our end. Please try again, or email us at ${SUPPORT_EMAIL}.`
      )
      setStatus('idle')
    } catch {
      setFormError(
        `We couldn\u2019t reach our servers. Check your connection and try again, or email ${SUPPORT_EMAIL}.`
      )
      setStatus('idle')
    }
  }

  const submitting = status === 'submitting'

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <PageMeta meta={CONTACT_META} />
      <SiteHeader />

      {formError && (
        <div
          role="alert"
          aria-live="assertive"
          className="animate-fade-in fixed inset-x-4 top-20 z-50 mx-auto max-w-md rounded-lg border border-red-300 bg-red-50 px-5 py-4 pr-12 text-sm text-red-800 leading-[1.45] shadow-lg md:inset-x-auto md:right-6 md:left-auto md:mx-0"
        >
          {formError}
          <button
            type="button"
            onClick={() => setFormError(null)}
            aria-label="Dismiss"
            className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center text-red-500 transition-colors hover:text-red-800"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <main className="flex-1 px-6 pt-32 pb-24 md:px-10 md:pt-40">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="animate-fade-in">
            <p className="eyebrow">Get started</p>
            <h1 className="font-display mt-4 text-[40px] leading-[1.04] md:text-[56px]">
              {intent === 'candidate'
                ? 'Ready to be matched?'
                : intent === 'hiring'
                  ? 'Let\u2019s find your next hire.'
                  : 'Hiring, or ready to be hired?'}
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted leading-[1.6]">
              {intent === 'candidate'
                ? 'Tell us about your background and the kind of role you want next, and we\u2019ll take it from there.'
                : intent === 'hiring'
                  ? 'Tell us about the role you\u2019re hiring for, and we\u2019ll come back with a curated shortlist.'
                  : 'Tell us whether you\u2019re hiring growth and marketing talent or looking for your next role, and we\u2019ll take it from there.'}
            </p>
            <dl className="mt-10 flex flex-col gap-5 text-[15px]">
              <div className="flex gap-5">
                <dt className="w-28 shrink-0 font-medium text-forest">Screened</dt>
                <dd className="text-muted">Reviewed, met, and interviewed</dd>
              </div>
              <div className="flex gap-5">
                <dt className="w-28 shrink-0 font-medium text-forest">Focused</dt>
                <dd className="text-muted">Growth &amp; marketing talent</dd>
              </div>
              <div className="flex gap-5">
                <dt className="w-28 shrink-0 font-medium text-forest">Fast</dt>
                <dd className="text-muted">We reply within 24 hours</dd>
              </div>
            </dl>
          </div>

          <div className="animate-fade-in rounded-2xl border border-border bg-cream p-6 md:p-9">
            {status === 'success' ? (
              <div className="flex flex-col items-start py-6">
                <p className="font-display text-3xl text-forest">
                  Thanks — we&rsquo;ve got it.
                </p>
                <p className="mt-4 text-base text-muted leading-[1.6]">
                  Your message is in. We&rsquo;ll review the details and be in touch
                  within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setErrors({})
                    setFormError(null)
                    setStatus('idle')
                  }}
                  className="mt-8 inline-flex items-center gap-2 text-sm text-forest transition-colors hover:text-forest-hover"
                >
                  Send another &rarr;
                </button>
              </div>
            ) : intent === '' ? (
              <div className="flex flex-col py-2">
                <p className="text-sm font-medium text-muted">
                  First, which one are you?
                </p>
                <div className="mt-5 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => chooseIntent('hiring')}
                    className="group flex flex-col items-start rounded-xl border border-border bg-surface p-6 text-left transition-all hover:border-forest hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                  >
                    <span className="font-display text-xl text-ink">I&rsquo;m hiring</span>
                    <span className="mt-1.5 text-[15px] text-muted leading-[1.5]">
                      Find screened growth &amp; marketing talent for your startup.
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest">
                      Start hiring
                      <span aria-hidden="true">&rarr;</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseIntent('candidate')}
                    className="group flex flex-col items-start rounded-xl border border-border bg-surface p-6 text-left transition-all hover:border-forest hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                  >
                    <span className="font-display text-xl text-ink">
                      I&rsquo;m looking for a role
                    </span>
                    <span className="mt-1.5 text-[15px] text-muted leading-[1.5]">
                      Get matched with fast-growing startups that fit you.
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest">
                      Apply now
                      <span aria-hidden="true">&rarr;</span>
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-3"
              >
                <button
                  type="button"
                  onClick={() => chooseIntent(intent === 'hiring' ? 'candidate' : 'hiring')}
                  className="-mt-1 mb-1 inline-flex items-center gap-1.5 self-start text-[13px] text-muted transition-colors hover:text-forest"
                >
                  <span aria-hidden="true">&larr;</span>
                  {intent === 'hiring' ? 'I\u2019m a candidate instead' : 'I\u2019m hiring instead'}
                </button>

                {FORMS[intent].fields.map((field) => (
                  <Field
                    key={field.name}
                    field={field}
                    error={errors[field.name]?.[0]}
                    onClear={() => clearError(field.name)}
                  />
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 inline-flex items-center justify-center gap-2 self-start rounded-lg bg-forest px-7 py-3.5 font-medium text-paper transition-colors hover:bg-forest-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : 'Send'}
                  {!submitting && <span aria-hidden="true">&rarr;</span>}
                </button>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  We&rsquo;ll be in touch within 24 hours.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
