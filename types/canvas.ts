import type { Node, Edge } from "@xyflow/react"

export const CANVAS_NODE_TYPE = "canvasNode" as const
export const CANVAS_EDGE_TYPE = "canvasEdge" as const

export type NodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon"

export const NODE_SHAPES: NodeShape[] = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
]

export interface NodeColor {
  fill: string
  text: string
}

export const NODE_COLORS: Record<string, NodeColor> = {
  neutral: { fill: "#1C1C20", text: "#EDEDED" },
  blue: { fill: "#0E2C50", text: "#6BB6FF" },
  purple: { fill: "#3A1F4A", text: "#CB8DFF" },
  orange: { fill: "#4A2700", text: "#FFAA33" },
  red: { fill: "#4D1B20", text: "#FF7A80" },
  pink: { fill: "#4A1D32", text: "#FF7AA3" },
  green: { fill: "#143E22", text: "#7BD68C" },
  teal: { fill: "#0A382F", text: "#2BD7C2" },
}

export const DEFAULT_NODE_COLOR = "neutral"
export const DEFAULT_EDGE_COLOR = "#52525b"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  shape: NodeShape
}

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>

export interface ShapeDefaultSize {
  width: number
  height: number
}

export const SHAPE_DEFAULT_SIZES: Record<NodeShape, ShapeDefaultSize> = {
  rectangle: { width: 180, height: 90 },
  diamond: { width: 180, height: 140 },
  circle: { width: 120, height: 120 },
  pill: { width: 180, height: 70 },
  cylinder: { width: 160, height: 110 },
  hexagon: { width: 180, height: 110 },
}

export interface ShapeDragPayload {
  shape: NodeShape
  width: number
  height: number
}

export const SHAPE_DRAG_MIME = "application/x-ghost-ai-shape"

export const NODE_MIN_WIDTH = 80
export const NODE_MIN_HEIGHT = 50
