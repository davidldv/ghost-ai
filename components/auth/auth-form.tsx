"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
  callbackUrl?: string
}

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

  const title = mode === "sign-in" ? "Sign in to Ghost AI" : "Create your account"
  const swap =
    mode === "sign-in"
      ? { label: "New to Ghost AI?", href: "/sign-up", action: "Create an account" }
      : { label: "Already have an account?", href: "/sign-in", action: "Sign in" }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-text-muted">
          {swap.label}{" "}
          <a href={swap.href} className="text-accent-primary hover:underline">
            {swap.action}
          </a>
        </p>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center bg-bg-elevated border-border-default text-text-primary hover:bg-bg-subtle"
          disabled={pending !== null}
          onClick={() => oauth("google")}
        >
          {pending === "google" ? "Redirecting…" : "Continue with Google"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center bg-bg-elevated border-border-default text-text-primary hover:bg-bg-subtle"
          disabled={pending !== null}
          onClick={() => oauth("github")}
        >
          {pending === "github" ? "Redirecting…" : "Continue with GitHub"}
        </Button>
      </div>

      <div className="flex items-center gap-3 text-xs text-text-faint">
        <span className="h-px flex-1 bg-border-default" />
        OR
        <span className="h-px flex-1 bg-border-default" />
      </div>

      <form onSubmit={onEmail} className="space-y-3">
        <Input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-bg-elevated border-border-default text-text-primary placeholder:text-text-faint"
        />
        <Button
          type="submit"
          className="w-full bg-accent-primary text-bg-base hover:opacity-90"
          disabled={pending !== null || email.length === 0}
        >
          {pending === "email" ? "Sending…" : "Sign in with Email"}
        </Button>
      </form>

      <p className="text-xs text-text-faint text-center">
        By continuing you agree to the terms of use.
      </p>
    </div>
  )
}
