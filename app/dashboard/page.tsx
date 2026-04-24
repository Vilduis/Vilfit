import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, applications, jobOffers } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, Briefcase, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { timeAgo } from "@/lib/utils"
import { UserMenu } from "@/components/user-menu"
import { CancelApplicationButton } from "./cancel-application-button"

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  accepted: "Aceptado",
  rejected: "Rechazado",
}

export default async function CandidateDashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "candidate") redirect("/recruiter/dashboard")

  const myApplications = await db
    .select({
      application: applications,
      job: jobOffers,
    })
    .from(applications)
    .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
    .where(eq(applications.candidateId, dbUser[0].id))
    .orderBy(desc(applications.createdAt))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Mis postulaciones</h1>
            <p className="text-sm text-muted-foreground">{session.user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/jobs">Buscar trabajo</Link>
            </Button>
            <UserMenu
              name={dbUser[0].name}
              email={dbUser[0].email}
              image={dbUser[0].image}
              role="candidate"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 p-6">
        {myApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Briefcase className="size-10 text-muted-foreground" />
              <p className="text-muted-foreground">Aún no te has postulado a ninguna oferta</p>
              <Button asChild>
                <Link href="/jobs">Explorar ofertas</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          myApplications.map(({ application, job }) => (
            <Card key={application.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{job.title}</p>
                      <Badge
                        variant={
                          application.status === "accepted"
                            ? "default"
                            : application.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {statusLabels[application.status] ?? application.status}
                      </Badge>
                    </div>

                    {job.location && (
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    )}

                    {application.matchScore !== null ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Score de compatibilidad</span>
                          <span className="font-medium">{application.matchScore}%</span>
                        </div>
                        <Progress value={application.matchScore} className="h-1.5" />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        La IA está analizando tu postulación...
                      </p>
                    )}

                    {application.aiAnalysis?.summary && (
                      <p className="text-sm text-muted-foreground">
                        {application.aiAnalysis.summary}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      Postulado {timeAgo(application.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="size-4" />
                        CV
                      </a>
                    </Button>
                    <CancelApplicationButton applicationId={application.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  )
}
