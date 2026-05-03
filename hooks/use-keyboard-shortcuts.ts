"use client"

import { useEffect, useCallback, useRef } from "react"
import { useReactFlow } from "@xyflow/react"

interface UseKeyboardShortcutsOptions {
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: UseKeyboardShortcutsOptions) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const canUndoRef = useRef(canUndo)
  const canRedoRef = useRef(canRedo)
  const onUndoRef = useRef(onUndo)
  const onRedoRef = useRef(onRedo)

  useEffect(() => {
    canUndoRef.current = canUndo
  }, [canUndo])

  useEffect(() => {
    canRedoRef.current = canRedo
  }, [canRedo])

  useEffect(() => {
    onUndoRef.current = onUndo
  }, [onUndo])

  useEffect(() => {
    onRedoRef.current = onRedo
  }, [onRedo])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const isEditing =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable

    if (isEditing) return

    const isZoomIn = e.key === "+" || e.key === "="
    const isZoomOut = e.key === "-"
    const isUndo =
      (e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey
    const isRedoMeta = (e.metaKey || e.ctrlKey) && e.key === "y"
    const isRedoShift =
      (e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey

    if (isZoomIn) {
      e.preventDefault()
      zoomIn({ duration: 200 })
    } else if (isZoomOut) {
      e.preventDefault()
      zoomOut({ duration: 200 })
    } else if (isUndo && canUndoRef.current) {
      e.preventDefault()
      onUndoRef.current()
    } else if ((isRedoMeta || isRedoShift) && canRedoRef.current) {
      e.preventDefault()
      onRedoRef.current()
    }
  }, [zoomIn, zoomOut])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])
}