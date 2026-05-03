import "@liveblocks/client"
import type { LiveList } from "@liveblocks/client"
import type { AIStatusMessage, ChatMessage } from "@/types/tasks"

declare module "@liveblocks/client" {
  interface Storage {
    aiStatusFeed: AIStatusMessage | null
    aiChat: LiveList<ChatMessage>
  }

  interface Presence {
    cursor: { x: number; y: number } | null
    thinking: boolean
  }

  interface UserMeta {
    id: string
    info: {
      name: string
      avatar: string
      color: string
    }
  }
}