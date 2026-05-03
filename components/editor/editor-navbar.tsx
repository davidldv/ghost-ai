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
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 h-8 px-3 rounded-xl ${
            status === "saved"
              ? "text-state-success"
              : status === "error"
              ? "text-state-error"
              : status === "saving"
              ? "text-text-muted"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {statusIcon}
          <span className="text-xs">{statusText}</span>
        </Button>

        {onTemplates && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onTemplates}
            className="gap-1.5 h-8 px-3 text-text-secondary hover:text-text-primary rounded-xl"
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
