import {Link} from 'react-router-dom'
import {Wordmark} from './wordmark'

const CONTACT_EMAIL = 'hello@antheatalent.com'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-cream px-6 pt-16 pb-10 text-ink md:px-10 md:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Wordmark className="text-3xl" />
            <p className="mt-4 text-sm text-muted leading-[1.6]">
              Where ambitious startups meet screened growth and marketing talent.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Company</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-muted">
              <li>
                <Link to="/" className="transition-colors hover:text-ink">
                  For startups
                </Link>
              </li>
              <li>
                <Link to="/candidates" className="transition-colors hover:text-ink">
                  For candidates
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-ink">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Talent</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-muted">
              <li>Growth marketing</li>
              <li>Performance &amp; paid</li>
              <li>Lifecycle &amp; CRM</li>
              <li>Content &amp; brand</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Get in touch</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-muted">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition-colors hover:text-ink"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-ink">
                  Hiring? Start here
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Anthea. All rights reserved.</p>
          <p>Growth &amp; marketing talent for fast-growing startups.</p>
        </div>
      </div>
    </footer>
  )
}
