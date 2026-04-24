import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, jobOffers, applications, screeningAnswers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { analyzeApplication } from "@/lib/ai"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Debes iniciar sesión para postularte" }, { status: 401 })
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "candidate") {
    return NextResponse.json(
      { error: "Solo los candidatos pueden postularse" },
      { status: 403 }
    )
  }

  const job = await db
    .select()
    .from(jobOffers)
    .where(and(eq(jobOffers.id, id), eq(jobOffers.status, "active")))
    .limit(1)

  if (!job[0]) {
    return NextResponse.json({ error: "Oferta no encontrada o cerrada" }, { status: 404 })
  }

  const existing = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.candidateId, dbUser[0].id),
        eq(applications.jobOfferId, id)
      )
    )
    .limit(1)

  if (existing[0]) {
    return NextResponse.json({ error: "Ya te postulaste a esta oferta" }, { status: 409 })
  }

  const formData = await req.formData()
  const cvFile = formData.get("cv") as File | null
  const answersRaw = formData.get("answers") as string | null

  if (!cvFile) {
    return NextResponse.json({ error: "CV requerido" }, { status: 400 })
  }

  const blob = await put(`cvs/${dbUser[0].id}/${id}-${Date.now()}.pdf`, cvFile, {
    access: "public",
  })

  const applicationId = crypto.randomUUID()
  const answers: string[] = answersRaw ? JSON.parse(answersRaw) : []

  await db.insert(applications).values({
    id: applicationId,
    candidateId: dbUser[0].id,
    jobOfferId: id,
    cvUrl: blob.url,
    status: "pending",
  })

  if (job[0].screeningQuestions && answers.length > 0) {
    const answerRecords = (job[0].screeningQuestions as string[]).map(
      (question, i) => ({
        id: crypto.randomUUID(),
        applicationId,
        question,
        answer: answers[i] ?? "",
      })
    )
    if (answerRecords.length > 0) {
      await db.insert(screeningAnswers).values(answerRecords)
    }
  }

  // Trigger AI analysis asynchronously (non-blocking)
  analyzeApplication({
    applicationId,
    cvUrl: blob.url,
    job: job[0],
    answers: (job[0].screeningQuestions as string[] ?? []).map((q, i) => ({
      question: q,
      answer: answers[i] ?? "",
    })),
  }).catch(console.error)

  return NextResponse.json({ ok: true, applicationId }, { status: 201 })
}
