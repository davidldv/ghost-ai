import { getEditorProjects } from "@/lib/projects"
import { EditorHome } from "./editor-home"

export default async function EditorHomePage() {
  const { ownedProjects, sharedProjects } = await getEditorProjects()
  return <EditorHome ownedProjects={ownedProjects} sharedProjects={sharedProjects} />
}
