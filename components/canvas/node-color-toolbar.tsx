"use client"

import { memo } from "react"
import { Trash2 } from "lucide-react"
import { NODE_COLORS } from "@/types/canvas"

interface NodeColorToolbarProps {
  currentColor: string
  onColorChange: (color: string) => void
  onDelete: () => void
}

const colorKeys = Object.keys(NODE_COLORS)

export const NodeColorToolbar = memo(function NodeColorToolbar({
  currentColor,
  onColorChange,
  onDelete,
}: NodeColorToolbarProps) {
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2 flex items-center gap-1 rounded-lg border border-border-default bg-bg-elevated px-2 py-1.5 shadow-lg"
      style={{ pointerEvents: "auto" }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {colorKeys.map((colorKey) => {
        const color = NODE_COLORS[colorKey]
        const isActive = currentColor === colorKey
        return (
          <button
            key={colorKey}
            onClick={(e) => {
              e.stopPropagation()
              onColorChange(colorKey)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="relative h-5 w-5 rounded transition-all hover:scale-110"
            style={{
              backgroundColor: color.fill,
              border: isActive ? `2px solid ${color.text}` : "1px solid #3a3a42",
              boxShadow: isActive
                ? `0 0 0 1px ${color.text}40`
                : `0 0 0 0px`,
            }}
            title={colorKey}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 8px 1px ${color.text}60`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isActive
                ? `0 0 0 1px ${color.text}40`
                : `0 0 0 0px`
            }}
          />
        )
      })}
      <div className="mx-1 h-4 w-px bg-border-default" />
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-state-error/20 hover:text-state-error"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
})