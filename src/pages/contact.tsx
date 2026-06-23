import type {FormEvent} from 'react'
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

function TextField({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  error,
  onClear,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  error?: string
  onClear?: () => void
}) {
  return (
    <label className={`${fieldBox} ${error ? fieldBoxError : fieldBoxNormal}`}>
      <span className={fieldLabel}>
        {label}
        {required && ' *'}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        onChange={onClear}
        aria-invalid={error ? true : undefined}
        className={fieldInput}
      />
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

  useEffect(() => {
    if (!formError) return
    const handle = window.setTimeout(() => setFormError(null), TOAST_DURATION_MS)
    return () => window.clearTimeout(handle)
  }, [formError])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (key: string) => (data.get(key) as string | null)?.trim() ?? ''

    const name = value('name')
    const email = value('email')
    const organization = value('organization')
    const message = value('message')

    const nextErrors: FieldErrors = {}
    if (!name) nextErrors.name = ['Please enter your name.']
    if (!EMAIL_PATTERN.test(email)) nextErrors.email = ['Enter a valid email address.']
    if (!intent) nextErrors.intent = ['Let us know what you\u2019re looking for.']
    if (!message) nextErrors.message = ['A short message helps us help you.']
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload: Record<string, string> = {
      name,
      email,
      intent,
      message,
      ...getAttribution(),
    }
    if (organization) payload.organization = organization

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
              Hiring, or ready to be hired?
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted leading-[1.6]">
              Tell us whether you&rsquo;re hiring growth and marketing talent or looking
              for your next role, and we&rsquo;ll take it from there.
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
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-3"
              >
                <TextField
                  label="Name"
                  name="name"
                  required
                  error={errors.name?.[0]}
                  onClear={() => clearError('name')}
                />
                <TextField
                  label="Company / University"
                  name="organization"
                  placeholder="Optional"
                  error={errors.organization?.[0]}
                  onClear={() => clearError('organization')}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  error={errors.email?.[0]}
                  onClear={() => clearError('email')}
                />

                <label
                  className={`${fieldBox} ${errors.intent ? fieldBoxError : fieldBoxNormal}`}
                >
                  <span className={fieldLabel}>What are you looking for? *</span>
                  <select
                    name="intent"
                    value={intent}
                    onChange={(e) => {
                      setIntent(e.target.value as '' | Intent)
                      clearError('intent')
                    }}
                    aria-invalid={errors.intent ? true : undefined}
                    className={`${fieldInput} -ml-0.5 ${intent ? 'text-ink' : 'text-muted-foreground/60'}`}
                  >
                    <option value="">Select one</option>
                    <option value="hiring">I&rsquo;m hiring</option>
                    <option value="candidate">I&rsquo;m looking for a role</option>
                  </select>
                  <FieldError message={errors.intent?.[0]} />
                </label>

                <label
                  className={`${fieldBox} ${errors.message ? fieldBoxError : fieldBoxNormal}`}
                >
                  <span className={fieldLabel}>Message *</span>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder={
                      intent === 'candidate'
                        ? 'Tell us what you\u2019re great at and the role you want next.'
                        : 'Tell us about the role you\u2019re hiring for.'
                    }
                    onChange={() => clearError('message')}
                    className={`${fieldInput} resize-none`}
                  />
                  <FieldError message={errors.message?.[0]} />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 inline-flex items-center justify-center gap-2 self-start rounded-full bg-forest px-7 py-3.5 font-medium text-paper transition-colors hover:bg-forest-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:opacity-60"
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
