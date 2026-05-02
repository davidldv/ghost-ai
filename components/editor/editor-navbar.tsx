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
