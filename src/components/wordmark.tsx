/* Brand lockup. The supplied wordmark asset is dark-on-black (unusable on a
   light canvas), so the brand renders as editorial serif text in forest green —
   scalable, crisp at any size, and matching the logo's typographic character. */
export function Wordmark({className = ''}: {className?: string}) {
  return (
    <span
      className={`font-display text-forest leading-none ${className}`}
      style={{letterSpacing: '-0.01em'}}
    >
      Anthea
    </span>
  )
}
