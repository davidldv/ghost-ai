"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { useProjectActions, type ProjectRow } from "@/hooks/use-project-actions"

interface EditorHomeProps {
  ownedProjects: ProjectRow[]
  sharedProjects: ProjectRow[]
}

export function EditorHome({ ownedProjects, sharedProjects }: EditorHomeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const {
    dialogType,
    activeProject,
    name,
    slugPreview,
    loading,
    openCreate,
    openRename,
    openDelete,
    close,
    handleNameChange,
    submit,
  } = useProjectActions()

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((v) => !v)}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onNewProject={openCreate}
        onRename={openRename}
        onDelete={openDelete}
      />

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        </div>

        <div className="relative flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl border border-border-default/70 bg-bg-surface/70 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
          <span className="rounded-full border border-border-default/70 bg-bg-elevated/70 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-text-muted uppercase">
            Workspace
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            Build your next architecture project
          </h1>
          <p className="max-w-md text-sm text-text-secondary">
            Launch a fresh canvas in seconds, or jump into an existing project from the sidebar.
          </p>
          <Button onClick={openCreate} className="h-10 gap-2 rounded-xl px-5 font-medium shadow-lg shadow-brand/25">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>

      <CreateProjectDialog
        open={dialogType === "create"}
        onOpenChange={(open) => (!open ? close() : null)}
        name={name}
        slugPreview={slugPreview}
        loading={loading}
        onNameChange={handleNameChange}
        onSubmit={submit}
      />

      <RenameProjectDialog
        open={dialogType === "rename"}
        onOpenChange={(open) => (!open ? close() : null)}
        currentName={activeProject?.name ?? ""}
        name={name}
        loading={loading}
        onNameChange={handleNameChange}
        onSubmit={submit}
      />

      <DeleteProjectDialog
        open={dialogType === "delete"}
        onOpenChange={(open) => (!open ? close() : null)}
        projectName={activeProject?.name ?? ""}
        loading={loading}
        onConfirm={submit}
      />
    </div>
  )
}
