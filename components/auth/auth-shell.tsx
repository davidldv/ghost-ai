import type { ReactNode } from "react"

interface AuthShellProps {
  children: ReactNode
}

const FEATURES = [
  "Real-time collaborative canvas",
  "AI-generated system designs",
  "Curated starter templates",
  "Markdown spec export",
]

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex bg-bg-base text-text-primary">
      <aside className="hidden lg:flex flex-col justify-between w-1/2 px-12 py-10 border-r border-border-default bg-bg-surface">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-accent-primary-dim border border-border-subtle" />
          <span className="font-semibold tracking-tight">Ghost AI</span>
        </div>
        <div className="space-y-6 max-w-sm">
          <p className="text-text-secondary text-sm leading-relaxed">
            Collaborative system design workspace. Describe a system, let AI map it, refine with your team, export the spec.
          </p>
          <ul className="space-y-2 text-sm text-text-muted">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-text-faint" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-text-faint">© Ghost AI</p>
      </aside>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
