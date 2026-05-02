import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getLiveblocksClient, getUserColor } from "@/lib/liveblocks"
import { checkProjectAccess } from "@/lib/project-access"

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

  const room =
    body && typeof body === "object" && "room" in body
      ? (body as { room?: unknown }).room
      : undefined

  if (typeof room !== "string" || !room) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 })
  }

  const { hasAccess } = await checkProjectAccess(
    room,
    session.user.id,
    session.user.email ?? null
  )

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const liveblocks = getLiveblocksClient()

  try {
    await liveblocks.getRoom(room)
  } catch {
    await liveblocks.createRoom(room, { defaultAccesses: [] })
  }

  const liveblocksSession = liveblocks.prepareSession(session.user.id, {
    userInfo: {
      name: session.user.name ?? session.user.email ?? "Unknown",
      avatar: session.user.image ?? "",
      color: getUserColor(session.user.id),
    },
  })

  liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS)
  const { status, body: responseBody } = await liveblocksSession.authorize()

  return new Response(responseBody, { status })
}
