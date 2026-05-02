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
