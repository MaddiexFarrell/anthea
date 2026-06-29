/** Shown when nobody is logged in. Links to Django's Google login; after a
    successful sign-in Django redirects back here (see FRONTEND_URL).

    Split layout: sign-in panel on the left, full-bleed brand photo on the
    right (hidden on small screens). */
export function SignIn() {
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="flex w-full flex-col items-center justify-center px-6 py-10 text-center sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <img
            src="/anthea-logo.png"
            alt="Anthea"
            draggable={false}
            className="mx-auto mb-8 h-8 w-auto -translate-y-10 select-none"
          />
          <h1 className="font-display text-4xl text-forest">Welcome back</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
            Review and manage candidates.
          </p>
          <a
            href="/accounts/google/login/"
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-hover"
          >
            <GoogleMark />
            Continue with Google
          </a>
        </div>
      </div>

      <div className="hidden p-3 lg:block lg:w-1/2">
        <div className="relative h-full w-full overflow-hidden rounded-[20px]">
          <img
            src="/images/conversation.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
