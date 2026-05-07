import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import type { User } from "@/lib/db/schema"

/** Fields from the Google OAuth session needed by Navbar and pages. */
export interface SessionUser {
  name: string | null
  email: string
  image: string | null
}

export interface AuthResult {
  sessionUser: SessionUser
  dbUser: User
}

export async function requireUser(): Promise<AuthResult> {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))

  if (!dbUser) redirect("/login")

  const sessionUser: SessionUser = {
    name: session.user.name ?? null,
    email: session.user.email,
    image: session.user.image ?? null,
  }

  return { sessionUser, dbUser }
}

export async function requireCandidate(): Promise<AuthResult> {
  const result = await requireUser()
  if (result.dbUser.role !== "candidate") redirect("/jobs")
  return result
}

export async function requireRecruiter(): Promise<AuthResult> {
  const result = await requireUser()
  if (result.dbUser.role !== "recruiter") redirect("/applications")
  return result
}
