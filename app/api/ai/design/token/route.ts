import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { runId } = body

  if (!runId) {
    return NextResponse.json({ error: "Missing runId" }, { status: 400 })
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  })

  if (!taskRun) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 })
  }

  if (taskRun.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // TODO: Generate a Trigger.dev public token scoped to this run
  // For now, return a placeholder token
  const token = `design_token_${runId}_${Date.now()}`

  return NextResponse.json({ token })
}