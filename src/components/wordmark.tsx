/* Brand wordmark. The supplied logo is dark-on-black, so two transparent,
   recolored variants are generated into /public: forest green for light
   backgrounds and warm paper for dark backgrounds. Control size with a height
   class via `className` (e.g. "h-7 w-auto"). */
export function Wordmark({
  className = 'h-7 w-auto',
  variant = 'forest',
}: {
  className?: string
  variant?: 'forest' | 'light'
}) {
  return (
    <img
      src={variant === 'light' ? '/anthea-logo-light.png' : '/anthea-logo.png'}
      alt="Anthea"
      draggable={false}
      className={`select-none ${className}`}
    />
  )
}
