import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { jobOffers, users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  const jobs = await db
    .select()
    .from(jobOffers)
    .where(eq(jobOffers.status, "active"))
    .orderBy(desc(jobOffers.createdAt))

  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: "Solo reclutadores pueden publicar ofertas" }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, requirements, location, salaryRange, type, screeningQuestions } = body

  if (!title || !description) {
    return NextResponse.json({ error: "Título y descripción requeridos" }, { status: 400 })
  }

  const job = await db
    .insert(jobOffers)
    .values({
      id: crypto.randomUUID(),
      recruiterId: dbUser[0].id,
      title,
      description,
      requirements: requirements ?? null,
      location: location ?? null,
      salaryRange: salaryRange ?? null,
      type: type ?? "full-time",
      status: "draft",
      screeningQuestions: screeningQuestions ?? [],
    })
    .returning()

  return NextResponse.json(job[0], { status: 201 })
}
