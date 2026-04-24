import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, recruiterProfiles, jobOffers, applications } from "@/lib/db/schema"
import { eq, count, inArray } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Briefcase, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/user-menu"

export default async function RecruiterDashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "recruiter") redirect("/dashboard")

  const [profile, myJobs] = await Promise.all([
    db
      .select()
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, dbUser[0].id))
      .limit(1),
    db
      .select()
      .from(jobOffers)
      .where(eq(jobOffers.recruiterId, dbUser[0].id))
      .orderBy(jobOffers.createdAt),
  ])

  const activeJobs = myJobs.filter((j) => j.status === "active")

  const allJobIds = myJobs.map((j) => j.id)
  const totalApplications =
    allJobIds.length > 0
      ? await db
          .select({ count: count() })
          .from(applications)
          .where(inArray(applications.jobOfferId, allJobIds))
      : [{ count: 0 }]

  const companyName = profile[0]?.company ?? dbUser[0].name ?? "Tu empresa"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{companyName}</h1>
            <p className="text-sm text-muted-foreground">{dbUser[0].email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/recruiter/jobs/new">
                <Plus className="size-4" />
                Nueva oferta
              </Link>
            </Button>
            <UserMenu
              name={dbUser[0].name}
              email={dbUser[0].email}
              image={dbUser[0].image}
              role="recruiter"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ofertas activas
              </CardTitle>
              <Briefcase className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeJobs.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total ofertas
              </CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{myJobs.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Postulaciones totales
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalApplications[0]?.count ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Mis ofertas</h2>
          {myJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <Briefcase className="size-10 text-muted-foreground" />
                <p className="text-muted-foreground">No tienes ofertas todavía</p>
                <Button asChild>
                  <Link href="/recruiter/jobs/new">Crear primera oferta</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <p className="font-medium">{job.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {job.location && <span>{job.location}</span>}
                        <Badge variant="secondary">{job.type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={job.status === "active" ? "default" : "secondary"}
                      >
                        {job.status === "active"
                          ? "Activa"
                          : job.status === "draft"
                            ? "Borrador"
                            : "Cerrada"}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/recruiter/jobs/${job.id}/candidates`}>
                          Ver candidatos
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
