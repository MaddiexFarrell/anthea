import {Link} from 'react-router-dom'
import {type DocumentMeta, PageMeta} from '../components/page-meta'
import {SiteFooter} from '../components/site-footer'
import {SiteHeader} from '../components/site-header'
import {useReveal} from '../lib/use-reveal'

const CANDIDATES_META: DocumentMeta = {
  title: 'For candidates — Get matched with growth & marketing roles | Anthea',
  description:
    'Anthea works with early-career candidates looking for internships and new grad roles in growth and marketing. We learn what you\u2019re good at, what you want next, and match you with startups where you\u2019ll grow.',
  canonical: 'https://antheatalent.com/candidates',
  ogImage: 'https://antheatalent.com/hero.jpg',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://antheatalent.com/candidates#webpage',
      url: 'https://antheatalent.com/candidates',
      name: 'For candidates — Get matched with growth & marketing roles',
      description:
        'Anthea matches early-career growth and marketing candidates with fast-growing startups through a screened, structured process.',
      isPartOf: {'@id': 'https://antheatalent.com/#website'},
      about: {'@id': 'https://antheatalent.com/#agency'},
      inLanguage: 'en-US',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: 'Home', item: 'https://antheatalent.com/'},
        {
          '@type': 'ListItem',
          position: 2,
          name: 'For candidates',
          item: 'https://antheatalent.com/candidates',
        },
      ],
    },
  ],
}

const benefits = [
  {
    title: 'Matched to your strengths',
    body: 'We learn what you\u2019re actually good at and what you want next, then introduce you where it fits — not wherever there\u2019s an opening.',
  },
  {
    title: 'A real conversation',
    body: 'No black-box applications. We meet you, understand your goals, and give you a clear, structured read on where you stand.',
  },
  {
    title: 'Rooms with room to grow',
    body: 'We work with fast-growing startups where early-career talent gets real ownership and a path to grow quickly.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Apply',
    body: 'Tell us about your background, your strengths, and the kind of growth or marketing role you\u2019re looking for next.',
  },
  {
    n: '02',
    title: 'Meet',
    body: 'We talk through your goals and what you\u2019re great at, so we can represent you well to the right teams.',
  },
  {
    n: '03',
    title: 'Interview',
    body: 'A structured interview gives every candidate a fair, consistent read — and gives you useful feedback.',
  },
  {
    n: '04',
    title: 'Get matched',
    body: 'We introduce you to startups where your strengths fit the role, with context on both sides from the start.',
  },
]

export function Candidates() {
  const reveal = useReveal()

  return (
    <div className="min-h-screen bg-paper text-ink">
      <PageMeta meta={CANDIDATES_META} />
      <SiteHeader />

      <main ref={reveal}>
        {/* Hero — centered, with a full-bleed image band below */}
        <section className="px-6 pt-32 pb-12 text-center md:pt-44 md:pb-16">
          <div className="reveal mx-auto max-w-3xl">
            <p className="eyebrow">For candidates</p>
            <h1 className="font-display mt-5 text-[44px] leading-[1.02] sm:text-[56px] md:text-[68px]">
              Get matched with roles that
              <br className="hidden sm:block" /> fit your{' '}
              <span className="text-forest italic">strengths.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted leading-[1.6]">
              Anthea works with early-career candidates looking for internships and new
              grad roles in growth and marketing. We learn what you&rsquo;re good at, what
              you want next, and where you&rsquo;ll have room to grow.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/contact?intent=candidate"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-medium text-paper transition-colors hover:bg-forest-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
              >
                Apply now
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-border-strong px-7 py-3.5 font-medium text-ink transition-colors hover:border-forest hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
              >
                I&rsquo;m hiring
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-10 md:pb-28">
          <div className="reveal mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-2xl shadow-[0_30px_80px_-50px_rgba(6,36,23,0.5)]">
              <img
                src="/hero.jpg"
                alt="Early-career growth and marketing candidates meeting startup teams"
                className="aspect-[21/9] h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-cream px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow">Why Anthea</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                Representation that actually knows you.
              </h2>
            </div>
            <div className="reveal-stagger mt-14 grid gap-5 md:grid-cols-3">
              {benefits.map((benefit, i) => (
                <div
                  key={benefit.title}
                  style={{['--i' as string]: i}}
                  className="rounded-xl border border-border bg-surface p-7"
                >
                  <h3 className="font-display text-2xl text-ink">{benefit.title}</h3>
                  <p className="mt-3 text-[15px] text-muted leading-[1.6]">
                    {benefit.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works for candidates */}
        <section className="px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow">How it works</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                From application to a real introduction.
              </h2>
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

        {/* CTA */}
        <section className="px-6 pb-24 md:px-10">
          <div className="reveal mx-auto max-w-7xl overflow-hidden rounded-2xl bg-forest-deep px-8 py-16 text-center text-paper md:px-16 md:py-24">
            <h2 className="font-display mx-auto max-w-3xl text-[34px] leading-[1.05] md:text-[48px]">
              Ready to be matched?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-paper/70 leading-[1.6]">
              Send us your background and what you&rsquo;re looking for. We&rsquo;ll be in
              touch within 24 hours.
            </p>
            <div className="mt-9 flex justify-center">
              <Link
                to="/contact?intent=candidate"
                className="inline-flex items-center gap-2 rounded-full bg-paper px-8 py-4 font-medium text-forest-deep transition-colors hover:bg-white"
              >
                Apply now
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
