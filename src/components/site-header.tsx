import {useEffect, useState} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {Wordmark} from './wordmark'

const navLinks = [
  {label: 'For startups', to: '/'},
  {label: 'For candidates', to: '/candidates'},
]

/* Sticky, translucent header. A hairline border fades in once the page is
   scrolled so the hero reads as edge-to-edge on load. */
export function SiteHeader() {
  const [pinned, setPinned] = useState(false)
  const {pathname} = useLocation()

  useEffect(() => {
    const onScroll = () => setPinned(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        pinned
          ? 'border-b border-border bg-paper/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10 md:py-5">
        <Link
          to="/"
          aria-label="Anthea home"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          <Wordmark className="h-6 w-auto md:h-7" />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 md:gap-6">
          {navLinks.map((link) => {
            const active = link.to === pathname
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`hidden rounded-md px-2 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 sm:inline-flex ${
                  active ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 font-medium text-[13px] text-paper transition-colors hover:bg-forest-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          >
            Get started
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
