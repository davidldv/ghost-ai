"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { ShareDialog } from "@/components/editor/dialogs/share-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { CanvasRoom } from "@/components/canvas/canvas-room"
import { useProjectActions, type ProjectRow } from "@/hooks/use-project-actions"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

interface WorkspaceShellProps {
  projectId: string
  projectName: string
  isOwner: boolean
  ownedProjects: ProjectRow[]
  sharedProjects: ProjectRow[]
}

export function WorkspaceShell({
  projectId,
  projectName,
  isOwner,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)

  const handleImportTemplate = (template: CanvasTemplate) => {
    window.dispatchEvent(
      new CustomEvent("canvas-import-template", {
        detail: {
          nodes: template.nodes,
          edges: template.edges,
        },
      })
    )
  }

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
  } = useProjectActions({ activeProjectId: projectId })

  return (
    <div className="h-screen bg-bg-base text-text-primary overflow-hidden">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((v) => !v)}
        projectName={projectName}
        onShare={() => setIsShareOpen(true)}
        onAiToggle={() => setIsAiOpen((v) => !v)}
        isAiOpen={isAiOpen}
        onTemplates={() => setIsTemplatesOpen(true)}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onNewProject={openCreate}
        onRename={openRename}
        onDelete={openDelete}
        activeProjectId={projectId}
      />

      <main className="h-full bg-bg-base pt-14">
        <CanvasRoom
          roomId={projectId}
          isAiOpen={isAiOpen}
          onAiClose={() => setIsAiOpen(false)}
          projectId={projectId}
        />
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

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        projectId={projectId}
        isOwner={isOwner}
      />

      <StarterTemplatesModal
        open={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onImport={handleImportTemplate}
      />
    </div>
  )
}
