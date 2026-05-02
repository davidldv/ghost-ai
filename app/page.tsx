import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const Home = async () => {
  const session = await auth()
  redirect(session ? "/editor" : "/sign-in")
}

export default Home
