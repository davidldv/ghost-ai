import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, specId } = await params

  const access = await checkProjectAccess(projectId, session.user.id, session.user.email ?? "")
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
  })

  if (!spec || spec.projectId !== projectId) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 })
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const response = await fetch(spec.filePath, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch spec" }, { status: 500 })
    }
    const content = await response.text()

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    })

    const filename = `${project?.name ?? "spec"}-${specId.slice(0, 8)}.md`

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to download spec" }, { status: 500 })
  }
}