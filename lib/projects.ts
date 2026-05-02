import "server-only"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ProjectRow } from "@/hooks/use-project-actions"

export async function getEditorProjects(): Promise<{
  ownedProjects: ProjectRow[]
  sharedProjects: ProjectRow[]
}> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ownedProjects: [], sharedProjects: [] }
  }

  const userId = session.user.id
  const email = session.user.email ?? null

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    email
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: { some: { email } },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([] as { id: string; name: string }[]),
  ])

  return {
    ownedProjects: owned.map((p) => ({ id: p.id, name: p.name, owned: true })),
    sharedProjects: shared.map((p) => ({ id: p.id, name: p.name, owned: false })),
  }
}
