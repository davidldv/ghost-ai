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
    <div className="min-h-screen w-full flex bg-base text-copy-primary selection:bg-brand/30">
      <aside className="hidden lg:flex relative flex-col justify-between w-[40%] xl:w-1/3 px-10 py-10 bg-surface border-r border-border-default overflow-hidden">
        
        {/* Subtle background glow/noise */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-ai blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-sm shadow-brand/20">
              <Hexagon className="w-5 h-5 fill-brand/20" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Ghost AI</span>
          </div>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl font-medium tracking-tight">System design, evolved.</h2>
            <p className="text-copy-secondary text-base leading-relaxed max-w-sm">
              The collaborative canvas that turns ideas into structured architectures and technical specs.
            </p>
          </div>

          <div className="space-y-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-lg bg-elevated border border-border-subtle flex items-center justify-center text-copy-muted">
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

        <div className="relative z-10 flex items-center gap-4 text-xs text-faint font-medium">
          <span>© {new Date().getFullYear()} Ghost AI</span>
          <a href="#" className="hover:text-copy-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-copy-primary transition-colors">Terms</a>
        </div>
      </aside>
      
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>
    </div>
  )
}
