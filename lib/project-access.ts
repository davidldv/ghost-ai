import "server-only"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface ProjectIdentity {
  userId: string
  email: string | null
}

export async function getCurrentIdentity(): Promise<ProjectIdentity | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return { userId: session.user.id, email: session.user.email ?? null }
}

export async function checkProjectAccess(
  projectId: string,
  userId: string,
  email: string | null
): Promise<{ hasAccess: boolean; isOwner: boolean }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })

  if (!project) return { hasAccess: false, isOwner: false }
  if (project.ownerId === userId) return { hasAccess: true, isOwner: true }

  if (email) {
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
      select: { email: true },
    })
    if (collab) return { hasAccess: true, isOwner: false }
  }

  return { hasAccess: false, isOwner: false }
}
