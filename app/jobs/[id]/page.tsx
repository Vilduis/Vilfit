import { db } from "@/lib/db"
import { jobOffers, users, applications } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, DollarSign, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { auth } from "@/lib/proxy"

const typeLabels: Record<string, string> = {
  "full-time": "Tiempo completo",
  "part-time": "Medio tiempo",
  remote: "Remoto",
  hybrid: "Híbrido",
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [session, result] = await Promise.all([
    auth(),
    db
      .select({ job: jobOffers, recruiter: users })
      .from(jobOffers)
      .innerJoin(users, eq(jobOffers.recruiterId, users.id))
      .where(eq(jobOffers.id, id))
      .limit(1),
  ])

  if (!result[0] || result[0].job.status !== "active") notFound()

  const { job } = result[0]

  let alreadyApplied = false
  const role = (session?.user as { role?: string })?.role
  if (session?.user?.email && role === "candidate") {
    const dbUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)
    if (dbUser[0]) {
      const existing = await db
        .select({ id: applications.id })
        .from(applications)
        .where(and(eq(applications.candidateId, dbUser[0].id), eq(applications.jobOfferId, id)))
        .limit(1)
      alreadyApplied = !!existing[0]
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/jobs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <Link href="/jobs" className="text-xl font-bold">
            Vilfit
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{typeLabels[job.type] ?? job.type}</Badge>
            {job.location && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {job.location}
              </span>
            )}
            {job.salaryRange && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="size-3.5" />
                {job.salaryRange}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
        </div>

        <Card>
          <CardContent className="space-y-6 py-6">
            <div>
              <h2 className="mb-2 font-semibold">Descripción</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div>
                <h2 className="mb-2 font-semibold">Requisitos</h2>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {job.requirements}
                </p>
              </div>
            )}

            {job.screeningQuestions && job.screeningQuestions.length > 0 && (
              <div>
                <h2 className="mb-2 font-semibold">Preguntas de screening</h2>
                <p className="mb-2 text-sm text-muted-foreground">
                  Al postularte deberás responder:
                </p>
                <ul className="space-y-1">
                  {job.screeningQuestions.map((q, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {i + 1}. {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          {alreadyApplied ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="size-5" />
                <span className="font-medium">Ya te postulaste a esta oferta</span>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard">Ver mis postulaciones</Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="lg" className="px-12">
              <Link href={`/jobs/${job.id}/apply`}>Postularme ahora</Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
