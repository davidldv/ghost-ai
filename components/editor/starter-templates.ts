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
      createNode("gateway", "API Gateway", "rectangle", "blue", 300, 50),
      createNode("auth", "Auth Service", "rectangle", "purple", 100, 150),
      createNode("users", "User Service", "rectangle", "purple", 300, 150),
      createNode("orders", "Order Service", "rectangle", "purple", 500, 150),
      createNode("db-users", "User DB", "cylinder", "green", 100, 300),
      createNode("db-orders", "Order DB", "cylinder", "green", 500, 300),
      createNode("queue", "Message Queue", "pill", "orange", 300, 250),
    ],
    edges: [
      createEdge("e1", "gateway", "auth"),
      createEdge("e2", "gateway", "users"),
      createEdge("e3", "gateway", "orders"),
      createEdge("e4", "auth", "db-users"),
      createEdge("e5", "users", "db-users"),
      createEdge("e6", "orders", "db-orders"),
      createEdge("e7", "orders", "queue"),
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description: "A continuous integration and deployment pipeline with testing and staging",
    nodes: [
      createNode("repo", "Git Repository", "circle", "blue", 50, 100),
      createNode("build", "Build", "rectangle", "purple", 200, 100),
      createNode("test", "Unit Tests", "rectangle", "orange", 350, 100),
      createNode("integration", "Integration Tests", "rectangle", "orange", 500, 100),
      createNode("staging", "Staging", "rectangle", "green", 650, 100),
      createNode("prod", "Production", "rectangle", "teal", 800, 100),
      createNode("rollback", "Rollback", "diamond", "red", 800, 200),
    ],
    edges: [
      createEdge("e1", "repo", "build"),
      createEdge("e2", "build", "test"),
      createEdge("e3", "test", "integration"),
      createEdge("e4", "integration", "staging"),
      createEdge("e5", "staging", "prod"),
      createEdge("e6", "prod", "rollback"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven",
    description: "An event-driven architecture with event bus, producers, and consumers",
    nodes: [
      createNode("producer1", "Producer A", "rectangle", "blue", 50, 50),
      createNode("producer2", "Producer B", "rectangle", "blue", 50, 200),
      createNode("eventbus", "Event Bus", "hexagon", "purple", 300, 125),
      createNode("consumer1", "Consumer X", "rectangle", "green", 550, 50),
      createNode("consumer2", "Consumer Y", "rectangle", "green", 550, 200),
      createNode("consumer3", "Consumer Z", "rectangle", "green", 550, 350),
      createNode("storage", "Event Store", "cylinder", "orange", 300, 350),
    ],
    edges: [
      createEdge("e1", "producer1", "eventbus"),
      createEdge("e2", "producer2", "eventbus"),
      createEdge("e3", "eventbus", "consumer1"),
      createEdge("e4", "eventbus", "consumer2"),
      createEdge("e5", "eventbus", "consumer3"),
      createEdge("e6", "eventbus", "storage"),
    ],
  },
]