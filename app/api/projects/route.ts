import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown = null
  try {
    body = await req.json()
  } catch {
    body = null
  }

  const rawName =
    body && typeof body === "object" && "name" in body
      ? (body as { name?: unknown }).name
      : undefined

  const rawId =
    body && typeof body === "object" && "id" in body
      ? (body as { id?: unknown }).id
      : undefined

  const name =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim()
      : "Untitled Project"

  const id =
    typeof rawId === "string" && /^[a-z0-9-]{3,80}$/.test(rawId)
      ? rawId
      : undefined

  if (id) {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ error: "Conflict" }, { status: 409 })
    }
  }

  const project = await prisma.project.create({
    data: {
      ...(id ? { id } : {}),
      name,
      ownerId: session.user.id,
    },
  })

  return NextResponse.json({ project }, { status: 201 })
}
