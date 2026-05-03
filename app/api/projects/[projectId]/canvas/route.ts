import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"
import { put } from "@vercel/blob"

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const access = await checkProjectAccess(projectId, session.user.id, session.user.email ?? "")
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { nodes, edges } = body

  if (!nodes || !edges) {
    return NextResponse.json({ error: "Missing nodes or edges" }, { status: 400 })
  }

  if (!BLOB_TOKEN) {
    console.warn("[canvas:PUT] BLOB_READ_WRITE_TOKEN missing — skipping blob save")
    return NextResponse.json({ url: null, skipped: true })
  }

  try {
    const canvasJson = JSON.stringify({ nodes, edges })
    const blob = await put(`canvas-${projectId}.json`, canvasJson, {
      contentType: "application/json",
      access: "private" as "public",
      allowOverwrite: true,
      token: BLOB_TOKEN,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasBlobUrl: blob.url },
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed"
    console.error("[canvas:PUT]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const access = await checkProjectAccess(projectId, session.user.id, session.user.email ?? "")
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { canvasBlobUrl: true },
    })

    if (!project?.canvasBlobUrl) {
      return NextResponse.json({ data: null })
    }

    const response = await fetch(project.canvasBlobUrl, {
      cache: "no-store",
      headers: BLOB_TOKEN ? { Authorization: `Bearer ${BLOB_TOKEN}` } : undefined,
    })
    if (!response.ok) {
      console.warn("[canvas:GET] blob fetch non-OK", response.status)
      return NextResponse.json({ data: null })
    }
    const data = await response.json()
    return NextResponse.json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch canvas"
    console.error("[canvas:GET]", message)
    return NextResponse.json({ data: null })
  }
}
