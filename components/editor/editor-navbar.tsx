"use client"

import { useEffect, useState } from "react"
import { PanelLeftClose, PanelLeftOpen, Share2, Bot, LayoutTemplate, Save, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  projectName?: string
  onShare?: () => void
  onAiToggle?: () => void
  isAiOpen?: boolean
  onTemplates?: () => void
  saveStatus?: SaveStatus
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  onShare,
  onAiToggle,
  isAiOpen,
  onTemplates,
  saveStatus: propSaveStatus,
}: EditorNavbarProps) {
  const [status, setStatus] = useState<SaveStatus>(propSaveStatus ?? "idle")

  useEffect(() => {
    if (propSaveStatus) {
      setStatus(propSaveStatus)
    }
  }, [propSaveStatus])

  useEffect(() => {
    const handleStatus = (e: CustomEvent<SaveStatus>) => {
      setStatus(e.detail)
    }
    window.addEventListener("canvas-save-status", handleStatus as EventListener)
    return () => {
      window.removeEventListener("canvas-save-status", handleStatus as EventListener)
    }
  }, [])

  const statusIcon = status === "saving" ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : status === "saved" ? (
    <Check className="h-4 w-4" />
  ) : status === "error" ? (
    <span className="text-state-error">!</span>
  ) : (
    <Save className="h-4 w-4" />
  )

  const statusText = status === "saving" ? "Saving" : status === "saved" ? "Saved" : status === "error" ? "Error" : "Save"
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border-default/80 bg-bg-surface/92 px-3 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-brand/8 via-transparent to-transparent" />

      <div className="mx-auto flex h-16 w-full max-w-400 items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-border-default/80 bg-bg-elevated/70 text-text-muted shadow-sm shadow-black/20 transition-all hover:border-border-subtle hover:bg-bg-elevated hover:text-text-primary hover:shadow-md cursor-pointer"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>

          <div className="hidden sm:flex flex-col justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-faint">
              Editor workspace
            </span>
            <span className="text-sm text-text-secondary">
              {projectName ? "Live collaboration" : "Project canvas"}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-2">
          {projectName ? (
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border-default/80 bg-bg-elevated/70 px-4 py-2 shadow-sm shadow-black/15">
              <span className="h-2 w-2 rounded-full bg-state-success shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
              <span className="truncate text-sm font-medium tracking-tight text-text-primary">
                {projectName}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-border-default/80 bg-bg-elevated/60 px-4 py-2 text-sm text-text-secondary shadow-sm shadow-black/10">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Workspace ready
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {projectName && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 gap-1.5 rounded-full border px-3 text-xs font-medium shadow-sm transition-all ${
                status === "saved"
                  ? "border-state-success/20 bg-state-success/10 text-state-success hover:bg-state-success/15"
                  : status === "error"
                  ? "border-state-error/20 bg-state-error/10 text-state-error hover:bg-state-error/15"
                  : status === "saving"
                  ? "border-border-default/70 bg-bg-elevated/80 text-text-muted"
                  : "border-border-default/70 bg-bg-elevated/65 text-text-secondary hover:border-border-subtle hover:bg-bg-elevated hover:text-text-primary"
              }`}
            >
              {statusIcon}
              <span>{statusText}</span>
            </Button>
          )}

          <div className={`hidden items-center gap-2 rounded-full border border-border-default/70 bg-bg-elevated/55 p-1.5 shadow-sm shadow-black/10 ${onTemplates || onShare ? "lg:flex" : ""}`}>
            {onTemplates && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTemplates}
                className="h-8 gap-1.5 rounded-full border border-transparent px-3 text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
              >
                <LayoutTemplate className="h-4 w-4" />
                Templates
              </Button>
            )}
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="h-8 gap-1.5 rounded-full border border-transparent px-3 text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            )}
          </div>

          {onTemplates && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onTemplates}
              className="h-9 w-9 rounded-2xl border border-border-default/70 bg-bg-elevated/70 text-text-secondary shadow-sm shadow-black/10 hover:border-border-subtle hover:bg-bg-elevated hover:text-text-primary lg:hidden"
            >
              <LayoutTemplate className="h-4 w-4" />
              <span className="sr-only">Templates</span>
            </Button>
          )}

          {onShare && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onShare}
              className="h-9 w-9 rounded-2xl border border-border-default/70 bg-bg-elevated/70 text-text-secondary shadow-sm shadow-black/10 hover:border-border-subtle hover:bg-bg-elevated hover:text-text-primary lg:hidden"
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          )}

          {onAiToggle && (
            <button
              onClick={onAiToggle}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm shadow-black/10 transition-all cursor-pointer ${
                isAiOpen
                  ? "border-accent-ai/40 bg-accent-ai/12 text-accent-ai"
                  : "border-border-default/70 bg-bg-elevated/70 text-text-muted hover:border-border-subtle hover:bg-bg-elevated hover:text-text-primary"
              }`}
              aria-label="Toggle AI sidebar"
            >
              <Bot className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
