import type { ReactNode } from "react"
import { Hexagon, Sparkles, Share2, Workflow } from "lucide-react"

interface AuthShellProps {
  children: ReactNode
}

const FEATURES = [
  {
    title: "Real-time collaboration",
    description: "Build system architectures together with your team, live.",
    icon: Share2,
  },
  {
    title: "AI-generated designs",
    description: "Describe your system and let Ghost AI map it instantly.",
    icon: Sparkles,
  },
  {
    title: "Seamless spec export",
    description: "Generate structured Markdown technical specs from your canvas.",
    icon: Workflow,
  },
]

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-base text-copy-primary selection:bg-brand/30">
      <aside className="relative hidden w-[40%] flex-col justify-between overflow-hidden border-r border-border-default bg-surface px-10 py-10 lg:flex xl:w-1/3">
        
        {/* Subtle background glow/noise */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-ai blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand shadow-sm shadow-brand/20">
              <Hexagon className="w-5 h-5 fill-brand/20" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Ghost AI</span>
          </div>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl font-medium tracking-tight">System design, evolved.</h2>
            <p className="max-w-sm text-base leading-relaxed text-copy-secondary">
              The collaborative canvas that turns ideas into structured architectures and technical specs.
            </p>
          </div>

          <div className="space-y-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-elevated text-copy-muted">
                  <feature.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-copy-primary">{feature.title}</h3>
                  <p className="text-sm text-faint mt-1 max-w-[16rem]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-medium text-faint">
          <span>© {new Date().getFullYear()} Ghost AI</span>
          <a href="#" className="hover:text-copy-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-copy-primary transition-colors">Terms</a>
        </div>
      </aside>
      
      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        </div>
        <div className="relative w-full max-w-[420px]">
          {children}
        </div>
      </main>
    </div>
  )
}
