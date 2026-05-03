import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"
import type { Node, Edge } from "@xyflow/react"
import type { CanvasNodeData, CanvasEdgeData } from "@/types/canvas"

export interface SpecTaskPayload {
  roomId: string
  projectId: string
  userId: string
  chatHistory: { role: string; content: string }[]
  nodes: Node<CanvasNodeData>[]
  edges: Edge<CanvasEdgeData>[]
}

export interface SpecTaskResult {
  spec: string
  nodeCount: number
  edgeCount: number
}

const SpecSchema = z.object({
  spec: z.string().min(100).describe("Markdown technical specification"),
})

const SYSTEM_PROMPT = `You are a technical architecture specification generator.
Given a system design diagram (nodes and edges) and chat context, generate a comprehensive Markdown technical specification.

Use this structure:
# System Name
## Overview
## Architecture Components
## Data Flow
## API Endpoints
## Technology Stack
## Security Considerations

Focus on the components shown in the diagram. Use their labels and connections from the provided graph.`

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY
  const modelId = process.env.GEMINI_MODEL
  if (!apiKey) throw new Error("GEMINI_API_KEY missing")
  if (!modelId) throw new Error("GEMINI_MODEL missing")
  const google = createGoogleGenerativeAI({ apiKey })
  return google(modelId)
}

function describeNode(node: Node<CanvasNodeData>): string {
  return `- **${node.data.label}** (${node.data.shape}, ${node.data.color}) at (${node.position.x}, ${node.position.y})`
}

function describeEdge(edge: Edge<CanvasEdgeData>, nodes: Node<CanvasNodeData>[]): string {
  const sourceLabel = nodes.find((n) => n.id === edge.source)?.data.label ?? edge.source
  const targetLabel = nodes.find((n) => n.id === edge.target)?.data.label ?? edge.target
  let desc = `- **${sourceLabel}** → **${targetLabel}**`
  if (edge.data?.label) desc += ` (${edge.data.label})`
  return desc
}

export async function runSpecTask(
  payload: SpecTaskPayload
): Promise<SpecTaskResult> {
  const { roomId, projectId, chatHistory, nodes, edges } = payload

  const nodeDescriptions = nodes.map(describeNode).join("\n")
  const edgeDescriptions = edges.map((e) => describeEdge(e, nodes)).join("\n")
  const chatContext = chatHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n")

  const diagramContext = `# Diagram (${nodes.length} nodes, ${edges.length} edges)
${nodeDescriptions || "(no nodes)"}
${edgeDescriptions || "(no edges)"}`

  const prompt = chatContext
    ? `${chatContext}\n\n${diagramContext}`
    : diagramContext

  const { text } = await generateText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    prompt,
  })

  return {
    spec: text,
    nodeCount: nodes.length,
    edgeCount: edges.length,
  }
}

export const SPEC_TASK_ID = "generate-spec"