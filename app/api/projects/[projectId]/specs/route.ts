import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const access = await checkProjectAccess(
    projectId,
    session.user.id,
    session.user.email ?? ""
  )
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  })

  const items = specs.map((s) => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    filename: `spec-${s.id.slice(0, 8)}.md`,
  }))

  return NextResponse.json({ specs: items })
}
