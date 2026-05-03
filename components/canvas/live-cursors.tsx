"use client"

import { memo } from "react"
import { useOthers } from "@liveblocks/react"
import { MousePointer2, Loader2 } from "lucide-react"

interface PresenceUserInfo {
  name: string
  avatar: string
  color: string
}

interface LiveCursorProps {
  x: number
  y: number
  user: { info: PresenceUserInfo; presence: { thinking?: boolean } }
}

function LiveCursor({ x, y, user }: LiveCursorProps) {
  const { name, color } = user.info as PresenceUserInfo
  const isThinking = user.presence?.thinking === true

  return (
    <div
      className="pointer-events-none fixed z-30 transition-transform duration-75"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <MousePointer2 className="h-3 w-3 text-white" style={{ fill: color }} />
      </div>
      <div
        className="absolute left-4 top-4 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {isThinking && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
        <span>{name}</span>
      </div>
    </div>
  )
}

export const LiveCursors = memo(function LiveCursors() {
  const others = useOthers()

  const othersWithCursors = others.filter(
    (user) => user.presence?.cursor != null
  )

  return (
    <>
      {othersWithCursors.map((user) => {
        const cursor = user.presence?.cursor as { x: number; y: number } | null
        if (!cursor) return null

        return (
          <LiveCursor
            key={user.connectionId}
            x={cursor.x}
            y={cursor.y}
            user={user as unknown as LiveCursorProps["user"]}
          />
        )
      })}
    </>
  )
})