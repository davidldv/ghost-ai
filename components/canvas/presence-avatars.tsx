"use client"

import { memo } from "react"
import { useOthers, useSelf } from "@liveblocks/react"

interface PresenceUserInfo {
  name: string
  avatar: string
  color: string
}

interface PresenceAvatarProps {
  user: { info: PresenceUserInfo }
  index: number
}

function PresenceAvatar({ user, index }: PresenceAvatarProps) {
  const { name, avatar, color } = user.info

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div
      className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-surface text-[10px] font-medium text-text-primary"
      style={{
        backgroundColor: color,
        marginLeft: index > 0 ? -8 : 0,
        zIndex: 10 - index,
      }}
      title={name}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  )
}

function PresenceOverflow({ count }: { count: number }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-surface bg-bg-subtle text-[10px] font-medium text-text-muted -ml-1">
      +{count}
    </div>
  )
}

export const PresenceAvatars = memo(function PresenceAvatars() {
  const others = useOthers()
  const self = useSelf()

  if (!self) return null

  const otherUsers = others.slice(0, 5)
  const overflowCount = Math.max(0, others.length - 5)

  if (others.length === 0) return null

  return (
    <div className="absolute right-4 top-4 z-20 flex items-center">
      <div className="flex items-center">
        {otherUsers.map((user, idx) => (
          <PresenceAvatar
            key={user.connectionId}
            user={user as unknown as { info: PresenceUserInfo }}
            index={idx}
          />
        ))}
        {overflowCount > 0 && <PresenceOverflow count={overflowCount} />}
      </div>
    </div>
  )
})