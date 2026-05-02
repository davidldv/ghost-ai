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

      <main className="pt-12 min-h-screen flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 text-center max-w-lg">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Create a project or open an existing one
          </h1>
          <p className="text-sm text-text-secondary">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button onClick={openCreate} className="gap-2">
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
