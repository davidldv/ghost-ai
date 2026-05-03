"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
  callbackUrl?: string
}

// Minimal Google Icon SVG since Lucide doesn't have it
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

// Minimal GitHub Icon SVG
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path
      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.585 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .33.225.705.825.585C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"
    />
  </svg>
)

export function AuthForm({ mode, callbackUrl = "/editor" }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState<string | null>(null)

  const oauth = (provider: "github" | "google") => {
    setPending(provider)
    void signIn(provider, { callbackUrl })
  }

  const onEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setPending("email")
    void signIn("email", { email, callbackUrl })
  }

  const isSignIn = mode === "sign-in"
  const title = isSignIn ? "Welcome back" : "Create an account"
  const subtitle = isSignIn ? "Sign in to your Ghost AI account to continue." : "Sign up to start building system architectures."
  const swap = isSignIn
      ? { label: "Don't have an account?", href: "/sign-up", action: "Sign up" }
      : { label: "Already have an account?", href: "/sign-in", action: "Sign in" }

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-border-default/80 bg-surface/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand/10 to-transparent" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">{title}</h1>
        <p className="text-sm text-copy-secondary">{subtitle}</p>
      </div>

      <div className="grid gap-3">
        <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-border-subtle bg-elevated font-medium text-copy-primary transition-all hover:border-border-default hover:bg-subtle"
            disabled={pending !== null}
            onClick={() => oauth("google")}
        >
            {pending === "google" ? <Loader2 className="mr-3 h-4 w-4 animate-spin text-copy-muted" /> : <GoogleIcon className="mr-3 h-4 w-4" />}
            Continue with Google
        </Button>
        <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-border-subtle bg-elevated font-medium text-copy-primary transition-all hover:border-border-default hover:bg-subtle"
            disabled={pending !== null}
            onClick={() => oauth("github")}
        >
            {pending === "github" ? <Loader2 className="mr-3 h-4 w-4 animate-spin text-copy-muted" /> : <GithubIcon className="mr-3 h-4 w-4" />}
            Continue with GitHub
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border-default" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-surface px-3 text-faint font-semibold">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={onEmail} className="space-y-4">
        <div className="space-y-2">
            <Input
            id="email"
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border-border-subtle bg-base px-4 text-copy-primary placeholder:text-faint transition-colors hover:border-border-default focus:border-brand"
            />
        </div>
        <Button
          type="submit"
          className="group flex h-11 w-full items-center justify-center rounded-xl bg-brand text-base font-semibold shadow-lg shadow-brand/25 transition-all hover:opacity-90"
          disabled={pending !== null || email.length === 0}
        >
          {pending === "email" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              {isSignIn ? "Sign in with Email" : "Send magic link"}
              <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
            </>
          )}
        </Button>
      </form>

       <p className="mt-2 rounded-xl border border-border-subtle/50 bg-base/40 px-4 py-3.5 text-center text-[13px] text-copy-muted">
        {swap.label}{" "}
        <a href={swap.href} className="text-copy-primary hover:text-brand font-medium transition-colors">
          {swap.action}
        </a>
      </p>
    </div>
  )
}
