"use client"

import "@xyflow/react/dist/style.css"
import { useCallback, type DragEvent } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  MarkerType,
  useReactFlow,
  type Edge,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { CanvasNode } from "./canvas-node"
import { ShapePanel } from "./shape-panel"
import {
  CANVAS_NODE_TYPE,
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  SHAPE_DRAG_MIME,
  type CanvasNode as CanvasNodeT,
  type ShapeDragPayload,
} from "@/types/canvas"

const nodeTypes: NodeTypes = {
  [CANVAS_NODE_TYPE]: CanvasNode,
}

const defaultEdgeOptions = {
  type: "smoothstep" as const,
  style: { stroke: DEFAULT_EDGE_COLOR, strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: DEFAULT_EDGE_COLOR },
}

let nodeCounter = 0
function nextNodeId(shape: string): string {
  nodeCounter += 1
  return `${shape}-${Date.now().toString(36)}-${nodeCounter}`
}

function CanvasInner() {
  const { screenToFlowPosition } = useReactFlow()

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNodeT, Edge>({
      suspense: true,
    })

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

  const minimapNodeColor = useCallback((_n: CanvasNodeT) => "#3a3a42", [])

  return (
    <div
      className="relative h-full w-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow<CanvasNodeT, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#2a2a30"
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={minimapNodeColor}
          maskColor="rgba(8, 8, 9, 0.7)"
          className="!bg-bg-surface !border !border-border-default !rounded-xl"
        />
      </ReactFlow>
      <ShapePanel />
    </div>
  )
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}
