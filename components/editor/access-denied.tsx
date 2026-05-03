import Link from "next/link"
import { Lock } from "lucide-react"

export function AccessDenied() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-base">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-ai/15 blur-3xl" />
      </div>

      <div className="relative flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-border-default/80 bg-bg-surface/80 px-7 py-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-default bg-bg-elevated">
          <Lock className="h-5 w-5 text-text-muted" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-text-primary">Access Denied</h1>
          <p className="text-sm text-text-secondary">
            This project doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
        </div>
        <Link
          href="/editor"
          className="rounded-xl border border-border-default/70 bg-bg-elevated px-3 py-1.5 text-sm text-text-primary transition-colors hover:bg-bg-subtle"
        >
          Back to editor
        </Link>
      </div>
    </div>
  )
}
