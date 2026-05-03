"use client"

import { memo, useCallback, useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
  type Edge,
  type Position,
} from "@xyflow/react"
import { CanvasEdgeData, CANVAS_EDGE_TYPE } from "@/types/canvas"

const EDGE_COLOR = "#5b5b66"
const EDGE_HOVER_COLOR = "#cbd5e1"

interface CanvasEdgeProps {
  id: string
  data: CanvasEdgeData | undefined
  selected?: boolean
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition?: Position
  targetPosition?: Position
  markerEnd?: string
}

export const CanvasEdge = memo(function CanvasEdge({
  id,
  data,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: CanvasEdgeProps) {
  const { updateEdgeData, deleteElements } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [draft, setDraft] = useState(data?.label ?? "")
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  })

  const commit = useCallback(() => {
    updateEdgeData(id, { label: draft })
    setEditing(false)
  }, [id, draft, updateEdgeData])

  const cancel = useCallback(() => {
    setDraft(data?.label ?? "")
    setEditing(false)
  }, [data?.label])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        commit()
      } else if (e.key === "Escape") {
        e.preventDefault()
        cancel()
      }
    },
    [commit, cancel]
  )

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(true)
  }, [])

  const handleDelete = useCallback(() => {
    deleteElements({ edges: [{ id }] })
  }, [id, deleteElements])

  const isActive = selected || editing || hovered

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        stroke={isActive ? EDGE_HOVER_COLOR : EDGE_COLOR}
        strokeWidth={isActive ? 2 : 1.5}
        fill="none"
        markerEnd={markerEnd}
        style={{
          pointerEvents: "stroke",
          cursor: "pointer",
          transition: "stroke 120ms ease, stroke-width 120ms ease",
        }}
      />
      <path
        d={path}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        style={{
          pointerEvents: "stroke",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={onDoubleClick}
        >
          {selected && !editing && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-border-default bg-bg-elevated text-text-muted transition-colors hover:bg-state-error/20 hover:text-state-error"
              title="Delete"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onKeyDown}
              className="max-w-30 rounded-md border border-border-default bg-bg-elevated px-2 py-1 text-xs text-text-primary outline-none"
              style={{ width: Math.max(60, draft.length * 8 + 24) }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : data?.label ? (
            <div className="cursor-pointer rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 text-xs font-medium text-text-primary shadow-sm">
              {data.label}
            </div>
          ) : (hovered || selected) ? (
            <div
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="cursor-pointer rounded-md border border-border-subtle/70 bg-bg-elevated/80 px-2 py-0.5 text-[10px] italic text-text-muted opacity-80 shadow-sm"
            >
              + label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})