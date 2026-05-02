"use client"

import { Component, ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import { Canvas } from "./canvas"

interface CanvasRoomProps {
  roomId: string
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

export function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <LiveblocksErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <Canvas />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </LiveblocksErrorBoundary>
  )
}
