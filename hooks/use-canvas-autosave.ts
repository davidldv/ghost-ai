"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { use } from "react"

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface UseCanvasAutosaveOptions {
  projectId: string
  nodes: unknown[]
  edges: unknown[]
}

export function useCanvasAutosave({ projectId, nodes, edges }: UseCanvasAutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>("")

  const save = useCallback(async () => {
    const currentData = JSON.stringify({ nodes, edges })
    if (currentData === lastSavedRef.current) {
      setStatus("saved")
      return
    }

    setStatus("saving")

    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: currentData,
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        console.error("[canvas autosave] PUT failed", response.status, text)
        throw new Error("Failed to save")
      }

      lastSavedRef.current = currentData
      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }, [projectId, nodes, edges])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      save()
    }, 2000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [nodes, edges, save])

  return { status, save }
}