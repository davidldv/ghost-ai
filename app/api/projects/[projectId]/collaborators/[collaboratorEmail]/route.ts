import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

interface RouteContext {
  params: Promise<{ projectId: string; collaboratorEmail: string }>
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, collaboratorEmail } = await params
  const email = decodeURIComponent(collaboratorEmail).toLowerCase()

  const { hasAccess, isOwner } = await checkProjectAccess(
    projectId,
    session.user.id,
    session.user.email ?? null
  )
  if (!hasAccess || !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
    select: { email: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.projectCollaborator.delete({
    where: { projectId_email: { projectId, email } },
  })

  return new NextResponse(null, { status: 204 })
}
