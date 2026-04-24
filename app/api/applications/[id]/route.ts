import { NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, applications } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const application = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.candidateId, dbUser[0].id)))
    .limit(1)

  if (!application[0]) {
    return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 })
  }

  await del(application[0].cvUrl)

  await db
    .delete(applications)
    .where(and(eq(applications.id, id), eq(applications.candidateId, dbUser[0].id)))

  return NextResponse.json({ ok: true })
}
