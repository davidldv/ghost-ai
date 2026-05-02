import Link from "next/link"
import { Lock } from "lucide-react"

export function AccessDenied() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-bg-elevated border border-border-default">
          <Lock className="h-5 w-5 text-text-muted" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-text-primary">Access Denied</h1>
          <p className="text-sm text-text-secondary">
            This project doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
        </div>
        <Link href="/editor" className="text-sm text-accent-primary hover:underline">
          Back to editor
        </Link>
      </div>
    </div>
  )
}
