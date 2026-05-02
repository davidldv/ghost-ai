import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

interface RouteContext {
  params: Promise<{ projectId: string }>
}

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const { hasAccess } = await checkProjectAccess(
    projectId,
    session.user.id,
    session.user.email ?? null
  )
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const collabs = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  })

  const emails = collabs.map((c) => c.email)
  const users = emails.length
    ? await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true, name: true, image: true },
      })
    : []

  const userMap = new Map(users.map((u) => [u.email ?? "", u]))

  const collaborators = collabs.map((c) => {
    const u = userMap.get(c.email)
    return { email: c.email, name: u?.name ?? null, avatar: u?.image ?? null }
  })

  return NextResponse.json({ collaborators })
}

export async function POST(req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const { hasAccess, isOwner } = await checkProjectAccess(
    projectId,
    session.user.id,
    session.user.email ?? null
  )
  if (!hasAccess || !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown = null
  try {
    body = await req.json()
  } catch {
    body = null
  }

  const rawEmail =
    body && typeof body === "object" && "email" in body
      ? (body as { email?: unknown }).email
      : undefined

  if (typeof rawEmail !== "string" || !rawEmail.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const email = rawEmail.toLowerCase().trim()

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
    select: { email: true },
  })
  if (existing) {
    return NextResponse.json({ error: "Already a collaborator" }, { status: 409 })
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId, email },
  })

  return NextResponse.json({ collaborator }, { status: 201 })
}
