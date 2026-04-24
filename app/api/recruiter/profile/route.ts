import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, recruiterProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "recruiter") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const body = await req.json()
  const { name, company, description, website } = body

  if (name !== undefined) {
    await db.update(users).set({ name }).where(eq(users.id, dbUser[0].id))
  }

  const profileData = { company, description, website }
  const filtered = Object.fromEntries(
    Object.entries(profileData).filter(([, v]) => v !== undefined)
  )

  await db
    .update(recruiterProfiles)
    .set(filtered)
    .where(eq(recruiterProfiles.userId, dbUser[0].id))

  return NextResponse.json({ ok: true })
}
