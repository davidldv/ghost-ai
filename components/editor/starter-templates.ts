import type { Node, Edge } from "@xyflow/react"
import type { CanvasNodeData, NodeShape, CanvasEdgeData } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: Node<CanvasNodeData>[]
  edges: Edge<CanvasEdgeData>[]
}

function createNode(
  id: string,
  label: string,
  shape: NodeShape,
  color: string,
  x: number,
  y: number
): Node<CanvasNodeData> {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: {
      label,
      color,
      shape,
    },
  }
}

function createEdge(
  id: string,
  source: string,
  target: string,
  label?: string
): Edge<CanvasEdgeData> {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: label ? { label } : undefined,
  }
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "A basic microservices architecture with API gateway, services, and database",
    nodes: [
      createNode("gateway", "API Gateway", "rectangle", "blue", 420, 40),
      createNode("auth", "Auth Service", "rectangle", "purple", 80, 220),
      createNode("users", "User Service", "rectangle", "purple", 420, 220),
      createNode("orders", "Order Service", "rectangle", "purple", 760, 220),
      createNode("db-users", "User DB", "cylinder", "green", 230, 420),
      createNode("db-orders", "Order DB", "cylinder", "green", 760, 420),
      createNode("queue", "Message Queue", "pill", "orange", 420, 440),
    ],
    edges: [
      createEdge("e1", "gateway", "auth", "Auth"),
      createEdge("e2", "gateway", "users", "Users"),
      createEdge("e3", "gateway", "orders", "Orders"),
      createEdge("e4", "auth", "db-users", "Read/Write"),
      createEdge("e5", "users", "db-users", "Read/Write"),
      createEdge("e6", "orders", "db-orders", "Persist"),
      createEdge("e7", "orders", "queue", "Publish"),
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description: "A continuous integration and deployment pipeline with testing and staging",
    nodes: [
      createNode("repo", "Git Repository", "circle", "blue", 40, 120),
      createNode("build", "Build", "rectangle", "purple", 220, 130),
      createNode("test", "Unit Tests", "rectangle", "orange", 460, 130),
      createNode("integration", "Integration Tests", "rectangle", "orange", 700, 130),
      createNode("staging", "Staging", "rectangle", "green", 940, 130),
      createNode("prod", "Production", "rectangle", "teal", 1180, 130),
      createNode("rollback", "Rollback", "diamond", "red", 1180, 320),
    ],
    edges: [
      createEdge("e1", "repo", "build", "Push"),
      createEdge("e2", "build", "test", "Artifact"),
      createEdge("e3", "test", "integration", "Pass"),
      createEdge("e4", "integration", "staging", "Deploy"),
      createEdge("e5", "staging", "prod", "Promote"),
      createEdge("e6", "prod", "rollback", "On failure"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven",
    description: "An event-driven architecture with event bus, producers, and consumers",
    nodes: [
      createNode("producer1", "Producer A", "rectangle", "blue", 40, 60),
      createNode("producer2", "Producer B", "rectangle", "blue", 40, 260),
      createNode("eventbus", "Event Bus", "hexagon", "purple", 380, 160),
      createNode("consumer1", "Consumer X", "rectangle", "green", 720, 40),
      createNode("consumer2", "Consumer Y", "rectangle", "green", 720, 200),
      createNode("consumer3", "Consumer Z", "rectangle", "green", 720, 360),
      createNode("storage", "Event Store", "cylinder", "orange", 380, 420),
    ],
    edges: [
      createEdge("e1", "producer1", "eventbus", "Emit"),
      createEdge("e2", "producer2", "eventbus", "Emit"),
      createEdge("e3", "eventbus", "consumer1", "Subscribe"),
      createEdge("e4", "eventbus", "consumer2", "Subscribe"),
      createEdge("e5", "eventbus", "consumer3", "Subscribe"),
      createEdge("e6", "eventbus", "storage", "Persist"),
    ],
  },
]