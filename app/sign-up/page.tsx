import { AuthShell } from "@/components/auth/auth-shell"
import { AuthForm } from "@/components/auth/auth-form"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

const SignUpPage = async ({ searchParams }: PageProps) => {
  const session = await auth()
  if (session) redirect("/editor")
  const { callbackUrl } = await searchParams
  return (
    <AuthShell>
      <AuthForm mode="sign-up" callbackUrl={callbackUrl ?? "/editor"} />
    </AuthShell>
  )
}

export default SignUpPage
