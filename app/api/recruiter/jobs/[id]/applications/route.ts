import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, jobOffers, applications, screeningAnswers } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"

export async function GET(
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

  const apps = await db
    .select({
      application: applications,
      candidate: users,
    })
    .from(applications)
    .innerJoin(users, eq(applications.candidateId, users.id))
    .where(eq(applications.jobOfferId, id))
    .orderBy(desc(applications.matchScore))

  const appsWithAnswers = await Promise.all(
    apps.map(async ({ application, candidate }) => {
      const answers = await db
        .select()
        .from(screeningAnswers)
        .where(eq(screeningAnswers.applicationId, application.id))

      return {
        ...application,
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          image: candidate.image,
        },
        screeningAnswers: answers,
      }
    })
  )

  return NextResponse.json({ job: job[0], applications: appsWithAnswers })
}
