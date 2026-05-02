import { Liveblocks } from "@liveblocks/node"

const CURSOR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
]

declare const globalThis: {
  liveblocksClient: Liveblocks | undefined
} & typeof global

export function getLiveblocksClient(): Liveblocks {
  if (!globalThis.liveblocksClient) {
    globalThis.liveblocksClient = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY!,
    })
  }
  return globalThis.liveblocksClient
}

export function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i)
    hash |= 0
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}
