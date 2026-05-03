"use client"

import { Component, ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import { LiveObject, LiveList } from "@liveblocks/client"
import { Canvas } from "./canvas"
import { AISidebar } from "@/components/editor/ai-sidebar"

interface CanvasRoomProps {
  roomId: string
  isAiOpen: boolean
  onAiClose: () => void
  projectId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

class LiveblocksErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center max-w-md px-6">
            <p className="text-sm font-medium text-state-error">
              Couldn&apos;t connect to the realtime room.
            </p>
            <p className="text-xs text-text-muted">{this.state.error.message}</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function CanvasLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <p className="text-sm text-text-muted select-none">Connecting…</p>
    </div>
  )
}

export function CanvasRoom({ roomId, isAiOpen, onAiClose, projectId }: CanvasRoomProps) {
  return (
    <LiveblocksErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, thinking: false }}
          initialStorage={
            new LiveObject({
              aiStatusFeed: null,
              aiChat: new LiveList([]),
            }) as any
          }
        >
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <Canvas projectId={roomId} />
            <AISidebar
              open={isAiOpen}
              onClose={onAiClose}
              projectId={projectId}
              roomId={roomId}
            />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </LiveblocksErrorBoundary>
  )
}
