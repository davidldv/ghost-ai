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
  neutral: { fill: "#1F1F1F", text: "#EDEDED" },
  blue: { fill: "#10233D", text: "#52A8FF" },
  purple: { fill: "#2E1938", text: "#BF7AF0" },
  orange: { fill: "#331B00", text: "#FF990A" },
  red: { fill: "#3C1618", text: "#FF6166" },
  pink: { fill: "#3A1726", text: "#F75F8F" },
  green: { fill: "#0F2E18", text: "#62C073" },
  teal: { fill: "#062822", text: "#0AC7B4" },
}

export const DEFAULT_NODE_COLOR = "neutral"
export const DEFAULT_EDGE_COLOR = "#f8fafc"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  shape: NodeShape
}

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>
export type CanvasEdge = Edge<Record<string, unknown>, typeof CANVAS_EDGE_TYPE>

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
