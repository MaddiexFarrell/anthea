import {BadgeCheck, ClipboardCheck, Handshake, Users} from 'lucide-react'
import {Link} from 'react-router-dom'
import {IconBadge} from '../components/icon-badge'
import {type DocumentMeta, PageMeta} from '../components/page-meta'
import {SiteFooter} from '../components/site-footer'
import {SiteHeader} from '../components/site-header'
import {useReveal} from '../lib/use-reveal'

const HOME_META: DocumentMeta = {
  title: 'Anthea — Hire growth & marketing talent with presence',
  description:
    'Anthea is a community of magnetic, in-demand growth and marketing talent — the polished, social, camera-ready people fast-growing startups build their brand around. Pre-screened for skill and presence, with simple flat-fee pricing — $4,000 per intern, $10,000 per full-time hire.',
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

const stats = [
  {value: '260+', label: 'In-demand talent in our network'},
  {value: 'Days', label: 'From brief to a shortlist'},
  {value: '100%', label: 'Vetted for skill and presence'},
  {value: '$0', label: 'Until you make a hire'},
]

const pricing = [
  {
    name: 'Intern placement',
    price: '$4,000',
    unit: 'per placed intern',
    highlighted: false,
  },
  {
    name: 'Full-time hire',
    price: '$10,000',
    unit: 'per placed full-time hire',
    highlighted: true,
  },
]

const pricingFeatures = [
  'Flat fee — never a percentage of salary',
  'Contingency-based — pay only on a successful hire',
  'A curated, interviewed shortlist from our community',
  'No retainers, no upfront cost',
]

const heroCollage = {
  left: [
    {
      src: '/images/event.jpg',
      alt: 'Stylish young professionals connecting at an Anthea event',
      ratio: 'aspect-[4/3]',
    },
    {
      src: '/images/portrait-2.jpg',
      alt: 'A member of the Anthea talent community',
      ratio: 'aspect-[3/4]',
    },
  ],
  right: [
    {
      src: '/images/portrait-1.jpg',
      alt: 'A member of the Anthea talent community',
      ratio: 'aspect-[3/4]',
    },
    {
      src: '/images/creator.jpg',
      alt: 'An Anthea creator filming brand content',
      ratio: 'aspect-[4/3]',
    },
  ],
}

const galleryImages = [
  {src: '/images/portrait-1.jpg', alt: 'A member of the Anthea talent community'},
  {src: '/images/event.jpg', alt: 'Anthea community members at a rooftop gathering'},
  {src: '/images/portrait-2.jpg', alt: 'A member of the Anthea talent community'},
  {src: '/images/team-collab.jpg', alt: 'Anthea talent collaborating in studio'},
  {src: '/images/creator.jpg', alt: 'An Anthea creator filming brand content'},
  {src: '/images/portrait-3.jpg', alt: 'A member of the Anthea talent community'},
  {src: '/images/community.jpg', alt: 'Anthea community members connecting'},
  {src: '/images/conversation.jpg', alt: 'An Anthea candidate in conversation'},
]

const talentAreas = [
  'Growth Marketing',
  'Brand & Creative',
  'Social & Community',
  'Content & Creator',
  'Field & Events',
  'Partnerships & Influencer',
  'Lifecycle & CRM',
  'Product Marketing',
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
                Hire growth talent
                <br />
                <span className="text-forest italic">with presence.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted leading-[1.6]">
                Anthea is a community of magnetic, in-demand growth and marketing talent —
                the polished, social, camera-ready people fast-growing startups build
                their brand around. Pre-screened for skill <em>and</em> presence, ready to
                move.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/contact?intent=hiring"
                  className="inline-flex items-center gap-2 rounded-lg bg-forest px-7 py-3.5 font-medium text-paper transition-colors hover:bg-forest-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                >
                  Start hiring
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  to="/candidates"
                  className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-7 py-3.5 font-medium text-ink transition-colors hover:border-forest hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                >
                  I&rsquo;m a candidate
                </Link>
              </div>
              <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span>Screened for skill &amp; presence</span>
                <Dot />
                <span>Shortlist in days</span>
                <Dot />
                <span>Pay only when you hire</span>
              </p>
            </div>

            <div className="reveal" style={{transitionDelay: '120ms'}}>
              <div className="relative">
                {/* soft accent glow for depth */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-sage/50 blur-3xl"
                />

                {/* Staggered multi-image collage */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="mt-10 flex flex-col gap-3 sm:gap-4">
                    {heroCollage.left.map((img, i) => (
                      <HeroPhoto key={img.src} {...img} eager={i === 0} />
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {heroCollage.right.map((img, i) => (
                      <HeroPhoto key={img.src} {...img} eager={i === 0} />
                    ))}
                  </div>
                </div>

                {/* Floating stat caption (not a product UI) */}
                <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-xl border border-border bg-surface/95 px-5 py-4 shadow-float backdrop-blur sm:flex md:-left-8">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sage text-forest">
                    <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-2xl leading-none text-ink">260+</p>
                    <p className="mt-1 text-xs text-muted">
                      in-demand talent in our network
                    </p>
                  </div>
                </div>

                {/* Floating verified caption */}
                <div className="absolute -top-3 -right-2 hidden items-center gap-2 rounded-lg bg-forest-deep px-4 py-2.5 text-paper shadow-float sm:flex md:-right-6">
                  <BadgeCheck
                    className="h-4 w-4 text-highlight"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="text-[13px] font-medium">Screened for presence</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
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

        {/* Bento — image-led + icon cards */}
        <section className="px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow">For companies</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                Meet talent with presence,{' '}
                <span className="text-faded">not a stack of resumes.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted leading-[1.6]">
                The startup landscape doesn&rsquo;t just want skills — it wants the people
                who make a brand impossible to ignore. We screen for both, so the only
                candidates you meet are ones worth showing off.
              </p>
            </div>

            <div className="reveal-stagger mt-14 grid gap-4 md:grid-cols-3">
              {/* A — large image card */}
              <div
                style={{['--i' as string]: 0}}
                className="relative min-h-[320px] overflow-hidden rounded-2xl md:col-span-2"
              >
                <img
                  src="/images/studio.jpg"
                  alt="Stylish young creative marketers collaborating on a brand shoot"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/25 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-8 text-paper">
                  <h3 className="font-display text-3xl">
                    Screened for skill and presence
                  </h3>
                  <p className="mt-2 max-w-md text-[15px] text-paper/80 leading-[1.6]">
                    We vet the work <em>and</em> the way they show up — the magnetic,
                    on-brand people who make a startup impossible to scroll past.
                  </p>
                </div>
              </div>

              {/* B — shortlist (icon) */}
              <div
                style={{['--i' as string]: 1}}
                className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7"
              >
                <IconBadge icon={Users} />
                <div>
                  <h3 className="font-display text-2xl text-ink">A standout shortlist</h3>
                  <p className="mt-2 text-[15px] text-muted leading-[1.6]">
                    Three to five people worth meeting — the kind who light up a room and
                    a pitch deck alike.
                  </p>
                </div>
              </div>

              {/* C — interviews (highlight) */}
              <div
                style={{['--i' as string]: 2}}
                className="flex flex-col gap-5 rounded-2xl border border-highlight/70 bg-highlight/35 p-7"
              >
                <IconBadge icon={ClipboardCheck} tone="highlight" />
                <div>
                  <h3 className="font-display text-2xl text-ink">
                    Structured interviews
                  </h3>
                  <p className="mt-2 text-[15px] text-highlight-ink/80 leading-[1.6]">
                    Every candidate assessed for craft and for how they carry a brand — so
                    the read you get is real.
                  </p>
                </div>
              </div>

              {/* D — warm intros (wide icon) */}
              <div
                style={{['--i' as string]: 3}}
                className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7 md:col-span-2 md:flex-row md:items-center md:gap-8"
              >
                <IconBadge icon={Handshake} />
                <div>
                  <h3 className="font-display text-2xl text-ink">Warm introductions</h3>
                  <p className="mt-2 max-w-lg text-[15px] text-muted leading-[1.6]">
                    When there&rsquo;s a fit, we make a direct introduction with context
                    on both sides — no cold outreach, no waiting in a queue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dark forest process section */}
        <section
          id="how"
          className="relative overflow-hidden bg-forest-deep px-6 py-20 text-paper md:px-10 md:py-28"
        >
          <div className="fx-grid-on-dark pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow text-highlight">How we work</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                Screened, met, <span className="text-paper/45">and matched.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-paper/70 leading-[1.6]">
                We get to know both the company and the candidate before making an
                introduction, so every match has context from the start.
              </p>
            </div>

            <div className="reveal-stagger mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div
                  key={step.n}
                  style={{['--i' as string]: i}}
                  className="flex flex-col gap-4 rounded-2xl border border-paper/12 bg-paper/[0.04] p-7"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-highlight font-display text-lg text-highlight-ink">
                    {step.n}
                  </span>
                  <h3 className="text-lg font-semibold text-paper">{step.title}</h3>
                  <p className="text-[15px] text-paper/65 leading-[1.6]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alternating feature rows with photography */}
        <section className="px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto flex max-w-7xl flex-col gap-20 md:gap-28">
            {/* Community / network */}
            <div className="reveal grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <p className="eyebrow">A community people want in</p>
                <h2 className="font-display mt-4 text-[30px] leading-[1.08] md:text-[42px]">
                  A network the whole <span className="text-faded">ecosystem wants.</span>
                </h2>
                <p className="mt-5 max-w-md text-lg text-muted leading-[1.6]">
                  Anthea isn&rsquo;t a job board. It&rsquo;s a tight-knit circle of the
                  most sought-after growth and marketing talent — well-connected, socially
                  fluent, and already vetted. The moment you have a role, the people
                  everyone&rsquo;s after are already in the room.
                </p>
                <ul className="mt-7 flex flex-col gap-3">
                  {[
                    'A curated circle of in-demand talent',
                    'Already met, interviewed, and reference-checked',
                    'Connected, social, and ready to represent you',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-[15px] text-ink"
                    >
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <FeatureImage
                src="/images/event.jpg"
                alt="Stylish young professionals connecting at an Anthea community event"
              />
            </div>

            {/* Fast placements */}
            <div className="reveal grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="md:order-2">
                <p className="eyebrow">Fast placements</p>
                <h2 className="font-display mt-4 text-[30px] leading-[1.08] md:text-[42px]">
                  Filled in days, <span className="text-faded">not weeks.</span>
                </h2>
                <p className="mt-5 max-w-md text-lg text-muted leading-[1.6]">
                  Because the screening is already done, we move the moment you brief us.
                  A curated shortlist lands in days, and most roles are placed before a
                  traditional search has even posted the job.
                </p>
                <ul className="mt-7 flex flex-col gap-3">
                  {[
                    'Shortlist in days, not weeks',
                    'You step in only for the final conversations',
                    'Context attached to every introduction',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-[15px] text-ink"
                    >
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:order-1">
                <FeatureImage
                  src="/images/conversation.jpg"
                  alt="A candidate being introduced to a hiring manager in conversation"
                />
              </div>
            </div>

            {/* Built for growth roles */}
            <div className="reveal grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <p className="eyebrow">The face of your brand</p>
                <h2 className="font-display mt-4 text-[30px] leading-[1.08] md:text-[42px]">
                  Built for the roles{' '}
                  <span className="text-faded">that are the brand.</span>
                </h2>
                <p className="mt-5 max-w-md text-lg text-muted leading-[1.6]">
                  Growth today is content, community, and culture as much as performance.
                  We specialize in the people-facing, camera-ready roles that put a face
                  on your company — the talent your audience actually wants to follow.
                </p>
                <Link
                  to="/contact?intent=hiring"
                  className="mt-7 inline-flex items-center gap-2 font-medium text-forest transition-colors hover:text-forest-hover"
                >
                  Tell us about the role
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
              <FeatureImage
                src="/images/creator.jpg"
                alt="A polished young creator filming social content for a brand"
              />
            </div>
          </div>
        </section>

        {/* Community gallery — lots of faces */}
        <section className="bg-cream px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="reveal max-w-3xl">
              <p className="eyebrow">The community</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                The talent the ecosystem{' '}
                <span className="text-faded">is already chasing.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted leading-[1.6]">
                A glimpse of the people in our network — polished, social, and ready to be
                the face of what you&rsquo;re building.
              </p>
            </div>

            <div className="reveal mt-12 columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
              {galleryImages.map((img) => (
                <div
                  key={img.src}
                  className="break-inside-avoid overflow-hidden rounded-xl shadow-card"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="px-6 py-16 md:px-10 md:py-20">
          <div className="reveal-stagger mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                style={{['--i' as string]: i}}
                className={`flex flex-col items-center text-center ${
                  i > 0 ? 'lg:border-l lg:border-border' : ''
                }`}
              >
                <p className="font-display text-5xl text-forest md:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-3 max-w-[20ch] text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="eyebrow">Pricing</p>
              <h2 className="font-display mt-4 text-[34px] leading-[1.08] md:text-[46px]">
                Pay only <span className="text-faded">when you hire.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted leading-[1.6]">
                No retainers and no upfront fees. Contingency-based, with a simple flat
                fee paid only when someone from our community joins your team.
              </p>
            </div>

            <div className="reveal-stagger mt-14 grid gap-5 md:grid-cols-2">
              {pricing.map((tier, i) => (
                <div
                  key={tier.name}
                  style={{['--i' as string]: i}}
                  className={`flex flex-col gap-6 rounded-2xl border p-8 md:p-9 ${
                    tier.highlighted
                      ? 'border-forest-deep bg-forest-deep text-paper'
                      : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    {tier.highlighted && (
                      <span className="rounded-md bg-highlight px-3 py-1 text-[11px] font-semibold text-highlight-ink">
                        Most common
                      </span>
                    )}
                  </div>
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-5xl md:text-6xl">
                      {tier.price}
                    </span>
                    <span
                      className={`text-sm ${tier.highlighted ? 'text-paper/60' : 'text-muted'}`}
                    >
                      {tier.unit}
                    </span>
                  </p>
                  <ul className="flex flex-col gap-3">
                    {pricingFeatures.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-3 text-[15px] leading-[1.5] ${
                          tier.highlighted ? 'text-paper/85' : 'text-muted'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            tier.highlighted
                              ? 'bg-highlight/25 text-highlight'
                              : 'bg-forest/10 text-forest'
                          }`}
                        >
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact?intent=hiring"
                    className={`mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 font-medium transition-colors ${
                      tier.highlighted
                        ? 'bg-paper text-forest-deep hover:bg-white'
                        : 'bg-forest text-paper hover:bg-forest-hover'
                    }`}
                  >
                    Start hiring
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              ))}
            </div>

            <p className="reveal mt-6 text-center text-[13px] text-muted">
              One flat fee per hire — the same whatever the salary. Questions on volume?{' '}
              <Link
                to="/contact?intent=hiring"
                className="text-forest underline-offset-4 hover:underline"
              >
                Talk to us
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Talent areas — pill cloud */}
        <section id="talent" className="px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-5xl text-center">
            <p className="eyebrow">What we cover</p>
            <h2 className="reveal font-display mx-auto mt-4 max-w-2xl text-[30px] leading-[1.1] md:text-[42px]">
              The faces behind modern growth.
            </h2>
            <div className="reveal-stagger mt-10 flex flex-wrap justify-center gap-3">
              {talentAreas.map((area, i) => (
                <span
                  key={area}
                  style={{['--i' as string]: i}}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-[15px] font-medium text-ink"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="px-6 pb-24 md:px-10">
          <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-forest-deep px-8 py-16 text-paper md:px-16 md:py-24">
            <div className="fx-grid-on-dark pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-paper px-8 py-4 font-medium text-forest-deep transition-colors hover:bg-white md:w-auto"
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

function HeroPhoto({
  src,
  alt,
  ratio,
  eager,
}: {
  src: string
  alt: string
  ratio: string
  eager?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl shadow-card sm:rounded-2xl">
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        className={`${ratio} h-full w-full object-cover transition-transform duration-700 hover:scale-[1.05]`}
      />
    </div>
  )
}

function FeatureImage({src, alt}: {src: string; alt: string}) {
  return (
    <div className="overflow-hidden rounded-2xl shadow-card">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
      />
    </div>
  )
}

function Dot() {
  return <span aria-hidden="true" className="h-1 w-1 rounded-full bg-forest/40" />
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.2l2.2 2.2 4.8-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Check() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
      <CheckIcon />
    </span>
  )
}
