"use client"

import { memo, useMemo } from "react"
import { X } from "lucide-react"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates"
import { NODE_COLORS } from "@/types/canvas"
import { type Node, type Edge } from "@xyflow/react"

interface StarterTemplatesModalProps {
  open: boolean
  onClose: () => void
  onImport: (template: CanvasTemplate) => void
}

function TemplatePreview({
  nodes,
  edges,
  width = 200,
  height = 120,
}: {
  nodes: Node[]
  edges: Edge[]
  width?: number
  height?: number
}) {
  const { minX, maxX, minY, maxY, scale, offsetX, offsetY } = useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, maxX: width, minY: 0, maxY: height, scale: 1, offsetX: 0, offsetY: 0 }
    }

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    nodes.forEach((node) => {
      const x = node.position.x
      const y = node.position.y
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x + 100)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y + 50)
    })

    const padding = 40
    const contentWidth = maxX - minX + padding * 2
    const contentHeight = maxY - minY + padding * 2

    const scaleX = width / contentWidth
    const scaleY = height / contentHeight
    const scale = Math.min(scaleX, scaleY, 1)

    const scaledWidth = contentWidth * scale
    const scaledHeight = contentHeight * scale

    const offsetX = (width - scaledWidth) / 2 + padding * scale - minX * scale
    const offsetY = (height - scaledHeight) / 2 + padding * scale - minY * scale

    return { minX, maxX, minY, maxY, scale, offsetX, offsetY }
  }, [nodes, width, height])

  return (
    <svg width={width} height={height} className="overflow-visible">
      {edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)
        if (!sourceNode || !targetNode) return null

        const x1 = sourceNode.position.x * scale + offsetX + 50 * scale
        const y1 = sourceNode.position.y * scale + offsetY + 25 * scale
        const x2 = targetNode.position.x * scale + offsetX + 50 * scale
        const y2 = targetNode.position.y * scale + offsetY + 25 * scale

        return (
          <line
            key={edge.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#3a3a42"
            strokeWidth={1.5}
          />
        )
      })}

      {nodes.map((node) => {
        const colorKey = node.data.color as string
        const color = NODE_COLORS[colorKey] ?? NODE_COLORS.neutral
        const x = node.position.x * scale + offsetX
        const y = node.position.y * scale + offsetY
        const w = 100 * scale
        const h = 50 * scale

        if (node.data.shape === "circle") {
          return (
            <circle
              key={node.id}
              cx={x + w / 2}
              cy={y + h / 2}
              r={Math.min(w, h) / 2}
              fill={color.fill}
              stroke={color.text}
              strokeWidth={1}
            />
          )
        }

        if (node.data.shape === "diamond") {
          return (
            <polygon
              key={node.id}
              points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
              fill={color.fill}
              stroke={color.text}
              strokeWidth={1}
            />
          )
        }

        if (node.data.shape === "hexagon") {
          return (
            <polygon
              key={node.id}
              points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h / 2}`}
              fill={color.fill}
              stroke={color.text}
              strokeWidth={1}
            />
          )
        }

        if (node.data.shape === "cylinder") {
          return (
            <g key={node.id}>
              <ellipse cx={x + w / 2} cy={y + 8 * scale} rx={w / 2} ry={8 * scale} fill={color.fill} stroke={color.text} strokeWidth={1} />
              <rect x={x} y={y + 8 * scale} width={w} height={h - 8 * scale} fill={color.fill} stroke={color.text} strokeWidth={1} />
            </g>
          )
        }

        return (
          <rect
            key={node.id}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={8 * scale}
            fill={color.fill}
            stroke={color.text}
            strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}

export const StarterTemplatesModal = memo(function StarterTemplatesModal({
  open,
  onClose,
  onImport,
}: StarterTemplatesModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-bg-base/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[84vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border-default/80 bg-bg-surface/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand/10 to-transparent" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Starter Templates</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-text-muted transition-all hover:border-border-default/70 hover:bg-bg-subtle hover:text-text-primary"
          >
            <X className="h-5 w-5 cursor-pointer" />
          </button>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          Choose a template to start with. This will replace your current canvas.
        </p>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="group flex flex-col rounded-2xl border border-border-default/70 bg-bg-elevated/70 p-3 transition-all hover:border-border-subtle hover:shadow-lg"
            >
              <div className="mb-2 rounded-xl border border-border-default/50 bg-bg-subtle p-2">
                <TemplatePreview nodes={template.nodes} edges={template.edges} />
              </div>
              <h3 className="mb-1 font-medium text-text-primary">{template.name}</h3>
              <p className="mb-3 flex-1 text-xs text-text-muted">{template.description}</p>
              <button
                onClick={() => {
                  onImport(template)
                  onClose()
                }}
                className="w-full rounded-xl bg-brand py-2 text-sm font-medium text-bg-base transition-opacity hover:opacity-90 cursor-pointer"
              >
                Import
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
