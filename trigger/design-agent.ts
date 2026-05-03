import type { Node, Edge } from "@xyflow/react"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"
import {
  NODE_COLORS,
  NODE_SHAPES,
  CANVAS_NODE_TYPE,
  CANVAS_EDGE_TYPE,
  type CanvasNodeData,
  type CanvasEdgeData,
  type NodeShape,
} from "@/types/canvas"

export interface DesignTaskPayload {
  prompt: string
  roomId: string
  projectId: string
  userId: string
}

export interface DesignTaskResult {
  nodes: Node<CanvasNodeData>[]
  edges: Edge<CanvasEdgeData>[]
  explanation: string
}

const COLOR_KEYS = Object.keys(NODE_COLORS) as [string, ...string[]]

const NodeSchema = z.object({
  id: z.string().describe("unique short id like n1, n2"),
  label: z.string().describe("short human label"),
  shape: z.enum(NODE_SHAPES as [NodeShape, ...NodeShape[]]),
  color: z.enum(COLOR_KEYS),
  x: z.number().describe("x position in pixels"),
  y: z.number().describe("y position in pixels"),
  width: z.number().min(80).max(280),
  height: z.number().min(50).max(160),
})

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
})

const DesignSchema = z.object({
  nodes: z.array(NodeSchema).min(1).max(20),
  edges: z.array(EdgeSchema).max(40),
  explanation: z.string(),
})

const SYSTEM_PROMPT = `You are a software architecture diagram generator.
Given a user prompt, output a system diagram as JSON.

Rules:
- Use only allowed shapes: ${NODE_SHAPES.join(", ")}.
- Use only allowed colors: ${COLOR_KEYS.join(", ")}.
- Convention: rectangle = service/app, cylinder = database, pill = queue/bus, hexagon = realtime/socket, diamond = decision, circle = client.
- Color convention: blue = client/frontend/gateway, purple = service, green = database, orange = queue/event, teal = cache, pink = external, red = critical.
- Layout top-to-bottom in vertical layers. Layer y values: 80, 220, 360, 500, 640. Spread nodes within a layer along x with 180px spacing, centered around x=400.
- Default node size: 140 wide, 70 tall. Cylinders 120x90. Circles 110x110.
- Edges connect by node id. No self-loops. No duplicates.
- Keep ids short (n1, n2, ...). Use those same ids in edges.
- Keep label under 24 chars.`

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY
  const modelId = process.env.GEMINI_MODEL
  if (!apiKey) throw new Error("GEMINI_API_KEY missing")
  if (!modelId) throw new Error("GEMINI_MODEL missing")
  const google = createGoogleGenerativeAI({ apiKey })
  return google(modelId)
}

export async function runDesignTask(
  payload: DesignTaskPayload
): Promise<DesignTaskResult> {
  const { prompt } = payload

  const { object } = await generateObject({
    model: getModel(),
    schema: DesignSchema,
    system: SYSTEM_PROMPT,
    prompt,
  })

  const nodes: Node<CanvasNodeData>[] = object.nodes.map((n) => ({
    id: n.id,
    type: CANVAS_NODE_TYPE,
    position: { x: n.x, y: n.y },
    width: n.width,
    height: n.height,
    data: {
      label: n.label,
      color: n.color,
      shape: n.shape,
    },
  }))

  const edges: Edge<CanvasEdgeData>[] = object.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: CANVAS_EDGE_TYPE,
    data: e.label ? { label: e.label } : undefined,
  }))

  return { nodes, edges, explanation: object.explanation }
}

export const DESIGN_TASK_ID = "design-agent"
