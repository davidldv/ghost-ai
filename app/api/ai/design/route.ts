import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"
import { v4 as uuidv4 } from "uuid"
import { runDesignTask } from "@/trigger/design-agent"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { prompt, roomId, projectId } = body

  if (!prompt || !roomId || !projectId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const access = await checkProjectAccess(projectId, session.user.id, session.user.email ?? "")
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const runId = uuidv4()
  const publicToken = `design_token_${runId}_${Date.now()}`

  await prisma.taskRun.create({
    data: {
      runId,
      projectId,
      userId: session.user.id,
    },
  })

  try {
    const result = await runDesignTask({
      prompt,
      roomId,
      projectId,
      userId: session.user.id,
    })
    return NextResponse.json({ runId, publicToken, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Design task failed"
    return NextResponse.json({ runId, publicToken, error: message }, { status: 500 })
  }
}
