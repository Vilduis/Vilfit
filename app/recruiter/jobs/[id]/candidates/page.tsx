import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, jobOffers, applications, screeningAnswers } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, FileText, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar } from "@/components/ui/avatar"

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Badge variant="secondary">Analizando...</Badge>
  }
  if (score >= 75) return <Badge className="bg-green-600 text-white">Match {score}%</Badge>
  if (score >= 50) return <Badge className="bg-yellow-500 text-white">Match {score}%</Badge>
  return <Badge className="bg-red-500 text-white">Match {score}%</Badge>
}

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "recruiter") redirect("/dashboard")

  const job = await db
    .select()
    .from(jobOffers)
    .where(and(eq(jobOffers.id, id), eq(jobOffers.recruiterId, dbUser[0].id)))
    .limit(1)

  if (!job[0]) redirect("/recruiter/dashboard")

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
      return { application, candidate, answers }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/recruiter/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{job[0].title}</h1>
            <p className="text-sm text-muted-foreground">
              {appsWithAnswers.length} candidato{appsWithAnswers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 p-6">
        {appsWithAnswers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <User className="size-10 text-muted-foreground" />
              <p className="text-muted-foreground">Aún no hay postulaciones para esta oferta</p>
            </CardContent>
          </Card>
        ) : (
          appsWithAnswers.map(({ application, candidate, answers }, index) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{candidate.name ?? candidate.email}</p>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={application.matchScore} />
                    <Badge
                      variant={
                        application.status === "accepted"
                          ? "default"
                          : application.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {application.status === "pending"
                        ? "Pendiente"
                        : application.status === "reviewing"
                          ? "En revisión"
                          : application.status === "accepted"
                            ? "Aceptado"
                            : "Rechazado"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {application.matchScore !== null && (
                <CardContent className="space-y-4">
                  <Progress value={application.matchScore} className="h-2" />

                  {application.aiAnalysis && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {application.aiAnalysis.strengths.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-sm font-medium text-green-700 dark:text-green-400">
                            Fortalezas
                          </p>
                          <ul className="space-y-1">
                            {application.aiAnalysis.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground">
                                • {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {application.aiAnalysis.gaps.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-sm font-medium text-red-700 dark:text-red-400">
                            Brechas
                          </p>
                          <ul className="space-y-1">
                            {application.aiAnalysis.gaps.map((g, i) => (
                              <li key={i} className="text-sm text-muted-foreground">
                                • {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {application.aiAnalysis?.summary && (
                    <p className="text-sm text-muted-foreground">
                      {application.aiAnalysis.summary}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="size-4" />
                        Ver CV
                      </a>
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </main>
    </div>
  )
}
