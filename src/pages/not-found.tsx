import {Link} from 'react-router-dom'
import {type DocumentMeta, PageMeta} from '../components/page-meta'

/* Catch-all 404. noindex so crawlers don't index unknown URLs. */
const NOT_FOUND_META: DocumentMeta = {
  title: 'Page not found — Anthea',
  description: 'The page you were looking for could not be found.',
  noindex: true,
}

export function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-paper px-6 text-center text-ink">
      <PageMeta meta={NOT_FOUND_META} />
      <p className="eyebrow">404</p>
      <h1 className="font-display text-4xl text-ink md:text-5xl">Page not found</h1>
      <p className="max-w-md text-lg text-muted leading-[1.5]">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center rounded-full bg-forest px-6 py-3 font-medium text-paper transition-colors hover:bg-forest-hover"
      >
        Back to home
      </Link>
    </main>
  )
}
