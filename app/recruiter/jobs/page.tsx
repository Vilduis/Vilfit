import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, jobOffers, applications } from "@/lib/db/schema"
import { eq, count, inArray } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Briefcase, Users, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeleteJobButton } from "./delete-job-button"

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  active: "Activa",
  closed: "Cerrada",
}

const typeLabels: Record<string, string> = {
  "full-time": "Tiempo completo",
  "part-time": "Medio tiempo",
  remote: "Remoto",
  hybrid: "Híbrido",
}

export default async function RecruiterJobsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "recruiter") redirect("/dashboard")

  const myJobs = await db
    .select()
    .from(jobOffers)
    .where(eq(jobOffers.recruiterId, dbUser[0].id))
    .orderBy(jobOffers.createdAt)

  const allJobIds = myJobs.map((j) => j.id)
  const appCounts =
    allJobIds.length > 0
      ? await db
          .select({ jobOfferId: applications.jobOfferId, count: count() })
          .from(applications)
          .where(inArray(applications.jobOfferId, allJobIds))
          .groupBy(applications.jobOfferId)
      : []

  const countMap = Object.fromEntries(appCounts.map((r) => [r.jobOfferId, r.count]))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/recruiter/dashboard">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Mis ofertas</h1>
              <p className="text-sm text-muted-foreground">{myJobs.length} oferta{myJobs.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/recruiter/jobs/new">
              <Plus className="size-4" />
              Nueva oferta
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 p-6">
        {myJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Briefcase className="size-10 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes ofertas publicadas</p>
              <Button asChild>
                <Link href="/recruiter/jobs/new">Crear primera oferta</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          myJobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{job.title}</p>
                      <Badge variant={job.status === "active" ? "default" : "secondary"}>
                        {statusLabels[job.status] ?? job.status}
                      </Badge>
                      <Badge variant="outline">{typeLabels[job.type] ?? job.type}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {job.location && <span>{job.location}</span>}
                      {job.salaryRange && <span>{job.salaryRange}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="size-3.5" />
                      <span>{countMap[job.id] ?? 0} postulacion{(countMap[job.id] ?? 0) !== 1 ? "es" : ""}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/recruiter/jobs/${job.id}/candidates`}>
                        Ver candidatos
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/recruiter/jobs/${job.id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <DeleteJobButton jobId={job.id} jobTitle={job.title} />
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
