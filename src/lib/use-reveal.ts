import {useEffect, useRef} from 'react'

/* Calm scroll-reveal. Add `reveal` (or `reveal-stagger`) to elements inside the
   returned ref's subtree; this observer adds `is-visible` once they enter the
   viewport, driving the fade + rise transition defined in index.css. Honors
   reduced-motion by simply leaving elements visible (CSS handles that). */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = root.querySelectorAll('.reveal, .reveal-stagger')
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      {threshold: 0.15, rootMargin: '0px 0px -8% 0px'}
    )

    for (const target of targets) {
      observer.observe(target)
    }
    return () => observer.disconnect()
  }, [])

  return ref
}
