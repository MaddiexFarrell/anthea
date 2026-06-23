import {Link} from 'react-router-dom'
import {type DocumentMeta, PageMeta} from '../components/page-meta'
import {SiteFooter} from '../components/site-footer'
import {SiteHeader} from '../components/site-header'
import {useReveal} from '../lib/use-reveal'

const HOME_META: DocumentMeta = {
  title: 'Anthea — Hire screened growth & marketing talent for startups',
  description:
    'Anthea helps fast-growing startups hire growth and marketing talent. We screen, meet, and interview candidates before any introduction, so you only spend time with people who fit the role.',
  canonical: 'https://antheatalent.com/',
  ogImage: 'https://antheatalent.com/hero.jpg',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://antheatalent.com/#webpage',
      url: 'https://antheatalent.com/',
      name: 'Anthea — Hire screened growth & marketing talent for startups',
      description:
        'Anthea helps fast-growing startups hire screened growth and marketing talent — reviewed, met, and interviewed before any introduction.',
      isPartOf: {'@id': 'https://antheatalent.com/#website'},
      about: {'@id': 'https://antheatalent.com/#agency'},
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: 'https://antheatalent.com/hero.jpg',
      },
      inLanguage: 'en-US',
    },
  ],
}

const companyValues = [
  {
    title: 'Only people who fit',
    body: 'We review, meet, and interview every candidate before an introduction. You spend your time on a shortlist, not a stack of resumes.',
  },
  {
    title: 'Built for growth roles',
    body: 'We specialize in growth and marketing — performance, lifecycle, content, and brand — so we know what good actually looks like.',
  },
  {
    title: 'Days, not weeks',
    body: 'Once we understand the role, we move fast. A curated shortlist lands in days, with context on every candidate from the start.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Screen',
    body: 'We review each candidate\u2019s background, skills, and growth/marketing fit before anyone moves forward.',
  },
  {
    n: '02',
    title: 'Meet',
    body: 'We talk with candidates to understand their goals, strengths, and what they\u2019re looking for next.',
  },
  {
    n: '03',
    title: 'Interview',
    body: 'We run a structured interview so every candidate is assessed consistently and you get a clear read.',
  },
  {
    n: '04',
    title: 'Match',
    body: 'We introduce a curated shortlist of candidates to the startups that fit them best.',
  },
]

const talentAreas = [
  'Growth Marketing',
  'Performance & Paid',
  'Lifecycle & CRM',
  'Content & Brand',
  'Product Marketing',
  'Marketing Analytics',
  'SEO & Organic',
  'Community & Social',
]

export function Home() {
  const reveal = useReveal()

  return (
    <div className="min-h-screen bg-paper text-ink">
      <PageMeta meta={HOME_META} />
      <SiteHeader />

      <main ref={reveal}>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-32 pb-16 md:px-10 md:pt-40 md:pb-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="reveal">
              <p className="eyebrow">For fast-growing startups</p>
              <h1 className="font-display mt-5 text-[44px] leading-[1.02] text-ink sm:text-[56px] md:text-[68px] lg:text-[74px]">
                Hire growth talent,
                <br />
                <span className="text-forest italic">screened for fit.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted leading-[1.6]">
                Anthea helps startups meet screened growth and marketing talent. We
                review, meet, and interview candidates before making introductions — so
                you only spend time with people who fit the role.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/contact?intent=hiring"
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-medium text-paper transition-colors hover:bg-forest-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                >
                  Start hiring
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  to="/candidates"
                  className="inline-flex items-center gap-2 rounded-full border border-border-strong px-7 py-3.5 font-medium text-ink transition-colors hover:border-forest hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                >
                  I&rsquo;m a candidate
                </Link>
              </div>
            </div>

            <div className="reveal" style={{transitionDelay: '120ms'}}>
              <div className="relative">
                <div className="overflow-hidden rounded-xl shadow-[0_30px_80px_-40px_rgba(6,36,23,0.45)]">
                  <img
                    src="/hero.jpg"
                    alt="Growth and marketing professionals connecting at a startup event"
                    className="aspect-[4/3] h-full w-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-border bg-surface px-5 py-4 shadow-[0_20px_50px_-30px_rgba(6,36,23,0.5)] sm:block md:-left-6">
                  <p className="font-display text-3xl text-forest">Screened</p>
                  <p className="mt-0.5 text-xs text-muted">before you meet them</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Positioning strip */}
        <section className="border-y border-border bg-sage-soft">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 py-5 text-center text-sm font-medium text-forest md:gap-x-6">
            <span>Screened</span>
            <Dot />
            <span>Met</span>
            <Dot />
            <span>Interviewed</span>
            <Dot />
            <span>Matched</span>
          </div>
        </section>

        {/* Value props for companies */}
        <section className="px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow">For companies</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                Meet screened growth and marketing talent.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted leading-[1.6]">
                Hiring for growth is hard when every channel sends noise. Anthea does the
                first pass for you, so the only candidates you meet are ones worth your
                time.
              </p>
            </div>

            <div className="reveal-stagger mt-14 grid gap-5 md:grid-cols-3">
              {companyValues.map((value, i) => (
                <div
                  key={value.title}
                  style={{['--i' as string]: i}}
                  className="rounded-xl border border-border bg-surface p-7 transition-shadow hover:shadow-[0_24px_60px_-40px_rgba(6,36,23,0.45)]"
                >
                  <h3 className="font-display text-2xl text-ink">{value.title}</h3>
                  <p className="mt-3 text-[15px] text-muted leading-[1.6]">
                    {value.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How we work */}
        <section id="how" className="bg-cream px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow">How we work</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                Screened, met, and matched.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted leading-[1.6]">
                We get to know both the company and the candidate before making an
                introduction, so every match has context from the start.
              </p>
            </div>

            <div className="reveal-stagger mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div
                  key={step.n}
                  style={{['--i' as string]: i}}
                  className="flex flex-col gap-4 bg-surface p-7"
                >
                  <span className="font-display text-3xl text-forest/35">{step.n}</span>
                  <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="text-[15px] text-muted leading-[1.6]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Talent areas */}
        <section id="talent" className="px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="reveal">
              <p className="eyebrow">What we cover</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                Built for the roles that drive growth.
              </h2>
              <p className="mt-5 max-w-md text-lg text-muted leading-[1.6]">
                From your first growth hire to a full marketing bench, we focus on the
                disciplines that move the metrics startups care about.
              </p>
            </div>

            <ul className="reveal-stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
              {talentAreas.map((area, i) => (
                <li
                  key={area}
                  style={{['--i' as string]: i}}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-4 text-base font-medium text-ink"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA band */}
        <section className="px-6 pb-24 md:px-10">
          <div className="reveal mx-auto max-w-7xl overflow-hidden rounded-2xl bg-forest-deep px-8 py-16 text-paper md:px-16 md:py-24">
            <div className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
              <div>
                <h2 className="font-display text-[34px] leading-[1.05] md:text-[48px]">
                  Ready to meet your next growth hire?
                </h2>
                <p className="mt-5 max-w-xl text-lg text-paper/70 leading-[1.6]">
                  Tell us about the role and we&rsquo;ll come back with a curated
                  shortlist of screened candidates — usually within days.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Link
                  to="/contact?intent=hiring"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-paper px-8 py-4 font-medium text-forest-deep transition-colors hover:bg-white md:w-auto"
                >
                  Start hiring
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  to="/candidates"
                  className="text-sm text-paper/60 underline-offset-4 transition-colors hover:text-paper hover:underline"
                >
                  Looking for a role instead?
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function Dot() {
  return <span aria-hidden="true" className="h-1 w-1 rounded-full bg-forest/40" />
}
