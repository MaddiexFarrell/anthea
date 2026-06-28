export function PlaceholderPage({title}: {title: string}) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="eyebrow mb-2">Admin</p>
        <h1 className="font-display text-4xl text-forest">{title}</h1>
      </header>
      <div className="rounded-xl border border-dashed border-border-strong bg-surface p-10 text-center">
        <p className="text-sm text-muted">Coming soon.</p>
      </div>
    </div>
  )
}
