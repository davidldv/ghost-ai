"use client"

import "@xyflow/react/dist/style.css"
import { useCallback, useRef, useEffect, type DragEvent, useState } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useHistory, useMyPresence } from "@liveblocks/react"
import { CanvasNode } from "./canvas-node"
import { CanvasEdge } from "./canvas-edge"
import { ShapePanel } from "./shape-panel"
import { CanvasControls } from "./canvas-controls"
import { PresenceAvatars } from "./presence-avatars"
import { LiveCursors } from "./live-cursors"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave"
import {
  CANVAS_NODE_TYPE,
  CANVAS_EDGE_TYPE,
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  SHAPE_DRAG_MIME,
  SHAPE_DEFAULT_SIZES,
  NODE_COLORS,
  type CanvasNode as CanvasNodeT,
  type CanvasEdge as CanvasEdgeT,
  type ShapeDragPayload,
  type CanvasNodeData,
  type CanvasEdgeData,
} from "@/types/canvas"

const nodeTypes: NodeTypes = {
  [CANVAS_NODE_TYPE]: CanvasNode,
}

const edgeTypes: EdgeTypes = {
  [CANVAS_EDGE_TYPE]: CanvasEdge,
}

const defaultEdgeOptions = {
  type: CANVAS_EDGE_TYPE,
  data: { label: undefined },
  style: { stroke: DEFAULT_EDGE_COLOR, strokeWidth: 1.5 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: DEFAULT_EDGE_COLOR,
    width: 18,
    height: 18,
  },
}

let nodeCounter = 0
function nextNodeId(shape: string): string {
  nodeCounter += 1
  return `${shape}-${Date.now().toString(36)}-${nodeCounter}`
}

function CanvasInner({ projectId }: { projectId: string }) {
  const { screenToFlowPosition, zoomIn: rfZoomIn, zoomOut: rfZoomOut, fitView: rfFitView } = useReactFlow()
  const history = useHistory()

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNodeT, Edge>({
      suspense: true,
    })

  const { status: saveStatus } = useCanvasAutosave({
    projectId,
    nodes,
    edges,
  })

  const [hasLoadedInitial, setHasLoadedInitial] = useState(false)

  useEffect(() => {
    if (hasLoadedInitial) return
    if (nodes.length > 0 || edges.length > 0) {
      setHasLoadedInitial(true)
      return
    }

    fetch(`/api/projects/${projectId}/canvas`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.nodes?.length || data.data?.edges?.length) {
          const nodeChanges: NodeChange<CanvasNodeT>[] = data.data.nodes.map(
            (n: CanvasNodeT) => ({ type: "add" as const, item: n })
          )
          const edgeChanges = data.data.edges.map(
            (e: CanvasEdgeT) => ({ type: "add" as const, item: e })
          )
          onNodesChange(nodeChanges)
          onEdgesChange(edgeChanges as any)
        }
        setHasLoadedInitial(true)
      })
      .catch(() => setHasLoadedInitial(true))
  }, [nodes, edges, projectId, onNodesChange, onEdgesChange, hasLoadedInitial])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("canvas-save-status", { detail: saveStatus }))
  }, [saveStatus])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("canvas-state", { detail: { nodes, edges } })
    )
  }, [nodes, edges])

  useEffect(() => {
    const handleRequest = () => {
      window.dispatchEvent(
        new CustomEvent("canvas-state", { detail: { nodes, edges } })
      )
    }
    window.addEventListener("canvas-state-request", handleRequest)
    return () => window.removeEventListener("canvas-state-request", handleRequest)
  }, [nodes, edges])

  const canUndo = history?.canUndo() ?? false
  const canRedo = history?.canRedo() ?? false

  const handleUndo = useCallback(() => {
    history?.undo()
  }, [history])

  const handleRedo = useCallback(() => {
    history?.redo()
  }, [history])

  const [, updateMyPresence] = useMyPresence()

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateMyPresence({
        cursor: { x: e.clientX, y: e.clientY },
      })
    },
    [updateMyPresence]
  )

  const onMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  const zoomIn = useCallback(() => {
    rfZoomIn({ duration: 200 })
  }, [rfZoomIn])

  const zoomOut = useCallback(() => {
    rfZoomOut({ duration: 200 })
  }, [rfZoomOut])

  const fitView = useCallback(() => {
    rfFitView({ duration: 200, padding: 0.2 })
  }, [rfFitView])

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes(SHAPE_DRAG_MIME)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
    }
  }, [])

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      const raw = e.dataTransfer.getData(SHAPE_DRAG_MIME)
      if (!raw) return
      e.preventDefault()

      let payload: ShapeDragPayload
      try {
        payload = JSON.parse(raw) as ShapeDragPayload
      } catch {
        return
      }

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const position = {
        x: flowPos.x - payload.width / 2,
        y: flowPos.y - payload.height / 2,
      }

      const newNode: CanvasNodeT = {
        id: nextNodeId(payload.shape),
        type: CANVAS_NODE_TYPE,
        position,
        width: payload.width,
        height: payload.height,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          shape: payload.shape,
        },
      }

      const change: NodeChange<CanvasNodeT> = { type: "add", item: newNode }
      onNodesChange([change])
    },
    [screenToFlowPosition, onNodesChange]
  )

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    canUndo,
    canRedo,
  })

  useEffect(() => {
    const handleZoomIn = () => zoomIn()
    const handleZoomOut = () => zoomOut()
    const handleFitView = () => fitView()

    window.addEventListener("canvas-zoom-in", handleZoomIn)
    window.addEventListener("canvas-zoom-out", handleZoomOut)
    window.addEventListener("canvas-fit-view", handleFitView)

    return () => {
      window.removeEventListener("canvas-zoom-in", handleZoomIn)
      window.removeEventListener("canvas-zoom-out", handleZoomOut)
      window.removeEventListener("canvas-fit-view", handleFitView)
    }
  }, [zoomIn, zoomOut, fitView])

  useEffect(() => {
    const handleImportTemplate = (e: CustomEvent<{ nodes: Node<CanvasNodeData>[]; edges: Edge<CanvasEdgeData>[] }>) => {
      const { nodes: templateNodes, edges: templateEdges } = e.detail

      const removeNodeChanges: NodeChange<CanvasNodeT>[] = nodes.map((n) => ({
        type: "remove" as const,
        id: n.id,
      }))
      const addNodeChanges: NodeChange<CanvasNodeT>[] = templateNodes.map((n) => {
        const shape = (n.data as CanvasNodeData).shape
        const size = SHAPE_DEFAULT_SIZES[shape] ?? { width: 180, height: 90 }
        return {
          type: "add" as const,
          item: {
            ...n,
            type: CANVAS_NODE_TYPE,
            width: n.width ?? size.width,
            height: n.height ?? size.height,
          } as CanvasNodeT,
        }
      })

      const removeEdgeChanges = edges.map((e) => ({
        type: "remove" as const,
        id: e.id,
      }))
      const addEdgeChanges = templateEdges.map((e) => ({
        type: "add" as const,
        item: {
          ...e,
          type: CANVAS_EDGE_TYPE,
        } as CanvasEdgeT,
      }))

      onNodesChange([...removeNodeChanges, ...addNodeChanges] as NodeChange<CanvasNodeT>[])
      onEdgesChange([...removeEdgeChanges, ...addEdgeChanges] as any)

      setTimeout(() => {
        rfFitView({ duration: 200, padding: 0.2 })
      }, 100)
    }

    window.addEventListener("canvas-import-template", handleImportTemplate as EventListener)
    return () => {
      window.removeEventListener("canvas-import-template", handleImportTemplate as EventListener)
    }
  }, [nodes, edges, onNodesChange, onEdgesChange, rfFitView])

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 30%, #15151b 0%, #0c0c10 55%, #07070a 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(82,168,255,0.06), transparent 45%), radial-gradient(circle at 80% 85%, rgba(191,122,240,0.05), transparent 50%)",
        }}
      />
      <LiveCursors />
      <PresenceAvatars />
      <ReactFlow<CanvasNodeT, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
        style={{ background: "transparent" }}
      >
        <Background
          id="grid-dots"
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.2}
          color="#2d2d36"
        />
        <Background
          id="grid-cross"
          variant={BackgroundVariant.Cross}
          gap={140}
          size={6}
          color="#3a3a44"
          style={{ opacity: 0.35 }}
        />
      </ReactFlow>
      <CanvasControls
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <ShapePanel />
    </div>
  )
}

export function Canvas({ projectId }: { projectId: string }) {
  return (
    <ReactFlowProvider>
      <CanvasInner projectId={projectId} />
    </ReactFlowProvider>
  )
}