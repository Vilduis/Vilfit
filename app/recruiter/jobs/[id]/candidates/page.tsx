import { db } from "@/lib/db"
import { jobOffers, applications, screeningAnswers, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  User, FileText, CheckCircle, XCircle, Clock, MapPin, DollarSign, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navbar } from "@/components/navbar"
import { CompanyAvatar } from "@/components/company-avatar"
import { cn, timeAgo } from "@/lib/utils"
import { JOB_TYPE_LABELS, APPLICATION_STATUS_LABELS } from "@/lib/constants"
import { requireRecruiter } from "@/lib/auth-helpers"

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
        Analizando...
      </span>
    )
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums",
        score >= 75
          ? "border-success/25 bg-success/8 text-success"
          : score >= 50
            ? "border-warning/25 bg-warning/8 text-warning-foreground"
            : "border-destructive/25 bg-destructive/8 text-destructive",
      )}
    >
      <Sparkles className="size-3" />
      {score}% match
    </span>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const base = "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-sm"
  if (rank === 1) return <div className={cn(base, "bg-amber-400 text-amber-900")}>#1</div>
  if (rank === 2) return <div className={cn(base, "bg-slate-300 text-slate-700")}>#2</div>
  if (rank === 3) return <div className={cn(base, "bg-amber-700/80 text-white")}>#3</div>
  return <div className={cn(base, "bg-muted text-muted-foreground")}>#{rank}</div>
}

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { sessionUser, dbUser } = await requireRecruiter()

  const job = await db
    .select()
    .from(jobOffers)
    .where(and(eq(jobOffers.id, id), eq(jobOffers.recruiterId, dbUser.id)))
    .limit(1)

  if (!job[0]) redirect("/recruiter/dashboard")

  const apps = await db
    .select({ application: applications, candidate: users })
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
    }),
  )

  const jobStatus = {
    active: { label: "Activa", chipClass: "border-primary/25 bg-primary/8 text-primary" },
    draft: { label: "Borrador", chipClass: "border-border text-muted-foreground" },
    closed: { label: "Cerrada", chipClass: "border-destructive/25 bg-destructive/8 text-destructive" },
  }[job[0].status] ?? { label: "Borrador", chipClass: "border-border text-muted-foreground" }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={sessionUser.name ?? null}
        userEmail={sessionUser.email ?? null}
        userImage={sessionUser.image ?? null}
        role="recruiter"
      />

      {/* Breadcrumb */}
      <div className="border-b bg-card/60 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-2 text-sm text-muted-foreground">
          <Link href="/recruiter/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/recruiter/jobs" className="hover:text-foreground transition-colors">Mis ofertas</Link>
          <span>/</span>
          <span className="max-w-[200px] truncate font-medium text-foreground">{job[0].title}</span>
        </div>
      </div>

      {/* Job summary */}
      <div className="border-b bg-card px-6 py-6 shadow-sm">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-4">
            <CompanyAvatar name={dbUser.name ?? "Empresa"} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", jobStatus.chipClass)}>
                  {jobStatus.label}
                </span>
                <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {JOB_TYPE_LABELS[job[0].type] ?? job[0].type}
                </span>
                {job[0].location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />{job[0].location}
                  </span>
                )}
                {job[0].salaryRange && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="size-3" />{job[0].salaryRange}
                  </span>
                )}
              </div>
              <h1 className="mt-1.5 text-xl font-bold tracking-tight">{job[0].title}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {appsWithAnswers.length} candidato{appsWithAnswers.length !== 1 ? "s" : ""} · Ordenados por score IA
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={`/recruiter/jobs/${job[0].id}/edit`}>Editar oferta</Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl flex flex-col gap-4 px-6 py-8">
        {appsWithAnswers.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl border bg-card py-20 text-center shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
              <User className="size-7 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-semibold">Aún no hay postulaciones</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Los candidatos que se postulen aparecerán aquí ordenados por score IA
              </p>
            </div>
          </div>
        ) : (
          appsWithAnswers.map(({ application, candidate, answers }, index) => {
            const initials = (candidate.name ?? candidate.email ?? "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()

            const scoreColor =
              application.matchScore !== null
                ? application.matchScore >= 75
                  ? "text-success"
                  : application.matchScore >= 50
                    ? "text-warning"
                    : "text-destructive"
                : ""

            return (
              <Card
                key={application.id}
                className={cn(
                  "overflow-hidden transition-shadow hover:shadow-md",
                  index === 0 && "ring-2 ring-amber-400/40",
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <RankBadge rank={index + 1} />
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={candidate.image ?? undefined} alt={candidate.name ?? ""} />
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug">{candidate.name ?? candidate.email}</p>
                      <p className="text-xs text-muted-foreground">{candidate.email}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Postulado {timeAgo(application.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <ScoreBadge score={application.matchScore} />
                      <Badge
                        variant={
                          application.status === "accepted"
                            ? "default"
                            : application.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {APPLICATION_STATUS_LABELS[application.status] ?? application.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-5 pt-0">
                  {application.matchScore === null ? (
                    <div className="flex flex-col gap-2">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5 animate-pulse" />
                        La IA está analizando este candidato...
                      </p>
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-2 w-2/3 rounded-full" />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Sparkles className="size-3.5 text-primary" />
                            Compatibilidad con la oferta
                          </span>
                          <span className={cn("font-bold tabular-nums", scoreColor)}>
                            {application.matchScore}%
                          </span>
                        </div>
                        <Progress value={application.matchScore} className="h-2" />
                      </div>

                      {application.aiAnalysis && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {application.aiAnalysis.strengths.length > 0 && (
                            <div className="rounded-xl bg-success/5 p-4">
                              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-success">
                                Fortalezas
                              </p>
                              <ul className="flex flex-col gap-1.5">
                                {application.aiAnalysis.strengths.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-success" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {application.aiAnalysis.gaps.length > 0 && (
                            <div className="rounded-xl bg-destructive/5 p-4">
                              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-destructive">
                                Brechas
                              </p>
                              <ul className="flex flex-col gap-1.5">
                                {application.aiAnalysis.gaps.map((g, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {application.aiAnalysis?.summary && (
                        <p className="rounded-xl border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                          {application.aiAnalysis.summary}
                        </p>
                      )}
                    </>
                  )}

                  {answers.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Respuestas de screening
                      </p>
                      {answers.map((a, i) => (
                        <div key={i} className="rounded-xl border bg-card px-4 py-3 text-sm">
                          <p className="font-medium text-foreground">{a.question}</p>
                          <p className="mt-1 text-muted-foreground">{a.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                        <FileText data-icon="inline-start" />
                        Ver CV
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </main>
    </div>
  )
}
