import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, candidateProfiles } from "@/lib/db/schema"
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

  if (!dbUser[0] || dbUser[0].role !== "candidate") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const body = await req.json()
  const { name, headline, bio, location, phone, linkedin, portfolio } = body

  if (name !== undefined) {
    await db.update(users).set({ name }).where(eq(users.id, dbUser[0].id))
  }

  const existing = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser[0].id))
    .limit(1)

  const profileData = { headline, bio, location, phone, linkedin, portfolio }
  const filtered = Object.fromEntries(
    Object.entries(profileData).filter(([, v]) => v !== undefined)
  )

  if (existing[0]) {
    await db
      .update(candidateProfiles)
      .set(filtered)
      .where(eq(candidateProfiles.userId, dbUser[0].id))
  } else {
    await db.insert(candidateProfiles).values({
      id: crypto.randomUUID(),
      userId: dbUser[0].id,
      ...filtered,
    })
  }

  return NextResponse.json({ ok: true })
}
