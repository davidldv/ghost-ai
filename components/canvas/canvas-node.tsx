"use client"

import { memo, useEffect, useRef, useState, useCallback } from "react"
import {
  NodeProps,
  NodeResizer,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react"
import {
  CanvasNode as CanvasNodeType,
  NODE_COLORS,
  NODE_MIN_HEIGHT,
  NODE_MIN_WIDTH,
} from "@/types/canvas"

const HANDLE_POSITIONS: { id: string; type: "source" | "target"; position: Position }[] = [
  { id: "top", type: "source", position: Position.Top },
  { id: "right", type: "source", position: Position.Right },
  { id: "bottom", type: "source", position: Position.Bottom },
  { id: "left", type: "source", position: Position.Left },
]

function CanvasNodeImpl({ id, data, selected, width, height }: NodeProps<CanvasNodeType>) {
  const { updateNodeData } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!editing) setDraft(data.label)
  }, [data.label, editing])

  useEffect(() => {
    if (editing) {
      const ta = textareaRef.current
      if (ta) {
        ta.focus()
        ta.setSelectionRange(ta.value.length, ta.value.length)
      }
    }
  }, [editing])

  const colorPair = NODE_COLORS[data.color] ?? NODE_COLORS.neutral
  const fill = colorPair.fill
  const text = colorPair.text

  const startEdit = useCallback(() => setEditing(true), [])

  const commit = useCallback(() => {
    updateNodeData(id, { label: draft })
    setEditing(false)
  }, [id, draft, updateNodeData])

  const cancel = useCallback(() => {
    setDraft(data.label)
    setEditing(false)
  }, [data.label])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        e.preventDefault()
        cancel()
      }
    },
    [cancel]
  )

  return (
    <div
      className="group relative h-full w-full"
      onDoubleClick={(e) => {
        e.stopPropagation()
        startEdit()
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={NODE_MIN_WIDTH}
        minHeight={NODE_MIN_HEIGHT}
        lineClassName="!border-accent-primary/60"
        handleClassName="!h-2 !w-2 !rounded-sm !border-accent-primary !bg-bg-base"
      />

      <ShapeBackground
        shape={data.shape}
        fill={fill}
        text={text}
        selected={!!selected}
      />

      {HANDLE_POSITIONS.map((h) => (
        <Handle
          key={h.id}
          id={h.id}
          type={h.type}
          position={h.position}
          className="!h-2 !w-2 !rounded-full !border !border-text-primary !bg-bg-base opacity-0 group-hover:opacity-100 transition-opacity"
        />
      ))}

      <div
        className="absolute inset-0 flex items-center justify-center px-3"
        style={{ color: text }}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nopan nowheel h-full w-full resize-none bg-transparent text-center text-sm leading-tight outline-none"
            style={{ color: text }}
          />
        ) : (
          <span className="pointer-events-none w-full select-none break-words text-center text-sm leading-tight">
            {data.label || (
              <span className="opacity-40 italic">Double-click to edit</span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}

interface ShapeBackgroundProps {
  shape: CanvasNodeType["data"]["shape"]
  fill: string
  text: string
  selected: boolean
}

function ShapeBackground({ shape, fill, text, selected }: ShapeBackgroundProps) {
  const borderColor = selected ? text : "#2a2a30"
  const borderWidth = selected ? 1.5 : 1

  if (shape === "rectangle") {
    return (
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: fill,
          border: `${borderWidth}px solid ${borderColor}`,
        }}
      />
    )
  }

  if (shape === "pill") {
    return (
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: fill,
          border: `${borderWidth}px solid ${borderColor}`,
        }}
      />
    )
  }

  if (shape === "circle") {
    return (
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: fill,
          border: `${borderWidth}px solid ${borderColor}`,
        }}
      />
    )
  }

  if (shape === "diamond") {
    return (
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill={fill}
          stroke={borderColor}
          strokeWidth={borderWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  if (shape === "hexagon") {
    return (
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="25,5 75,5 95,50 75,95 25,95 5,50"
          fill={fill}
          stroke={borderColor}
          strokeWidth={borderWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  if (shape === "cylinder") {
    return (
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 5,15 a 45,10 0 0 1 90,0 L 95,85 a 45,10 0 0 1 -90,0 Z"
          fill={fill}
          stroke={borderColor}
          strokeWidth={borderWidth}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 5,15 a 45,10 0 0 0 90,0"
          fill="none"
          stroke={borderColor}
          strokeWidth={borderWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  return null
}

export const CanvasNode = memo(CanvasNodeImpl)
