import {Handshake, Sprout, Target} from 'lucide-react'
import {Link} from 'react-router-dom'
import {IconBadge} from '../components/icon-badge'
import {type DocumentMeta, PageMeta} from '../components/page-meta'
import {SiteFooter} from '../components/site-footer'
import {SiteHeader} from '../components/site-header'
import {useReveal} from '../lib/use-reveal'

const CANDIDATES_META: DocumentMeta = {
  title: 'For candidates — Become the talent startups are after | Anthea',
  description:
    'Anthea works with the growth and marketing talent startups are after — the social, camera-ready, in-demand profiles building the next wave of brands. We learn what makes you stand out and introduce you to the teams that want exactly that.',
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
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://antheatalent.com/',
        },
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
    body: 'We introduce you to startups where your strengths fit the role, with context on both sides.',
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
              Be the talent startups
              <br className="hidden sm:block" /> are{' '}
              <span className="text-forest italic">after.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted leading-[1.6]">
              Anthea is for early-career growth and marketing talent with taste, energy,
              and the kind of presence people remember. We get to know what makes you
              stand out, then introduce you to startups looking for someone exactly like
              you.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/contact?intent=candidate"
                className="inline-flex items-center gap-2 rounded-lg bg-forest px-7 py-3.5 font-medium text-paper transition-colors hover:bg-forest-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
              >
                Apply now
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-7 py-3.5 font-medium text-ink transition-colors hover:border-forest hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
              >
                I&rsquo;m hiring
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-10 md:pb-28">
          <div className="reveal mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-2xl shadow-card">
              <img
                src="/images/candidates-feature.jpg"
                alt="Anthea community members connecting at a networking event"
                className="aspect-[21/9] h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Bento — everything you need to get matched */}
        <section className="px-6 pb-20 md:px-10 md:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow">Why Anthea</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                Representation that makes you{' '}
                <span className="text-faded">impossible to ignore.</span>
              </h2>
            </div>

            <div className="reveal-stagger mt-14 grid gap-4 md:grid-cols-3">
              {/* Large image card */}
              <div
                style={{['--i' as string]: 0}}
                className="relative min-h-[320px] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2"
              >
                <img
                  src="/images/conversation.jpg"
                  alt="A candidate in a real, friendly conversation with a recruiter"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/25 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-8 text-paper">
                  <h3 className="font-display text-3xl">A real conversation</h3>
                  <p className="mt-2 max-w-md text-[15px] text-paper/80 leading-[1.6]">
                    No black-box applications. We meet you, learn what you&rsquo;re good
                    at, and give you a clear, structured read on where you stand.
                  </p>
                </div>
              </div>

              {/* Matched to strengths */}
              <div
                style={{['--i' as string]: 1}}
                className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7"
              >
                <IconBadge icon={Target} />
                <div>
                  <h3 className="font-display text-2xl text-ink">
                    Matched to your strengths
                  </h3>
                  <p className="mt-2 text-[15px] text-muted leading-[1.6]">
                    We introduce you where your strengths, goals, and energy actually
                    fit. Not just wherever there&rsquo;s an opening.
                  </p>
                </div>
              </div>

              {/* Rooms to grow (highlight) */}
              <div
                style={{['--i' as string]: 2}}
                className="flex flex-col gap-5 rounded-2xl border border-highlight/70 bg-highlight/35 p-7"
              >
                <IconBadge icon={Sprout} tone="highlight" />
                <div>
                  <h3 className="font-display text-2xl text-ink">
                    Rooms with room to grow
                  </h3>
                  <p className="mt-2 text-[15px] text-highlight-ink/80 leading-[1.6]">
                    Fast-growing startups where early-career talent can get real
                    ownership, learn quickly, and make a visible impact.
                  </p>
                </div>
              </div>

              {/* Warm intros (wide) */}
              <div
                style={{['--i' as string]: 3}}
                className="grid gap-6 rounded-2xl border border-border bg-surface p-7 md:col-span-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center md:gap-10"
              >
                <div className="flex items-center gap-5">
                  <IconBadge icon={Handshake} />
                  <h3 className="font-display text-2xl text-ink">
                    Introduced, not forwarded
                  </h3>
                </div>
                <p className="text-[15px] text-muted leading-[1.6] md:border-l md:border-border md:pl-10">
                  When there&rsquo;s a fit, we introduce you directly to the hiring team
                  with context, so you walk in already understood instead of sitting in
                  another inbox.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dark forest process section */}
        <section className="relative overflow-hidden bg-forest-deep px-6 py-20 text-paper md:px-10 md:py-28">
          <div className="fx-grid-on-dark pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow" style={{color: 'var(--color-highlight)'}}>
                How it works
              </p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                From application{' '}
                <span className="text-paper/45">to a real introduction.</span>
              </h2>
            </div>
            <div className="reveal-stagger mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div
                  key={step.n}
                  style={{['--i' as string]: i}}
                  className="flex flex-col gap-4 rounded-2xl border border-paper/12 bg-paper/[0.04] p-7"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-highlight font-display text-lg leading-none text-highlight-ink">
                    <span className="translate-y-[1px]">{step.n}</span>
                  </span>
                  <h3 className="text-lg font-semibold text-paper">{step.title}</h3>
                  <p className="text-[15px] text-paper/65 leading-[1.6]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Faces strip — you'll be in good company */}
        <section className="px-6 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="reveal text-center">
              <p className="eyebrow">The community</p>
              <h2 className="font-display mx-auto mt-4 max-w-2xl text-[30px] leading-[1.1] md:text-[42px]">
                You&rsquo;ll be in good company.
              </h2>
            </div>
            <div className="reveal-stagger mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {src: '/images/portrait-1.jpg', alt: 'An Anthea community member in conversation at an event'},
                {src: '/images/community-rooftop.jpg', alt: 'Anthea community members laughing over drinks at a rooftop happy hour'},
                {src: '/images/community-speaker.jpg', alt: 'An Anthea candidate speaking at a marketing event'},
                {src: '/images/community-standing.jpg', alt: 'Anthea candidates working on laptops by a sunlit window'},
              ].map((img, i) => (
                <div
                  key={img.src}
                  style={{['--i' as string]: i}}
                  className="overflow-hidden rounded-xl shadow-card"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="aspect-[3/4] h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24 md:px-10">
          <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-border bg-cream px-8 py-16 text-center md:px-16 md:py-24">
            <h2 className="font-display mx-auto max-w-3xl text-[34px] leading-[1.05] md:text-[48px]">
              Ready to be matched?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted leading-[1.6]">
              Send us your background, what you&rsquo;re good at, and what kind of role
              you want next. If there&rsquo;s a fit, we&rsquo;ll reach out with next
              steps.
            </p>
            <div className="mt-9 flex justify-center">
              <Link
                to="/contact?intent=candidate"
                className="inline-flex items-center gap-2 rounded-lg bg-forest px-8 py-4 font-medium text-paper transition-colors hover:bg-forest-hover"
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
