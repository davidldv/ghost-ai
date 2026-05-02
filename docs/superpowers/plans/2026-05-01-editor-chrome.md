# Editor Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the EditorNavbar and ProjectSidebar shell components that frame every editor screen.

**Architecture:** Two `"use client"` components driven entirely by props — no internal state. EditorNavbar holds left/center/right sections and fires a toggle callback. ProjectSidebar is a fixed overlay that slides in from the left via CSS transform, with shadcn Tabs and a New Project button.

**Tech Stack:** Next.js 16 / React 19, Tailwind v4 with project CSS tokens, shadcn/ui (Tabs, Button), lucide-react.

---

### Task 1: EditorNavbar

**Files:**
- Create: `components/editor/editor-navbar.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export function EditorNavbar({ isSidebarOpen, onSidebarToggle }: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center justify-between px-3 bg-bg-surface border-b border-border-default">
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
      <div className="flex-1" />
      <div className="flex items-center" />
    </header>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `bun tsc --noEmit`

---

### Task 2: ProjectSidebar

**Files:**
- Create: `components/editor/project-sidebar.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { X, Plus } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-bg-surface border-r border-border-default transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-border-default shrink-0">
        <span className="text-sm font-medium text-text-primary">Projects</span>
        <button
          onClick={onClose}
          className="flex items-center justify-center h-7 w-7 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden p-3">
        <Tabs defaultValue="mine" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="w-full mb-3">
            <TabsTrigger value="mine" className="flex-1">My Projects</TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">Shared</TabsTrigger>
          </TabsList>

          <TabsContent value="mine" className="flex-1 flex items-center justify-center">
            <p className="text-sm text-text-faint">No projects yet</p>
          </TabsContent>

          <TabsContent value="shared" className="flex-1 flex items-center justify-center">
            <p className="text-sm text-text-faint">No shared projects</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-3 border-t border-border-default shrink-0">
        <Button className="w-full gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `bun tsc --noEmit`

---

### Task 3: Update progress tracker

**Files:**
- Modify: `context/progress-tracker.md`

- [ ] Mark Feature 02 — Editor Chrome as completed in progress tracker.
