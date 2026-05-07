import { db } from "@/lib/db"
import { applications, jobOffers } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import Link from "next/link"
import { FileText, Briefcase, Clock, CheckCircle, Eye, Sparkles, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { CandidateNav } from "@/components/candidate-nav"
import { timeAgo, cn } from "@/lib/utils"
import { requireCandidate } from "@/lib/auth-helpers"
import { CancelApplicationButton } from "./cancel-application-button"

const statusConfig = {
  pending: {
    label: "Pendiente",
    accentClass: "bg-muted-foreground/30",
    badgeClass: "border-border text-muted-foreground",
  },
  reviewing: {
    label: "En revisión",
    accentClass: "bg-primary",
    badgeClass: "border-primary/30 bg-primary/8 text-primary",
  },
  accepted: {
    label: "Aceptado",
    accentClass: "bg-success",
    badgeClass: "border-success/30 bg-success/8 text-success",
  },
  rejected: {
    label: "Rechazado",
    accentClass: "bg-destructive",
    badgeClass: "border-destructive/30 bg-destructive/8 text-destructive",
  },
} as const

export default async function ApplicationsPage() {
  const { sessionUser, dbUser } = await requireCandidate()

  const myApplications = await db
    .select({ application: applications, job: jobOffers })
    .from(applications)
    .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
    .where(eq(applications.candidateId, dbUser.id))
    .orderBy(desc(applications.createdAt))

  const stats = {
    total: myApplications.length,
    reviewing: myApplications.filter((a) => a.application.status === "reviewing").length,
    accepted: myApplications.filter((a) => a.application.status === "accepted").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={sessionUser.name ?? null}
        userEmail={sessionUser.email ?? null}
        userImage={sessionUser.image ?? null}
        role="candidate"
      />
      <CandidateNav />

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Mis postulaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {myApplications.length > 0
              ? `Estás siguiendo ${myApplications.length} postulación${myApplications.length !== 1 ? "es" : ""}`
              : "Aún no te postulaste a ninguna oferta"}
          </p>
        </div>

        {/* Stats */}
        {myApplications.length > 0 && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[
              { label: "Total", value: stats.total, icon: Briefcase, colorClass: "text-foreground", bgClass: "bg-muted" },
              { label: "En revisión", value: stats.reviewing, icon: Eye, colorClass: "text-primary", bgClass: "bg-primary/10" },
              { label: "Aceptado", value: stats.accepted, icon: CheckCircle, colorClass: "text-success", bgClass: "bg-success/10" },
            ].map(({ label, value, icon: Icon, colorClass, bgClass }) => (
              <Card key={label} className="overflow-hidden">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", bgClass)}>
                    <Icon className={cn("size-5", colorClass)} />
                  </div>
                  <div>
                    <p className={cn("text-2xl font-bold tabular-nums", colorClass)}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {myApplications.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl border bg-card py-20 text-center shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
              <Briefcase className="size-7 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No te postulaste a ninguna oferta aún</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explorá las oportunidades disponibles y aplicá con tu CV
              </p>
            </div>
            <Button asChild>
              <Link href="/jobs">
                <Search data-icon="inline-start" />
                Explorar ofertas
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myApplications.map(({ application, job }) => {
              const config = statusConfig[application.status as keyof typeof statusConfig] ?? statusConfig.pending

              return (
                <div
                  key={application.id}
                  className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className={cn("absolute inset-y-0 left-0 w-[3px]", config.accentClass)} />

                  <div className="p-5 pl-6">
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-semibold transition-colors hover:text-primary hover:underline"
                          >
                            {job.title}
                          </Link>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                              config.badgeClass,
                            )}
                          >
                            {config.label}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {job.location && <span>{job.location}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Postulado {timeAgo(application.createdAt)}
                          </span>
                        </div>

                        {application.matchScore !== null ? (
                          <div className="mt-3">
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Sparkles className="size-3 text-primary" />
                                Score de compatibilidad IA
                              </span>
                              <span
                                className={cn(
                                  "text-sm font-bold tabular-nums",
                                  application.matchScore >= 75
                                    ? "text-success"
                                    : application.matchScore >= 50
                                      ? "text-warning"
                                      : "text-destructive",
                                )}
                              >
                                {application.matchScore}%
                              </span>
                            </div>
                            <Progress value={application.matchScore} className="h-1.5" />
                          </div>
                        ) : (
                          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
                            La IA está analizando tu postulación...
                          </p>
                        )}

                        {application.aiAnalysis?.summary && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {application.aiAnalysis.summary}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button variant="outline" size="sm" asChild>
                          <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="size-3.5" />
                            <span className="hidden sm:inline">Ver CV</span>
                          </a>
                        </Button>
                        <CancelApplicationButton applicationId={application.id} />
                      </div>
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
