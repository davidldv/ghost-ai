"use client"

import { memo, useCallback } from "react"
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react"

interface CanvasControlsProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export const CanvasControls = memo(function CanvasControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: CanvasControlsProps) {
  const zoomIn = useCallback(() => {
    document.dispatchEvent(new CustomEvent("canvas-zoom-in"))
  }, [])

  const zoomOut = useCallback(() => {
    document.dispatchEvent(new CustomEvent("canvas-zoom-out"))
  }, [])

  const fitView = useCallback(() => {
    document.dispatchEvent(new CustomEvent("canvas-fit-view"))
  }, [])

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 rounded-full border border-border-default bg-bg-elevated px-2 py-1.5 shadow-lg">
      <div className="flex items-center gap-0.5">
        <button
          onClick={zoomOut}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary cursor-pointer disabled:cursor-not-allowed"
          title="Zoom out (-)"
        >
          <ZoomIn className="h-4 w-4 rotate-180" />
        </button>
        <button
          onClick={fitView}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary cursor-pointer disabled:cursor-not-allowed"
          title="Fit view"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={zoomIn}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary cursor-pointer disabled:cursor-not-allowed"
          title="Zoom in (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-1 h-4 w-px bg-border-default" />

      <div className="flex items-center gap-0.5">
        <button
          onClick={onUndo}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})