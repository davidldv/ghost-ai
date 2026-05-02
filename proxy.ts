import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PROTECTED = [/^\/project(?:\/|$)/, /^\/canvas(?:\/|$)/, /^\/editor(?:\/|$)/]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some((re) => re.test(pathname))
  if (isProtected && !req.auth) {
    const url = new URL("/sign-in", req.nextUrl.origin)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
