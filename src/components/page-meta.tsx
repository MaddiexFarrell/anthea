import type {ReactNode} from 'react'
import {Head} from 'vite-react-ssg'

/**
 * Per-page metadata, rendered server-side so prerendered HTML (and JS-disabled
 * crawlers — GPTBot, ClaudeBot, PerplexityBot, etc.) see the correct title,
 * description, canonical, social tags, and JSON-LD on every route.
 *
 * `vite-react-ssg`'s `<Head>` (react-helmet-async) emits these into the static
 * HTML at build time and keeps them in sync on client navigation. The site-wide
 * `@graph` (Organization / LegalService / WebSite / FAQPage) stays inline in
 * `index.html`; everything page-specific comes from here.
 */
export interface DocumentMeta {
  title: string
  description: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  /** JSON-LD blocks; each renders as its own `<script type="application/ld+json">`. */
  jsonLd?: Array<Record<string, unknown>>
  /** If true, instructs crawlers not to index this route. */
  noindex?: boolean
}

const ROBOTS_INDEX =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

export function PageMeta({meta}: {meta: DocumentMeta}) {
  const ogTitle = meta.ogTitle ?? meta.title
  const ogDescription = meta.ogDescription ?? meta.description
  const twitterImage = meta.twitterImage ?? meta.ogImage

  // react-helmet-async wants an array/list of plain head elements (no fragments
  // or conditional `false` children), so build the list imperatively.
  const tags: ReactNode[] = [
    <title key="title">{meta.title}</title>,
    <meta key="description" name="description" content={meta.description} />,
    <meta
      key="robots"
      name="robots"
      content={meta.noindex ? 'noindex, nofollow' : ROBOTS_INDEX}
    />,
    <meta key="og:title" property="og:title" content={ogTitle} />,
    <meta key="og:description" property="og:description" content={ogDescription} />,
    <meta key="og:type" property="og:type" content={meta.ogType ?? 'website'} />,
    <meta
      key="twitter:title"
      name="twitter:title"
      content={meta.twitterTitle ?? ogTitle}
    />,
    <meta
      key="twitter:description"
      name="twitter:description"
      content={meta.twitterDescription ?? ogDescription}
    />,
  ]

  if (meta.canonical) {
    tags.push(<link key="canonical" rel="canonical" href={meta.canonical} />)
    tags.push(<meta key="og:url" property="og:url" content={meta.canonical} />)
  }
  if (meta.ogImage) {
    tags.push(<meta key="og:image" property="og:image" content={meta.ogImage} />)
  }
  if (twitterImage) {
    tags.push(<meta key="twitter:image" name="twitter:image" content={twitterImage} />)
  }
  if (meta.jsonLd) {
    meta.jsonLd.forEach((block, index) => {
      tags.push(
        <script key={`ld-${index}`} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      )
    })
  }

  return <Head>{tags}</Head>
}
