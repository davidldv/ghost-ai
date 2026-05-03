"use client"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import {
  X,
  Bot,
  Send,
  FileText,
  Download,
  Sparkles,
  Loader2,
  ShoppingBag,
  MessagesSquare,
  GitBranch,
  ArrowUpRight,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  useMyPresence,
  useStorage,
  useOthers,
  useMutation,
  useSelf,
} from "@liveblocks/react"
import { LiveList } from "@liveblocks/client"
import {
  isValidAIStatusMessage,
  isValidChatMessage,
  type ChatMessage,
  type AIStatusMessage,
} from "@/types/tasks"

const STARTER_CHIPS: {
  prompt: string
  title: string
  subtitle: string
  icon: typeof ShoppingBag
  accent: string
  ring: string
  glow: string
}[] = [
  {
    prompt: "Design an e-commerce backend",
    title: "E-commerce backend",
    subtitle: "Cart, checkout, orders",
    icon: ShoppingBag,
    accent: "text-emerald-300",
    ring: "from-emerald-500/30 via-emerald-500/10 to-transparent",
    glow: "shadow-emerald-500/10",
  },
  {
    prompt: "Create a chat app architecture",
    title: "Realtime chat app",
    subtitle: "Sockets, presence, fanout",
    icon: MessagesSquare,
    accent: "text-sky-300",
    ring: "from-sky-500/30 via-sky-500/10 to-transparent",
    glow: "shadow-sky-500/10",
  },
  {
    prompt: "Build a CI/CD pipeline",
    title: "CI/CD pipeline",
    subtitle: "Build, test, deploy",
    icon: GitBranch,
    accent: "text-fuchsia-300",
    ring: "from-fuchsia-500/30 via-fuchsia-500/10 to-transparent",
    glow: "shadow-fuchsia-500/10",
  },
]

interface AISidebarProps {
  open: boolean
  onClose: () => void
  projectId: string
  roomId: string
}

interface SpecListItem {
  id: string
  createdAt: string
  filename: string
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatSpecDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AISidebar({ open, onClose, projectId, roomId }: AISidebarProps) {
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [, setActiveRun] = useState<{ runId: string; publicToken: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [specs, setSpecs] = useState<SpecListItem[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [specsError, setSpecsError] = useState<string | null>(null)
  const [generatingSpec, setGeneratingSpec] = useState(false)
  const [specError, setSpecError] = useState<string | null>(null)
  const [previewSpec, setPreviewSpec] = useState<SpecListItem | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const canvasStateRef = useRef<{ nodes: unknown[]; edges: unknown[] }>({
    nodes: [],
    edges: [],
  })

  const [, updateMyPresence] = useMyPresence()
  const self = useSelf()

  const rawStatusFeed = useStorage((root) => root.aiStatusFeed)
  const aiStatusFeed = useMemo<AIStatusMessage | null>(() => {
    return isValidAIStatusMessage(rawStatusFeed) ? rawStatusFeed : null
  }, [rawStatusFeed])

  const rawChat = useStorage((root) => root.aiChat)
  const chatMessages = useMemo<ChatMessage[]>(() => {
    if (!Array.isArray(rawChat)) return []
    return rawChat.filter(isValidChatMessage)
  }, [rawChat])

  const others = useOthers()
  const anyoneThinking = useMemo(
    () => others.some((u) => u.presence?.thinking === true),
    [others]
  )

  const isAiActive = isGenerating || anyoneThinking

  const ensureChatList = useMutation(({ storage }) => {
    const existing = storage.get("aiChat")
    if (!existing) {
      storage.set("aiChat", new LiveList([]) as any)
    }
  }, [])

  const pushChat = useMutation(({ storage }, message: ChatMessage) => {
    let list = storage.get("aiChat") as any
    if (!list) {
      list = new LiveList([]) as any
      storage.set("aiChat", list)
    }
    list.push(message)
  }, [])

  const setStatus = useMutation(({ storage }, status: AIStatusMessage) => {
    storage.set("aiStatusFeed", status as any)
  }, [])

  useEffect(() => {
    if (open) ensureChatList()
  }, [open, ensureChatList])

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages.length, isGenerating])

  useEffect(() => {
    const handleState = (e: CustomEvent<{ nodes: unknown[]; edges: unknown[] }>) => {
      canvasStateRef.current = {
        nodes: e.detail?.nodes ?? [],
        edges: e.detail?.edges ?? [],
      }
    }
    window.addEventListener("canvas-state", handleState as EventListener)
    return () => {
      window.removeEventListener("canvas-state", handleState as EventListener)
    }
  }, [])

  const fetchSpecs = useCallback(async () => {
    setSpecsLoading(true)
    setSpecsError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`, {
        cache: "no-store",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to load specs")
      }
      setSpecs(data.specs ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load specs"
      setSpecsError(msg)
    } finally {
      setSpecsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (open) fetchSpecs()
  }, [open, fetchSpecs])

  const handleGenerateSpec = useCallback(async () => {
    if (generatingSpec) return
    setGeneratingSpec(true)
    setSpecError(null)
    window.dispatchEvent(new CustomEvent("canvas-state-request"))
    await new Promise((resolve) => setTimeout(resolve, 0))
    const { nodes, edges } = canvasStateRef.current
    try {
      const chatHistory = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))
      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, chatHistory, nodes, edges }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Spec generation failed")
      }
      await fetchSpecs()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Spec generation failed"
      setSpecError(msg)
    } finally {
      setGeneratingSpec(false)
    }
  }, [chatMessages, fetchSpecs, generatingSpec, roomId])

  const handleOpenPreview = useCallback(
    async (spec: SpecListItem) => {
      setPreviewSpec(spec)
      setPreviewContent(null)
      setPreviewError(null)
      setPreviewLoading(true)
      try {
        const res = await fetch(
          `/api/projects/${projectId}/specs/${spec.id}/download`,
          { cache: "no-store" }
        )
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error((data as any).error || "Failed to load spec")
        }
        const text = await res.text()
        setPreviewContent(text)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load spec"
        setPreviewError(msg)
      } finally {
        setPreviewLoading(false)
      }
    },
    [projectId]
  )

  const handleClosePreview = useCallback(() => {
    setPreviewSpec(null)
    setPreviewContent(null)
    setPreviewError(null)
  }, [])

  const handleDownload = useCallback(
    (spec: SpecListItem) => {
      const url = `/api/projects/${projectId}/specs/${spec.id}/download`
      const a = document.createElement("a")
      a.href = url
      a.download = spec.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    [projectId]
  )

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return

    const prompt = input
    const senderId = self?.id ?? self?.connectionId?.toString() ?? "anon"
    const senderName = (self?.info?.name as string) ?? "You"
    const senderAvatar = (self?.info?.avatar as string) ?? undefined
    const senderColor = (self?.info?.color as string) ?? undefined

    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sender: { id: senderId, name: senderName, avatar: senderAvatar, color: senderColor },
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    }

    try {
      pushChat(userMessage)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send"
      setSendError(msg)
      return
    }

    setInput("")
    setSendError(null)
    setIsGenerating(true)
    updateMyPresence({ thinking: true })
    setStatus({
      status: "running",
      text: "Generating design…",
      timestamp: Date.now(),
    })

    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, projectId, roomId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Design request failed")
      }

      if (data.runId && data.publicToken) {
        setActiveRun({ runId: data.runId, publicToken: data.publicToken })
      }

      window.dispatchEvent(
        new CustomEvent("canvas-import-template", {
          detail: { nodes: data.nodes ?? [], edges: data.edges ?? [] },
        })
      )

      pushChat({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender: { id: "ai", name: "Ghost AI" },
        role: "assistant",
        content: data.explanation ?? "Design generated.",
        timestamp: Date.now(),
      })

      setStatus({ status: "completed", timestamp: Date.now() })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      pushChat({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender: { id: "ai", name: "Ghost AI" },
        role: "assistant",
        content: `Error: ${msg}`,
        timestamp: Date.now(),
      })
      setStatus({ status: "error", text: msg, timestamp: Date.now() })
    } finally {
      setIsGenerating(false)
      setActiveRun(null)
      updateMyPresence({ thinking: false })
    }
  }, [
    input,
    isGenerating,
    projectId,
    roomId,
    self,
    pushChat,
    setStatus,
    updateMyPresence,
  ])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!open) return null

  const showStatusStrip = isAiActive && aiStatusFeed?.status === "running"
  const hasChat = chatMessages.length > 0

  return (
    <>
      <aside className="fixed inset-y-3 right-3 top-[4.25rem] z-50 flex w-[25rem] flex-col overflow-hidden rounded-3xl border border-border-default/80 bg-bg-surface/92 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent-ai/12 to-transparent" />
        <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-border-default/80 px-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary-dim">
              <Bot className="h-4 w-4 text-accent-primary" />
              {isAiActive && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-accent-primary">
                  <Loader2 className="h-2 w-2 animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">AI Workspace</h2>
              <p className="text-xs text-text-muted">
                {isAiActive
                  ? aiStatusFeed?.text || "Generating..."
                  : "Collaborate with Ghost AI"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="cursor-pointer">
            <X className="h-4 w-4" />
            <span className="sr-only">Close AI sidebar</span>
          </Button>
        </div>

        <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 h-10 gap-1 rounded-xl border border-border-default/70 bg-bg-elevated/60 p-1">
            <TabsTrigger
              value="architect"
              className="h-full flex-1 cursor-pointer rounded-lg text-xs data-active:border-border-subtle data-active:bg-bg-subtle data-active:text-text-primary"
            >
              <Sparkles className="mr-1.5 h-3 w-3" />
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="h-full flex-1 cursor-pointer rounded-lg text-xs data-active:border-border-subtle data-active:bg-bg-subtle data-active:text-text-primary"
            >
              <FileText className="mr-1.5 h-3 w-3" />
              Specs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="architect" className="flex flex-1 flex-col overflow-hidden m-0 p-0">
            <ScrollArea className="flex-1">
              <div className="flex flex-col p-4">
                {!hasChat ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary-dim">
                      <Bot className="h-6 w-6 text-accent-primary" />
                    </div>
                    <p className="mb-4 text-sm text-text-muted">
                      Describe your system and Ghost AI will help architect it
                    </p>
                    <div className="mt-2 flex w-full flex-col gap-2 px-1">
                      {STARTER_CHIPS.map((chip) => {
                        const Icon = chip.icon
                        return (
                          <button
                            key={chip.prompt}
                            onClick={() => setInput(chip.prompt)}
                            className={`group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-border-default/70 bg-bg-elevated/60 p-3 text-left shadow-sm ${chip.glow} transition-all hover:border-border-subtle hover:bg-bg-elevated hover:shadow-md`}
                          >
                            <div
                              className={`pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br ${chip.ring} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                            />
                            <div
                              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-default/60 bg-bg-subtle/70 ${chip.accent}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                              <span className="text-sm font-medium tracking-tight text-text-primary">
                                {chip.title}
                              </span>
                              <span className="text-[11px] text-text-muted">
                                {chip.subtitle}
                              </span>
                            </div>
                            <ArrowUpRight
                              className={`relative z-10 h-4 w-4 shrink-0 ${chip.accent} opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100`}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {chatMessages.map((msg) => {
                      const isUser = msg.role === "user"
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                            <span>{msg.sender.name}</span>
                            <span>·</span>
                            <span>{formatTime(msg.timestamp)}</span>
                          </div>
                          <div
                             className={`max-w-[85%] rounded-2xl border px-3 py-2 text-sm ${
                               isUser
                                 ? "border-state-success/30 bg-state-success/85 text-bg-base"
                                 : "border-border-default bg-bg-elevated text-text-primary"
                             }`}
                           >
                             {msg.content}
                           </div>
                        </div>
                      )
                    })}
                    {isGenerating && (
                      <div className="mr-auto flex items-center gap-2 rounded-xl border border-border-default bg-bg-elevated px-3 py-2 text-sm text-text-muted">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating design…
                      </div>
                    )}
                  </div>
                )}
                {/* Invisible element for auto-scrolling to bottom */}
                <div ref={scrollRef} className="h-px w-full" />
              </div>
            </ScrollArea>

            {showStatusStrip && (
              <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-state-success/30 bg-bg-elevated px-3 py-1.5 text-xs text-text-primary">
                <Loader2 className="h-3 w-3 animate-spin text-state-success" />
                <span className="truncate">{aiStatusFeed?.text || "Run active"}</span>
                <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-state-success" />
              </div>
            )}

            {sendError && (
              <div className="mx-3 mb-2 rounded-lg border border-state-error/40 bg-bg-elevated px-3 py-1.5 text-xs text-state-error">
                {sendError}
              </div>
            )}

            <div className="border-t border-border-default p-3">
              <div
                className={`relative flex min-h-[72px] max-h-[160px] items-end rounded-xl border bg-bg-surface ${
                  isAiActive ? "border-border-default opacity-70" : "border-border-default"
                }`}
              >
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what you want to build..."
                  disabled={isAiActive}
                  className="flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:ring-0 disabled:opacity-50 dark:bg-transparent"
                  style={{ minHeight: "72px", maxHeight: "160px" }}
                />
                <Button
                  size="icon-sm"
                  className="m-2 h-8 w-8 shrink-0 rounded-lg border border-transparent bg-bg-subtle text-text-muted enabled:bg-state-success enabled:text-bg-base"
                  onClick={handleSend}
                  disabled={!input.trim() || isAiActive}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="flex flex-1 flex-col overflow-hidden m-0 p-4">
            <Button
              onClick={handleGenerateSpec}
              disabled={generatingSpec}
              className="mb-3 h-10 w-full bg-state-success text-bg-base shadow-lg shadow-state-success/20 hover:opacity-90"
            >
              {generatingSpec ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {generatingSpec ? "Generating…" : "Generate Spec"}
            </Button>

            {specError && (
              <div className="mb-3 rounded-lg border border-state-error/40 bg-bg-elevated px-3 py-1.5 text-xs text-state-error">
                {specError}
              </div>
            )}

            <div className="flex-1 overflow-hidden">
              {specsLoading ? (
                <div className="flex items-center justify-center py-8 text-xs text-text-muted">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Loading specs…
                </div>
              ) : specsError ? (
                <div className="rounded-lg border border-state-error/40 bg-bg-elevated px-3 py-2 text-xs text-state-error">
                  {specsError}
                </div>
              ) : specs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-2 h-6 w-6 text-text-muted" />
                  <p className="text-xs text-text-muted">
                    No specs yet. Generate one from the current canvas.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <ul className="flex flex-col gap-1.5 pr-1">
                    {specs.map((spec) => (
                      <li
                        key={spec.id}
                        className="group flex items-center gap-2 rounded-xl border border-border-default bg-bg-elevated px-3 py-2 transition-colors hover:border-accent-primary/40"
                      >
                        <button
                          onClick={() => handleOpenPreview(spec)}
                          className="flex flex-1 items-center gap-2 text-left"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-accent-primary" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-text-primary">
                              {spec.filename}
                            </p>
                            <p className="text-[10px] text-text-muted">
                              {formatSpecDate(spec.createdAt)}
                            </p>
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDownload(spec)}
                          className="h-7 w-7 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-text-primary"
                          aria-label={`Download ${spec.filename}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </aside>

      <Dialog
        open={previewSpec !== null}
        onOpenChange={(open) => {
          if (!open) handleClosePreview()
        }}
      >
          <DialogContent className="max-w-2xl border-border-default/80 bg-bg-surface/95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent-primary" />
              {previewSpec?.filename}
            </DialogTitle>
            {previewSpec && (
              <DialogDescription>
                Generated {formatSpecDate(previewSpec.createdAt)}
              </DialogDescription>
            )}
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] rounded-lg border border-border-default bg-bg-elevated p-4">
            {previewLoading ? (
              <div className="flex items-center justify-center py-8 text-xs text-text-muted">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Loading…
              </div>
            ) : previewError ? (
              <p className="text-xs text-state-error">{previewError}</p>
            ) : previewContent ? (
              <article className="prose prose-invert prose-sm max-w-none text-sm text-text-primary [&_h1]:text-text-primary [&_h2]:text-text-primary [&_h3]:text-text-primary [&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:mb-2 [&_p]:leading-relaxed [&_p]:text-text-secondary [&_ul]:mb-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:text-text-secondary [&_code]:rounded [&_code]:bg-bg-subtle [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-accent-primary [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-bg-subtle [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-accent-primary [&_a]:underline [&_strong]:text-text-primary [&_blockquote]:border-l-2 [&_blockquote]:border-accent-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_hr]:my-4 [&_hr]:border-border-default">
                <ReactMarkdown>{previewContent}</ReactMarkdown>
              </article>
            ) : null}
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleClosePreview}>
              Close
            </Button>
            {previewSpec && (
              <Button
                size="sm"
                onClick={() => handleDownload(previewSpec)}
                className="bg-state-success text-bg-base shadow-md shadow-state-success/20 hover:opacity-90"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
