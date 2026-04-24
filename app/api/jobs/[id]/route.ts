import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { jobOffers, users } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await db
    .select()
    .from(jobOffers)
    .where(eq(jobOffers.id, id))
    .limit(1)

  if (!job[0]) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 })
  }

  return NextResponse.json(job[0])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  if (!dbUser[0] || dbUser[0].role !== "recruiter") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const job = await db
    .select()
    .from(jobOffers)
    .where(and(eq(jobOffers.id, id), eq(jobOffers.recruiterId, dbUser[0].id)))
    .limit(1)

  if (!job[0]) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 })
  }

  const body = await req.json()
  const updated = await db
    .update(jobOffers)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(jobOffers.id, id))
    .returning()

  return NextResponse.json(updated[0])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  if (!dbUser[0] || dbUser[0].role !== "recruiter") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  await db
    .delete(jobOffers)
    .where(and(eq(jobOffers.id, id), eq(jobOffers.recruiterId, dbUser[0].id)))

  return NextResponse.json({ ok: true })
}
