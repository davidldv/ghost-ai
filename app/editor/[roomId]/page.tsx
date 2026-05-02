import { redirect } from "next/navigation"
import { getCurrentIdentity, checkProjectAccess } from "@/lib/project-access"
import { getEditorProjects } from "@/lib/projects"
import { prisma } from "@/lib/prisma"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "./workspace-shell"

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default async function WorkspacePage({ params }: PageProps) {
  const { roomId } = await params

  const identity = await getCurrentIdentity()
  if (!identity) {
    redirect(`/sign-in?callbackUrl=/editor/${roomId}`)
  }

  const project = await prisma.project.findUnique({
    where: { id: roomId },
    select: { id: true, name: true },
  })

  if (!project) return <AccessDenied />

  const { hasAccess, isOwner } = await checkProjectAccess(
    roomId,
    identity.userId,
    identity.email
  )

  if (!hasAccess) return <AccessDenied />

  const { ownedProjects, sharedProjects } = await getEditorProjects()

  return (
    <WorkspaceShell
      projectId={roomId}
      projectName={project.name}
      isOwner={isOwner}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  )
}
