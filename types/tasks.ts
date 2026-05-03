export type TaskStatus = "idle" | "running" | "completed" | "error"

export interface AIStatusMessage {
  status: TaskStatus
  text?: string
  timestamp: number
}

export function isValidAIStatusMessage(value: unknown): value is AIStatusMessage {
  if (typeof value !== "object" || value === null) return false
  const obj = value as Record<string, unknown>
  if (typeof obj.status !== "string") return false
  const validStatuses = ["idle", "running", "completed", "error"]
  if (!validStatuses.includes(obj.status)) return false
  if (obj.text !== undefined && typeof obj.text !== "string") return false
  if (typeof obj.timestamp !== "number") return false
  return true
}

export type ChatRole = "user" | "assistant"

export interface ChatSender {
  id: string
  name: string
  avatar?: string
  color?: string
}

export interface ChatMessage {
  id: string
  sender: ChatSender
  role: ChatRole
  content: string
  timestamp: number
}

export function isValidChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false
  const obj = value as Record<string, unknown>
  if (typeof obj.id !== "string") return false
  if (typeof obj.content !== "string") return false
  if (typeof obj.timestamp !== "number") return false
  if (obj.role !== "user" && obj.role !== "assistant") return false
  if (typeof obj.sender !== "object" || obj.sender === null) return false
  const sender = obj.sender as Record<string, unknown>
  if (typeof sender.id !== "string") return false
  if (typeof sender.name !== "string") return false
  if (sender.avatar !== undefined && typeof sender.avatar !== "string") return false
  if (sender.color !== undefined && typeof sender.color !== "string") return false
  return true
}