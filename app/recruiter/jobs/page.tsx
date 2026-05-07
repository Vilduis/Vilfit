import { db } from "@/lib/db"
import { jobOffers, applications } from "@/lib/db/schema"
import { eq, count, inArray, desc } from "drizzle-orm"
import Link from "next/link"
import { Plus, Briefcase, Users, Pencil, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { RecruiterNav } from "@/components/recruiter-nav"
import { timeAgo, cn } from "@/lib/utils"
import { JOB_TYPE_LABELS, JOB_STATUS_CONFIG } from "@/lib/constants"
import { requireRecruiter } from "@/lib/auth-helpers"
import { DeleteJobButton } from "./delete-job-button"

export default async function RecruiterJobsPage() {
  const { sessionUser, dbUser } = await requireRecruiter()

  const myJobs = await db
    .select()
    .from(jobOffers)
    .where(eq(jobOffers.recruiterId, dbUser.id))
    .orderBy(desc(jobOffers.createdAt))

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
      <Navbar
        userName={sessionUser.name ?? null}
        userEmail={sessionUser.email ?? null}
        userImage={sessionUser.image ?? null}
        role="recruiter"
      />
      <RecruiterNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mis ofertas</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {myJobs.length} oferta{myJobs.length !== 1 ? "s" : ""} creadas
            </p>
          </div>
          <Button asChild>
            <Link href="/recruiter/jobs/new">
              <Plus data-icon="inline-start" />
              Nueva oferta
            </Link>
          </Button>
        </div>

        {myJobs.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl border bg-card py-20 text-center shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
              <Briefcase className="size-7 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-semibold">No tenés ofertas publicadas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Creá tu primera oferta y empezá a recibir candidatos
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
              const appCount = countMap[job.id] ?? 0

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
                        {job.salaryRange && <span>{job.salaryRange}</span>}
                        <span>{timeAgo(job.createdAt)}</span>
                        <span className={cn(
                          "flex items-center gap-1 font-medium",
                          appCount > 0 ? "text-primary" : "text-muted-foreground"
                        )}>
                          <Users className="size-3" />
                          {appCount} candidato{appCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button asChild size="sm" variant={appCount > 0 ? "default" : "outline"}>
                        <Link href={`/recruiter/jobs/${job.id}/candidates`}>
                          <Sparkles data-icon="inline-start" />
                          {appCount > 0 ? "Ver ranking IA" : "Ver candidatos"}
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
      </main>
    </div>
  )
}
