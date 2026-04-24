import { auth } from "@/lib/proxy"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Session } from "next-auth"

type AuthRequest = NextRequest & { auth: Session | null }

export default auth((req: AuthRequest) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = (session?.user as { role?: string })?.role

  // Rutas que no requieren auth
  const publicPaths = ["/", "/jobs", "/login"]
  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/jobs/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")

  if (isPublic) return NextResponse.next()

  // Sin sesión → login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Con sesión pero sin rol → onboarding (excepto si ya está en onboarding)
  if (!role && pathname !== "/onboarding" && !pathname.startsWith("/api/user/role")) {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }

  // Candidato en la home → va a búsqueda de empleos
  if (role === "candidate" && pathname === "/") {
    return NextResponse.redirect(new URL("/jobs", req.url))
  }

  // Candidato intentando acceder a rutas de reclutador
  if (role === "candidate" && pathname.startsWith("/recruiter")) {
    return NextResponse.redirect(new URL("/jobs", req.url))
  }

  // Reclutador intentando acceder a rutas de candidato
  if (role === "recruiter" && pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/recruiter/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
