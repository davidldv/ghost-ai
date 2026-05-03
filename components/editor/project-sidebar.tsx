"use client"

import Link from "next/link"
import { FolderKanban, Plus, Sparkles, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { ProjectRow } from "@/hooks/use-project-actions"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects: ProjectRow[]
  sharedProjects: ProjectRow[]
  onNewProject: () => void
  onRename: (project: ProjectRow) => void
  onDelete: (project: ProjectRow) => void
  activeProjectId?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  onNewProject,
  onRename,
  onDelete,
  activeProjectId,
}: ProjectSidebarProps) {
  const initialTab = sharedProjects.some((project) => project.id === activeProjectId)
    ? "shared"
    : "my-projects"
  const totalProjects = ownedProjects.length + sharedProjects.length

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-bg-base/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-3 left-3 top-[4.25rem] z-50 flex w-[19rem] flex-col overflow-hidden rounded-3xl border border-border-default/80 bg-bg-surface/90 shadow-2xl backdrop-blur-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand/10 via-accent-dim/20 to-transparent" />

        <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-border-default/80 px-4">
          <div className="min-w-0">
            <div className="mb-0.5 text-[0.65rem] font-semibold tracking-[0.14em] text-text-faint uppercase">
              Workspace
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-brand" />
              <span className="truncate text-sm font-semibold text-text-primary">Projects</span>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <div className="relative flex flex-1 flex-col overflow-hidden p-3">
          <Tabs
            key={`${activeProjectId ?? "home"}-${initialTab}`}
            defaultValue={initialTab}
            className="flex h-full flex-col"
          >
            <TabsList className="h-10 w-full rounded-xl border border-border-default/70 bg-bg-elevated/60 p-1">
              <TabsTrigger
                value="my-projects"
                className="h-full flex-1 rounded-lg text-xs font-medium text-text-muted data-active:border-border-subtle data-active:bg-bg-subtle data-active:text-text-primary"
              >
                My Projects
              </TabsTrigger>
              <TabsTrigger
                value="shared"
                className="h-full flex-1 rounded-lg text-xs font-medium text-text-muted data-active:border-border-subtle data-active:bg-bg-subtle data-active:text-text-primary"
              >
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-projects" className="mt-3 flex-1 overflow-y-auto">
              {ownedProjects.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-default/70 bg-bg-base/30 px-4 text-center">
                  <Sparkles className="h-4 w-4 text-text-faint" />
                  <p className="text-sm font-medium text-text-secondary">No projects yet</p>
                  <p className="text-xs text-text-muted">Create your first workspace to get started.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {ownedProjects.map((project) => (
                    <li key={project.id}>
                      <ProjectItem
                        project={project}
                        kind="owned"
                        active={project.id === activeProjectId}
                        onRename={onRename}
                        onDelete={onDelete}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="shared" className="mt-3 flex-1 overflow-y-auto">
              {sharedProjects.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-default/70 bg-bg-base/30 px-4 text-center">
                  <Sparkles className="h-4 w-4 text-text-faint" />
                  <p className="text-sm font-medium text-text-secondary">No shared projects</p>
                  <p className="text-xs text-text-muted">Shared workspaces will appear here.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {sharedProjects.map((project) => (
                    <li key={project.id}>
                      <ProjectItem
                        project={project}
                        kind="shared"
                        active={project.id === activeProjectId}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="relative shrink-0 border-t border-border-default/80 p-3">
          <Button
            variant="default"
            size="default"
            className="h-9 w-full gap-2 rounded-xl font-medium shadow-lg shadow-brand/25"
            onClick={onNewProject}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}

interface ProjectItemProps {
  project: ProjectRow
  kind: "owned" | "shared"
  active?: boolean
  onRename?: (project: ProjectRow) => void
  onDelete?: (project: ProjectRow) => void
}

function ProjectItem({ project, kind, active = false, onRename, onDelete }: ProjectItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-2xl border px-2.5 py-2 transition-all",
        active
          ? "border-brand/60 bg-accent-dim shadow-sm"
          : "border-border-default/70 bg-bg-base/40 hover:border-border-subtle hover:bg-bg-subtle/80"
      )}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full bg-border-subtle transition-colors",
          active && "bg-accent-primary"
        )}
      />
      <Link
        href={`/editor/${project.id}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "min-w-0 flex-1",
          active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
        )}
      >
        <div className="truncate text-sm font-medium">{project.name}</div>
        <div className="mt-0.5 text-[0.68rem] text-text-faint">
          {kind === "owned" ? "Owner access" : "Shared access"}
        </div>
      </Link>
      {onRename && onDelete && (
        <div className="flex shrink-0 gap-0.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 md:-translate-x-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault()
              onRename(project)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Rename</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault()
              onDelete(project)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )}
    </div>
  )
}
