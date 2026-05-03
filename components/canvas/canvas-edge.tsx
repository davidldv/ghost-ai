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

const EDGE_COLOR = "#f8fafc"
const EDGE_HOVER_COLOR = "#ffffff"

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
}: CanvasEdgeProps) {
  const { updateEdgeData, deleteElements } = useReactFlow()
  const [editing, setEditing] = useState(false)
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
    const edge: Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE> = {
      id,
      source: "",
      target: "",
      type: CANVAS_EDGE_TYPE,
      data: { label: draft },
    }
    updateEdgeData(id, edge)
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

  const isActive = selected || editing

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        stroke={isActive ? EDGE_HOVER_COLOR : EDGE_COLOR}
        strokeWidth={1.5}
        fill="none"
        style={{
          pointerEvents: "stroke",
          cursor: "pointer",
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
              className="max-w-[120px] rounded-md border border-border-default bg-bg-elevated px-2 py-1 text-xs text-text-primary outline-none"
              style={{ width: Math.max(60, draft.length * 8 + 24) }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className={
                data?.label
                  ? "cursor-pointer rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 text-xs text-text-primary shadow-sm"
                  : "cursor-pointer rounded-md border border-border-subtle bg-bg-subtle px-2 py-1 text-xs italic text-text-muted opacity-60"
              }
            >
              {data?.label || "double-click to label"}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})