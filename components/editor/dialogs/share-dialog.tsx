"use client"

import { useEffect, useState, useCallback } from "react"
import { Copy, Check, UserMinus, UserPlus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Collaborator {
  email: string
  name: string | null
  avatar: string | null
}

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  isOwner: boolean
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  isOwner,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loadingCollabs, setLoadingCollabs] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCollaborators = useCallback(async () => {
    setLoadingCollabs(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`)
      if (res.ok) {
        const data = (await res.json()) as { collaborators: Collaborator[] }
        setCollaborators(data.collaborators)
      }
    } finally {
      setLoadingCollabs(false)
    }
  }, [projectId])

  useEffect(() => {
    if (open) {
      setInviteEmail("")
      setError(null)
      fetchCollaborators()
    }
  }, [open, fetchCollaborators])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? "Invite failed")
        return
      }
      setInviteEmail("")
      await fetchCollaborators()
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(email: string) {
    setRemovingEmail(email)
    try {
      await fetch(
        `/api/projects/${projectId}/collaborators/${encodeURIComponent(email)}`,
        { method: "DELETE" }
      )
      await fetchCollaborators()
    } finally {
      setRemovingEmail(null)
    }
  }

  function handleCopyLink() {
    void navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Invite people by email or copy the project link."
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {isOwner && (
            <form className="flex gap-2" onSubmit={handleInvite}>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 h-10 bg-bg-base border border-border-default rounded-xl px-3 text-sm text-text-primary placeholder:text-text-faint focus-visible:border-accent-primary focus-visible:ring-1 focus-visible:ring-accent-primary"
                disabled={inviting}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inviteEmail.trim() || inviting}
                className="h-10 px-4 rounded-xl gap-1.5"
              >
                {inviting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
                Invite
              </Button>
            </form>
          )}

          {error && <p className="text-xs text-state-error">{error}</p>}

          <div className="flex flex-col gap-1">
            {loadingCollabs ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
              </div>
            ) : collaborators.length === 0 ? (
              <p className="text-sm text-text-muted py-2">No collaborators yet.</p>
            ) : (
              collaborators.map((c) => (
                <div
                  key={c.email}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-bg-subtle transition-colors"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-elevated border border-border-default overflow-hidden">
                    {c.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.avatar}
                        alt={c.name ?? c.email}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-text-muted">
                        {(c.name ?? c.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {c.name && (
                      <p className="text-sm text-text-primary truncate">{c.name}</p>
                    )}
                    <p
                      className={`text-xs truncate ${
                        c.name ? "text-text-muted" : "text-text-secondary"
                      }`}
                    >
                      {c.email}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => void handleRemove(c.email)}
                      disabled={removingEmail === c.email}
                      className="shrink-0 text-text-muted hover:text-state-error"
                    >
                      {removingEmail === c.email ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserMinus className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border-default pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="w-full gap-2 h-9 rounded-xl text-text-secondary hover:text-text-primary"
            >
              {copied ? (
                <Check className="h-4 w-4 text-state-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy project link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
