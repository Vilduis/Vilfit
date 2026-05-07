import { db } from "@/lib/db"
import { recruiterProfiles, jobOffers, applications } from "@/lib/db/schema"
import { eq, count, inArray, max, desc } from "drizzle-orm"
import Link from "next/link"
import { Plus, Briefcase, Users, TrendingUp, ArrowRight, Pencil, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { RecruiterNav } from "@/components/recruiter-nav"
import { CompanyAvatar } from "@/components/company-avatar"
import { timeAgo, cn } from "@/lib/utils"
import { JOB_TYPE_LABELS, JOB_STATUS_CONFIG } from "@/lib/constants"
import { requireRecruiter } from "@/lib/auth-helpers"
import { DeleteJobButton } from "../jobs/delete-job-button"

export default async function RecruiterDashboardPage() {
  const { sessionUser, dbUser } = await requireRecruiter()

  const [profile, myJobs] = await Promise.all([
    db.select().from(recruiterProfiles).where(eq(recruiterProfiles.userId, dbUser.id)).limit(1),
    db
      .select()
      .from(jobOffers)
      .where(eq(jobOffers.recruiterId, dbUser.id))
      .orderBy(desc(jobOffers.createdAt)),
  ])

  const allJobIds = myJobs.map((j) => j.id)
  const jobStats =
    allJobIds.length > 0
      ? await db
          .select({
            jobOfferId: applications.jobOfferId,
            count: count(),
            topScore: max(applications.matchScore),
          })
          .from(applications)
          .where(inArray(applications.jobOfferId, allJobIds))
          .groupBy(applications.jobOfferId)
      : []

  const totalApplications = jobStats.reduce((sum, r) => sum + r.count, 0)
  const jobStatsMap = Object.fromEntries(jobStats.map((r) => [r.jobOfferId, r]))
  const activeJobs = myJobs.filter((j) => j.status === "active")
  const companyName = profile[0]?.company ?? dbUser.name ?? "Tu empresa"

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={sessionUser.name ?? null}
        userEmail={sessionUser.email ?? null}
        userImage={sessionUser.image ?? null}
        role="recruiter"
      />
      <RecruiterNav />

      <main className="mx-auto max-w-6xl px-6 py-8">

        {/* Bienvenida */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CompanyAvatar name={companyName} size="lg" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{companyName}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Panel de reclutador</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/recruiter/jobs/new">
              <Plus data-icon="inline-start" />
              Nueva oferta
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Ofertas activas",
              value: activeJobs.length,
              sub: "publicadas ahora",
              icon: Briefcase,
              colorClass: "text-primary",
              bgClass: "bg-primary/10",
            },
            {
              label: "Total ofertas",
              value: myJobs.length,
              sub: "creadas en total",
              icon: TrendingUp,
              colorClass: "text-muted-foreground",
              bgClass: "bg-muted",
            },
            {
              label: "Postulaciones",
              value: totalApplications,
              sub: "candidatos recibidos",
              icon: Users,
              colorClass: "text-success",
              bgClass: "bg-success/10",
            },
          ].map(({ label, value, sub, icon: Icon, colorClass, bgClass }) => (
            <Card key={label} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", bgClass)}>
                  <Icon className={cn("size-5", colorClass)} />
                </div>
                <div>
                  <p className={cn("text-3xl font-bold tabular-nums", colorClass)}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground/60">{sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mis ofertas */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mis ofertas</h2>
            {myJobs.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Link href="/recruiter/jobs">
                  Ver todas
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            )}
          </div>

          {myJobs.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-2xl border bg-card py-20 text-center shadow-sm">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                <Briefcase className="size-7 text-muted-foreground/60" />
              </div>
              <div>
                <p className="font-semibold">No tenés ofertas todavía</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Creá tu primera oferta y empezá a recibir candidatos rankeados por IA
                </p>
              </div>
              <Button asChild>
                <Link href="/recruiter/jobs/new">
                  <Plus data-icon="inline-start" />
                  Crear primera oferta
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myJobs.map((job) => {
                const config = JOB_STATUS_CONFIG[job.status as keyof typeof JOB_STATUS_CONFIG] ?? JOB_STATUS_CONFIG.draft
                const stats = jobStatsMap[job.id]
                const appCount = stats?.count ?? 0
                const topScore = stats?.topScore ?? null

                return (
                  <div
                    key={job.id}
                    className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className={cn("absolute inset-y-0 left-0 w-[3px]", config.accentClass)} />

                    <div className="flex items-center gap-4 p-5 pl-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{job.title}</p>
                          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", config.chipClass)}>
                            {config.label}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {JOB_TYPE_LABELS[job.type] ?? job.type}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {job.location && <span>{job.location}</span>}
                          <span>{timeAgo(job.createdAt)}</span>
                          {appCount > 0 && (
                            <span className="flex items-center gap-1 font-medium text-primary">
                              <Users className="size-3" />
                              {appCount} candidato{appCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {topScore !== null && (
                            <span className={cn(
                              "flex items-center gap-1 font-semibold",
                              topScore >= 75 ? "text-success" : topScore >= 50 ? "text-warning" : "text-destructive"
                            )}>
                              <Sparkles className="size-3" />
                              Top {topScore}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button asChild size="sm" variant={appCount > 0 ? "default" : "outline"}>
                          <Link href={`/recruiter/jobs/${job.id}/candidates`}>
                            <Users data-icon="inline-start" />
                            {appCount > 0 ? `${appCount} candidato${appCount !== 1 ? "s" : ""}` : "Ver candidatos"}
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                          <Link href={`/recruiter/jobs/${job.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <DeleteJobButton jobId={job.id} jobTitle={job.title} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
