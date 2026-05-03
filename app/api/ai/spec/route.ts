import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"
import { v4 as uuidv4 } from "uuid"
import { runSpecTask } from "@/trigger/generate-spec"
import { put } from "@vercel/blob"
import { z } from "zod"
import type { Node, Edge } from "@xyflow/react"
import type { CanvasNodeData, CanvasEdgeData } from "@/types/canvas"

const NodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  width: z.number().optional(),
  height: z.number().optional(),
  data: z.record(z.string(), z.unknown()),
  sourcePosition: z.string().optional(),
  targetPosition: z.string().optional(),
})

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
})

const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
})

const SpecRequestSchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z.array(ChatMessageSchema).default([]),
  nodes: z.array(NodeSchema).default([]),
  edges: z.array(EdgeSchema).default([]),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parseResult = SpecRequestSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.issues },
      { status: 400 }
    )
  }

  const { roomId, chatHistory, nodes, edges } = parseResult.data

  const access = await checkProjectAccess(roomId, session.user.id, session.user.email ?? "")
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const runId = uuidv4()
  const publicToken = `spec_token_${runId}_${Date.now()}`

  await prisma.taskRun.create({
    data: {
      runId,
      projectId: roomId,
      userId: session.user.id,
    },
  })

  try {
    const result = await runSpecTask({
      roomId,
      projectId: roomId,
      userId: session.user.id,
      chatHistory,
      nodes: nodes as unknown as Node<CanvasNodeData>[],
      edges: edges as unknown as Edge<CanvasEdgeData>[],
    })

    const specId = uuidv4()
    const blob = await put(`specs/${roomId}/${specId}.md`, result.spec, {
      contentType: "text/markdown",
      access: "private",
    })

    await prisma.projectSpec.create({
      data: {
        id: specId,
        projectId: roomId,
        filePath: blob.url,
      },
    })

    return NextResponse.json({ specId, runId, publicToken, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Spec task failed"
    return NextResponse.json({ runId, publicToken, error: message }, { status: 500 })
  }
}