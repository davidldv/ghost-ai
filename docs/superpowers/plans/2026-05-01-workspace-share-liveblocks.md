# Workspace Shell, Share Dialog, and Liveblocks Setup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/editor/[roomId]` workspace shell with access control (spec 08), add a share dialog for collaborator management (spec 09), and configure Liveblocks realtime infrastructure (spec 10).

**Architecture:** The workspace page is a server component that verifies access via `lib/project-access.ts` before rendering a client shell. The share dialog fetches/mutates collaborators through REST API routes. Liveblocks auth is a POST route that verifies project access and issues a session token.

**Tech Stack:** Next.js 16 (App Router, RSC), NextAuth v5, Prisma 7, `@liveblocks/node`, `@liveblocks/client`

**Note:** Spec 08 and 09 reference "Clerk identity" — this project uses NextAuth. All identity helpers use NextAuth's `auth()` instead.

---

## File Map

**Created:**
- `lib/project-access.ts` — `getCurrentIdentity()` + `checkProjectAccess()` using NextAuth
- `components/editor/access-denied.tsx` — centered lock icon + back link
- `app/editor/[roomId]/page.tsx` — server component, access gate, passes data to shell
- `app/editor/[roomId]/workspace-shell.tsx` — client shell (navbar, sidebar, canvas placeholder, AI placeholder, dialogs)
- `app/api/projects/[projectId]/collaborators/route.ts` — GET list + POST invite
- `app/api/projects/[projectId]/collaborators/[collaboratorEmail]/route.ts` — DELETE remove
- `components/editor/dialogs/share-dialog.tsx` — owner vs read-only collaborator views
- `liveblocks.config.ts` — TypeScript type augmentation for Presence + UserMeta
- `lib/liveblocks.ts` — cached Liveblocks node client + `getUserColor()` helper
- `app/api/liveblocks-auth/route.ts` — POST auth route

**Modified:**
- `components/editor/editor-navbar.tsx` — add `projectName?`, `onShare?`, `onAiToggle?`, `isAiOpen?` props
- `context/progress-tracker.md` — mark 08/09/10 in progress, then completed

---

## Task 1: Create `lib/project-access.ts`

**Files:**
- Create: `lib/project-access.ts`

- [ ] **Step 1: Write the file**

```typescript
import "server-only"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface ProjectIdentity {
  userId: string
  email: string | null
}

export async function getCurrentIdentity(): Promise<ProjectIdentity | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return { userId: session.user.id, email: session.user.email ?? null }
}

export async function checkProjectAccess(
  projectId: string,
  userId: string,
  email: string | null
): Promise<{ hasAccess: boolean; isOwner: boolean }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })

  if (!project) return { hasAccess: false, isOwner: false }
  if (project.ownerId === userId) return { hasAccess: true, isOwner: true }

  if (email) {
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
      select: { email: true },
    })
    if (collab) return { hasAccess: true, isOwner: false }
  }

  return { hasAccess: false, isOwner: false }
}
```

- [ ] **Step 2: Build check**

```bash
bun run build
```

Expected: no errors related to `lib/project-access.ts`.

---

## Task 2: Create `components/editor/access-denied.tsx`

**Files:**
- Create: `components/editor/access-denied.tsx`

- [ ] **Step 1: Write the file**

```tsx
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
```

---

## Task 3: Update `components/editor/editor-navbar.tsx`

**Files:**
- Modify: `components/editor/editor-navbar.tsx`

Add `projectName?`, `onShare?`, `onAiToggle?`, `isAiOpen?` props. Show project name centered. Show Share button and AI toggle on right when provided.

- [ ] **Step 1: Replace file content**

```tsx
"use client"

import { PanelLeftClose, PanelLeftOpen, Share2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  projectName?: string
  onShare?: () => void
  onAiToggle?: () => void
  isAiOpen?: boolean
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  onShare,
  onAiToggle,
  isAiOpen,
}: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center px-3 bg-bg-surface border-b border-border-default">
      <div className="flex items-center">
        <button
          onClick={onSidebarToggle}
          className="flex items-center justify-center h-8 w-8 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>
      </div>

      {projectName && (
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-sm font-medium text-text-primary">{projectName}</span>
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="gap-1.5 h-8 px-3 text-text-secondary hover:text-text-primary rounded-xl"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
        {onAiToggle && (
          <button
            onClick={onAiToggle}
            className={`flex items-center justify-center h-8 w-8 rounded-xl transition-colors ${
              isAiOpen
                ? "text-accent-ai bg-accent-ai/10"
                : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
            }`}
            aria-label="Toggle AI sidebar"
          >
            <Bot className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify EditorHome still works**

Open `app/editor/editor-home.tsx` — it passes `isSidebarOpen` and `onSidebarToggle` only, no new required props, so it still compiles. No changes needed there.

---

## Task 4: Create `app/editor/[roomId]/workspace-shell.tsx`

**Files:**
- Create: `app/editor/[roomId]/workspace-shell.tsx`

Client component that composes the full workspace: navbar with project context, sidebar, canvas placeholder, AI sidebar placeholder, project dialogs, share dialog.

- [ ] **Step 1: Write the file**

```tsx
"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { ShareDialog } from "@/components/editor/dialogs/share-dialog"
import { useProjectActions, type ProjectRow } from "@/hooks/use-project-actions"

interface WorkspaceShellProps {
  projectId: string
  projectName: string
  isOwner: boolean
  ownedProjects: ProjectRow[]
  sharedProjects: ProjectRow[]
}

export function WorkspaceShell({
  projectId,
  projectName,
  isOwner,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const {
    dialogType,
    activeProject,
    name,
    slugPreview,
    loading,
    openCreate,
    openRename,
    openDelete,
    close,
    handleNameChange,
    submit,
  } = useProjectActions({ activeProjectId: projectId })

  return (
    <div className="h-screen bg-bg-base text-text-primary overflow-hidden">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((v) => !v)}
        projectName={projectName}
        onShare={() => setIsShareOpen(true)}
        onAiToggle={() => setIsAiOpen((v) => !v)}
        isAiOpen={isAiOpen}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onNewProject={openCreate}
        onRename={openRename}
        onDelete={openDelete}
        activeProjectId={projectId}
      />

      <main className="h-full pt-12 flex items-center justify-center bg-bg-base">
        <p className="text-sm text-text-faint select-none">Canvas coming soon</p>
      </main>

      {isAiOpen && (
        <aside className="fixed inset-y-3 right-3 top-[3.75rem] z-50 flex w-80 flex-col rounded-2xl border border-border-subtle bg-bg-surface/95 backdrop-blur-xl">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-default px-4">
            <span className="text-sm font-medium text-text-primary">AI Assistant</span>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsAiOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close AI sidebar</span>
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-text-muted">AI chat coming soon</p>
          </div>
        </aside>
      )}

      <CreateProjectDialog
        open={dialogType === "create"}
        onOpenChange={(open) => (!open ? close() : null)}
        name={name}
        slugPreview={slugPreview}
        loading={loading}
        onNameChange={handleNameChange}
        onSubmit={submit}
      />

      <RenameProjectDialog
        open={dialogType === "rename"}
        onOpenChange={(open) => (!open ? close() : null)}
        currentName={activeProject?.name ?? ""}
        name={name}
        loading={loading}
        onNameChange={handleNameChange}
        onSubmit={submit}
      />

      <DeleteProjectDialog
        open={dialogType === "delete"}
        onOpenChange={(open) => (!open ? close() : null)}
        projectName={activeProject?.name ?? ""}
        loading={loading}
        onConfirm={submit}
      />

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        projectId={projectId}
        isOwner={isOwner}
      />
    </div>
  )
}
```

---

## Task 5: Create `app/editor/[roomId]/page.tsx`

**Files:**
- Create: `app/editor/[roomId]/page.tsx`

Server component. Checks auth → redirects unauthenticated users. Fetches project + checks access → renders `AccessDenied` for missing/unauthorized. Renders `WorkspaceShell` with all needed data.

- [ ] **Step 1: Write the file**

```tsx
import { redirect } from "next/navigation"
import { getCurrentIdentity, checkProjectAccess } from "@/lib/project-access"
import { getEditorProjects } from "@/lib/projects"
import { prisma } from "@/lib/prisma"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "./workspace-shell"

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default async function WorkspacePage({ params }: PageProps) {
  const { roomId } = await params

  const identity = await getCurrentIdentity()
  if (!identity) {
    redirect(`/sign-in?callbackUrl=/editor/${roomId}`)
  }

  const project = await prisma.project.findUnique({
    where: { id: roomId },
    select: { id: true, name: true },
  })

  if (!project) return <AccessDenied />

  const { hasAccess, isOwner } = await checkProjectAccess(
    roomId,
    identity.userId,
    identity.email
  )

  if (!hasAccess) return <AccessDenied />

  const { ownedProjects, sharedProjects } = await getEditorProjects()

  return (
    <WorkspaceShell
      projectId={roomId}
      projectName={project.name}
      isOwner={isOwner}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  )
}
```

- [ ] **Step 2: Build check**

```bash
bun run build
```

Expected: builds without TypeScript errors on the new workspace route.

- [ ] **Step 3: Commit feature 08**

```bash
git add lib/project-access.ts components/editor/access-denied.tsx components/editor/editor-navbar.tsx app/editor/[roomId]/
git commit -m "feat: workspace shell with server-side access control (#08)"
```

---

## Task 6: Create collaborator API routes

**Files:**
- Create: `app/api/projects/[projectId]/collaborators/route.ts`
- Create: `app/api/projects/[projectId]/collaborators/[collaboratorEmail]/route.ts`

GET returns collaborators merged with User name/avatar. POST invites (owner only). DELETE removes (owner only).

- [ ] **Step 1: Create `app/api/projects/[projectId]/collaborators/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

interface RouteContext {
  params: Promise<{ projectId: string }>
}

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const { hasAccess } = await checkProjectAccess(
    projectId,
    session.user.id,
    session.user.email ?? null
  )
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const collabs = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  })

  const emails = collabs.map((c) => c.email)
  const users = emails.length
    ? await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true, name: true, image: true },
      })
    : []

  const userMap = new Map(users.map((u) => [u.email ?? "", u]))

  const collaborators = collabs.map((c) => {
    const u = userMap.get(c.email)
    return { email: c.email, name: u?.name ?? null, avatar: u?.image ?? null }
  })

  return NextResponse.json({ collaborators })
}

export async function POST(req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const { hasAccess, isOwner } = await checkProjectAccess(
    projectId,
    session.user.id,
    session.user.email ?? null
  )
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown = null
  try {
    body = await req.json()
  } catch {
    body = null
  }

  const rawEmail =
    body && typeof body === "object" && "email" in body
      ? (body as { email?: unknown }).email
      : undefined

  if (typeof rawEmail !== "string" || !rawEmail.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const email = rawEmail.toLowerCase().trim()

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
    select: { email: true },
  })
  if (existing) {
    return NextResponse.json({ error: "Already a collaborator" }, { status: 409 })
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId, email },
  })

  return NextResponse.json({ collaborator }, { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/projects/[projectId]/collaborators/[collaboratorEmail]/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

interface RouteContext {
  params: Promise<{ projectId: string; collaboratorEmail: string }>
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, collaboratorEmail } = await params
  const email = decodeURIComponent(collaboratorEmail).toLowerCase()

  const { hasAccess, isOwner } = await checkProjectAccess(
    projectId,
    session.user.id,
    session.user.email ?? null
  )
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
    select: { email: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.projectCollaborator.delete({
    where: { projectId_email: { projectId, email } },
  })

  return new NextResponse(null, { status: 204 })
}
```

---

## Task 7: Create `components/editor/dialogs/share-dialog.tsx`

**Files:**
- Create: `components/editor/dialogs/share-dialog.tsx`

Owner view: email input + invite button, collaborator list with remove buttons, copy link button.
Collaborator view: read-only list only.
Fetches collaborators on open via GET `/api/projects/[projectId]/collaborators`.

- [ ] **Step 1: Write the file**

```tsx
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
                      <img src={c.avatar} alt={c.name ?? c.email} className="h-full w-full object-cover" />
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
                    <p className={`text-xs truncate ${c.name ? "text-text-muted" : "text-text-secondary"}`}>
                      {c.email}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(c.email)}
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
```

- [ ] **Step 2: Build check**

```bash
bun run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit features 09**

```bash
git add app/api/projects/[projectId]/collaborators/ components/editor/dialogs/share-dialog.tsx
git commit -m "feat: collaborator API routes and share dialog (#09)"
```

---

## Task 8: Install Liveblocks packages

Spec 10 states packages are already installed — they are NOT. Install them now.

- [ ] **Step 1: Install**

```bash
bun add @liveblocks/client @liveblocks/node
```

Expected: both packages added to `node_modules` and `package.json`.

---

## Task 9: Create `liveblocks.config.ts`

**Files:**
- Create: `liveblocks.config.ts` (project root)

TypeScript type augmentation only — no runtime imports.

- [ ] **Step 1: Write the file**

```typescript
// Type augmentation for Liveblocks global types.
// No runtime imports — this file is TypeScript-only.
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      isThinking: boolean
    }
    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }
  }
}

export {}
```

---

## Task 10: Create `lib/liveblocks.ts`

**Files:**
- Create: `lib/liveblocks.ts`

Cached Liveblocks node client (singleton pattern matching `lib/prisma.ts`). Deterministic cursor color from fixed palette.

- [ ] **Step 1: Write the file**

```typescript
import { Liveblocks } from "@liveblocks/node"

const CURSOR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
]

declare const globalThis: {
  liveblocksClient: Liveblocks | undefined
} & typeof global

export const liveblocks: Liveblocks =
  globalThis.liveblocksClient ??
  new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! })

if (process.env.NODE_ENV !== "production") {
  globalThis.liveblocksClient = liveblocks
}

export function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i)
    hash |= 0
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}
```

---

## Task 11: Create `app/api/liveblocks-auth/route.ts`

**Files:**
- Create: `app/api/liveblocks-auth/route.ts`

POST route that verifies project access, ensures room exists in Liveblocks (creates if missing), and returns a session token with user metadata.

- [ ] **Step 1: Write the file**

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { liveblocks, getUserColor } from "@/lib/liveblocks"
import { checkProjectAccess } from "@/lib/project-access"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown = null
  try {
    body = await req.json()
  } catch {
    body = null
  }

  const room =
    body && typeof body === "object" && "room" in body
      ? (body as { room?: unknown }).room
      : undefined

  if (typeof room !== "string" || !room) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 })
  }

  const { hasAccess } = await checkProjectAccess(
    room,
    session.user.id,
    session.user.email ?? null
  )

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await liveblocks.getRoom(room)
  } catch {
    await liveblocks.createRoom(room, { defaultAccesses: [] })
  }

  const liveblocksSession = liveblocks.prepareSession(session.user.id, {
    userInfo: {
      name: session.user.name ?? session.user.email ?? "Unknown",
      avatar: session.user.image ?? "",
      color: getUserColor(session.user.id),
    },
  })

  liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS)
  const { status, body: responseBody } = await liveblocksSession.authorize()

  return new Response(responseBody, { status })
}
```

- [ ] **Step 2: Final build check**

```bash
bun run build
```

Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit features 10**

```bash
git add liveblocks.config.ts lib/liveblocks.ts app/api/liveblocks-auth/
git commit -m "feat: liveblocks config, node client, and auth route (#10)"
```

---

## Task 12: Update `context/progress-tracker.md`

Mark features 08, 09, 10 as completed. Move canvas workspace to Next Up.

- [ ] **Step 1: Update the file** — move the three features from In Progress to Completed with brief summaries matching the pattern used by features 01–07.
