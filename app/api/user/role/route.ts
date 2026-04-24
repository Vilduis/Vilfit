import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, recruiterProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { role } = await req.json()
  if (role !== "candidate" && role !== "recruiter") {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0]) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  if (dbUser[0].role !== null) {
    return NextResponse.json({ error: "Rol ya establecido" }, { status: 400 })
  }

  await db
    .update(users)
    .set({ role })
    .where(eq(users.email, session.user.email))

  if (role === "recruiter") {
    await db.insert(recruiterProfiles).values({
      id: crypto.randomUUID(),
      userId: dbUser[0].id,
    })
  }

  return NextResponse.json({ ok: true })
}
