"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

export interface ProjectRow {
  id: string
  name: string
  owned: boolean
}

export type DialogType = "create" | "rename" | "delete" | null

interface UseProjectActionsOptions {
  activeProjectId?: string
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}

export function useProjectActions(options: UseProjectActionsOptions = {}) {
  const { activeProjectId } = options
  const router = useRouter()

  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [activeProject, setActiveProject] = useState<ProjectRow | null>(null)
  const [name, setName] = useState("")
  const [suffix, setSuffix] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slugPreview = useMemo(() => {
    const s = toSlug(name)
    return s && suffix ? `${s}-${suffix}` : ""
  }, [name, suffix])

  const openCreate = useCallback(() => {
    setSuffix(shortSuffix())
    setName("")
    setActiveProject(null)
    setError(null)
    setDialogType("create")
  }, [])

  const openRename = useCallback((project: ProjectRow) => {
    setName(project.name)
    setActiveProject(project)
    setError(null)
    setDialogType("rename")
  }, [])

  const openDelete = useCallback((project: ProjectRow) => {
    setActiveProject(project)
    setError(null)
    setDialogType("delete")
  }, [])

  const close = useCallback(() => {
    if (loading) return
    setDialogType(null)
    setActiveProject(null)
    setName("")
    setError(null)
  }, [loading])

  const handleNameChange = useCallback((value: string) => {
    setName(value)
  }, [])

  const submit = useCallback(async () => {
    if (dialogType === null) return
    if (dialogType !== "delete" && !name.trim()) return

    setLoading(true)
    setError(null)
    try {
      if (dialogType === "create") {
        const trimmed = name.trim()
        const id = slugPreview || `${toSlug(trimmed) || "project"}-${suffix || shortSuffix()}`
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name: trimmed }),
        })
        if (!res.ok) throw new Error(`Create failed (${res.status})`)
        const data = (await res.json()) as { project: { id: string } }
        setDialogType(null)
        setActiveProject(null)
        setName("")
        router.push(`/editor/${data.project.id}`)
        router.refresh()
        return
      }

      if (dialogType === "rename" && activeProject) {
        const res = await fetch(`/api/projects/${activeProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        })
        if (!res.ok) throw new Error(`Rename failed (${res.status})`)
        setDialogType(null)
        setActiveProject(null)
        setName("")
        router.refresh()
        return
      }

      if (dialogType === "delete" && activeProject) {
        const targetId = activeProject.id
        const res = await fetch(`/api/projects/${targetId}`, { method: "DELETE" })
        if (!res.ok) throw new Error(`Delete failed (${res.status})`)
        setDialogType(null)
        setActiveProject(null)
        setName("")
        if (activeProjectId === targetId) {
          router.push("/editor")
        } else {
          router.refresh()
        }
        return
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setLoading(false)
    }
  }, [dialogType, name, slugPreview, suffix, activeProject, activeProjectId, router])

  return {
    dialogType,
    activeProject,
    name,
    slugPreview,
    loading,
    error,
    openCreate,
    openRename,
    openDelete,
    close,
    handleNameChange,
    submit,
  }
}
