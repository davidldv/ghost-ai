"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { ShareDialog } from "@/components/editor/dialogs/share-dialog"
import { CanvasRoom } from "@/components/canvas/canvas-room"
import { useProjectActions, type ProjectRow } from "@/hooks/use-project-actions"

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

      <main className="h-full pt-12 bg-bg-base">
        <CanvasRoom roomId={projectId} />
      </main>

      {isAiOpen && (
        <aside className="fixed inset-y-3 right-3 top-[3.75rem] z-50 flex w-80 flex-col rounded-2xl border border-border-subtle bg-bg-surface/95 backdrop-blur-xl">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-default px-4">
            <span className="text-sm font-medium text-text-primary">AI Assistant</span>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsAiOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close AI sidebar</span>
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-text-muted">AI chat coming soon</p>
          </div>
        </aside>
      )}

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
    </div>
  )
}
