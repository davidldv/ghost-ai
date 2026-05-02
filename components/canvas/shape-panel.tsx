"use client"

import { useRef, type DragEvent } from "react"
import { Square, Diamond, Circle, Pill, Cylinder, Hexagon } from "lucide-react"
import {
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_MIME,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas"

const SHAPE_ICONS: Record<NodeShape, typeof Square> = {
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
}

const SHAPE_LABEL: Record<NodeShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
}

export function ShapePanel() {
  const previewRef = useRef<HTMLDivElement | null>(null)

  function onDragStart(event: DragEvent<HTMLButtonElement>, shape: NodeShape) {
    const size = SHAPE_DEFAULT_SIZES[shape]
    const payload: ShapeDragPayload = {
      shape,
      width: size.width,
      height: size.height,
    }
    event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = "copy"

    const preview = buildDragPreview(shape, size.width, size.height)
    document.body.appendChild(preview)
    previewRef.current = preview
    event.dataTransfer.setDragImage(preview, size.width / 2, size.height / 2)
  }

  function onDragEnd() {
    if (previewRef.current) {
      previewRef.current.remove()
      previewRef.current = null
    }
  }

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border-subtle bg-bg-surface/95 px-2 py-2 backdrop-blur-xl shadow-lg">
        {NODE_SHAPES.map((shape) => {
          const Icon = SHAPE_ICONS[shape]
          return (
            <button
              key={shape}
              draggable
              onDragStart={(e) => onDragStart(e, shape)}
              onDragEnd={onDragEnd}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors cursor-grab active:cursor-grabbing"
              aria-label={`Drag ${SHAPE_LABEL[shape]}`}
              title={SHAPE_LABEL[shape]}
              type="button"
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function buildDragPreview(shape: NodeShape, width: number, height: number): HTMLDivElement {
  const wrapper = document.createElement("div")
  wrapper.style.position = "fixed"
  wrapper.style.top = "-9999px"
  wrapper.style.left = "-9999px"
  wrapper.style.width = `${width}px`
  wrapper.style.height = `${height}px`
  wrapper.style.pointerEvents = "none"
  wrapper.style.opacity = "0.85"

  const fill = "#1F1F1F"
  const stroke = "#3a3a42"

  if (shape === "rectangle") {
    wrapper.style.background = fill
    wrapper.style.border = `1px solid ${stroke}`
    wrapper.style.borderRadius = "12px"
  } else if (shape === "pill" || shape === "circle") {
    wrapper.style.background = fill
    wrapper.style.border = `1px solid ${stroke}`
    wrapper.style.borderRadius = "9999px"
  } else {
    wrapper.innerHTML = svgForShape(shape, fill, stroke)
  }

  return wrapper
}

function svgForShape(shape: NodeShape, fill: string, stroke: string): string {
  if (shape === "diamond") {
    return `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,2 98,50 50,98 2,50" fill="${fill}" stroke="${stroke}" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`
  }
  if (shape === "hexagon") {
    return `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="25,5 75,5 95,50 75,95 25,95 5,50" fill="${fill}" stroke="${stroke}" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`
  }
  if (shape === "cylinder") {
    return `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M 5,15 a 45,10 0 0 1 90,0 L 95,85 a 45,10 0 0 1 -90,0 Z" fill="${fill}" stroke="${stroke}" stroke-width="1" vector-effect="non-scaling-stroke"/><path d="M 5,15 a 45,10 0 0 0 90,0" fill="none" stroke="${stroke}" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`
  }
  return ""
}
