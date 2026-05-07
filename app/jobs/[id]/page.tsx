import { db } from "@/lib/db"
import { jobOffers, users, applications, recruiterProfiles } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  DollarSign,
  CheckCircle,
  Building2,
  FileText,
  HelpCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/proxy"
import { Navbar } from "@/components/navbar"
import { CompanyAvatar } from "@/components/company-avatar"
import { timeAgo } from "@/lib/utils"
import { JOB_TYPE_LABELS } from "@/lib/constants"

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [session, result] = await Promise.all([
    auth(),
    db
      .select({ job: jobOffers, recruiter: users, profile: recruiterProfiles })
      .from(jobOffers)
      .innerJoin(users, eq(jobOffers.recruiterId, users.id))
      .leftJoin(recruiterProfiles, eq(recruiterProfiles.userId, users.id))
      .where(eq(jobOffers.id, id))
      .limit(1),
  ])

  if (!result[0] || result[0].job.status !== "active") notFound()

  const { job, profile } = result[0]

  const role = (session?.user as { role?: "candidate" | "recruiter" } | undefined)?.role

  let alreadyApplied = false
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
      <Navbar
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? null}
        userImage={session?.user?.image ?? null}
        role={role ?? null}
      />

      {/* Breadcrumb */}
      <div className="border-b bg-card/60 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-foreground transition-colors">Ofertas</Link>
          <span>/</span>
          <span className="max-w-[200px] truncate text-foreground font-medium">{job.title}</span>
        </div>
      </div>

      {/* Job hero — full width */}
      <div className="border-b bg-card px-6 py-8 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-start gap-5">
            <CompanyAvatar name={profile?.company ?? "Empresa"} size="lg" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{JOB_TYPE_LABELS[job.type] ?? job.type}</Badge>
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {job.location}
                  </span>
                )}
                {job.salaryRange && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="size-3" />
                    {job.salaryRange}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  Publicado {timeAgo(job.createdAt)}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{job.title}</h1>
              {profile?.company && (
                <p className="mt-1 text-sm font-medium text-primary/80">{profile.company}</p>
              )}
            </div>

            {/* CTA desktop inline */}
            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <Button asChild variant="outline" size="sm">
                <Link href="/jobs">
                  <ArrowLeft data-icon="inline-start" />
                  Volver
                </Link>
              </Button>
              {alreadyApplied ? (
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-2 text-sm font-medium text-success">
                  <CheckCircle className="size-4" />
                  Ya aplicaste
                </div>
              ) : (
                <Button asChild size="default">
                  <Link href={`/jobs/${job.id}/apply`}>
                    <Sparkles data-icon="inline-start" />
                    Postularme ahora
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal — 2 columnas en desktop */}
      <main className="mx-auto max-w-5xl px-6 py-8 pb-28 sm:pb-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">

          {/* Columna izquierda — contenido */}
          <div className="flex flex-col gap-6">

            {/* Card de empresa */}
            {profile?.company && (
              <Card>
                <CardContent className="flex items-center gap-4 py-4">
                  <CompanyAvatar name={profile.company} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{profile.company}</p>
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {profile.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                    {profile.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {profile.description}
                      </p>
                    )}
                  </div>
                  <Building2 className="ml-auto size-5 shrink-0 text-muted-foreground/30" />
                </CardContent>
              </Card>
            )}

            {/* Descripción */}
            <Card>
              <CardContent className="py-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="size-4 text-primary" />
                  </div>
                  <h2 className="font-semibold">Descripción del puesto</h2>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Requisitos */}
            {job.requirements && (
              <Card>
                <CardContent className="py-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-success/10">
                      <CheckCircle className="size-4 text-success" />
                    </div>
                    <h2 className="font-semibold">Requisitos</h2>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {job.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Preguntas de screening */}
            {job.screeningQuestions && job.screeningQuestions.length > 0 && (
              <Card>
                <CardContent className="py-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10">
                      <HelpCircle className="size-4 text-warning" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Preguntas de screening</h2>
                      <p className="text-xs text-muted-foreground">
                        Deberás responder estas preguntas al postularte
                      </p>
                    </div>
                  </div>
                  <ol className="flex flex-col gap-2">
                    {job.screeningQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed text-muted-foreground">{q}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* CTA mobile */}
            <div className="lg:hidden">
              {alreadyApplied ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="size-5" />
                    <span className="font-semibold">Ya te postulaste a esta oferta</span>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/applications">Ver mis postulaciones</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    ¿Te interesa esta posición?
                  </p>
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/jobs/${job.id}/apply`}>
                      <Sparkles data-icon="inline-start" />
                      Postularme ahora
                    </Link>
                  </Button>
                  {!session && (
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      Necesitás una cuenta.{" "}
                      <Link href="/login" className="text-primary hover:underline">
                        Ingresar con Google
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — sticky (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-4">

              {/* Apply card */}
              <Card className="overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[oklch(0.42_0.30_278)] to-[oklch(0.60_0.22_300)]" />
                <CardContent className="p-5">
                  {alreadyApplied ? (
                    <div className="flex flex-col items-center gap-4 py-2 text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle className="size-6 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-success">Ya aplicaste</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          El reclutador revisará tu postulación
                        </p>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/applications">Ver mis postulaciones</Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        ¿Te interesa?
                      </p>
                      <Button asChild size="lg" className="w-full">
                        <Link href={`/jobs/${job.id}/apply`}>
                          <Sparkles data-icon="inline-start" />
                          Postularme ahora
                        </Link>
                      </Button>
                      {!session && (
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                          Necesitás una cuenta.{" "}
                          <Link href="/login" className="text-primary hover:underline">
                            Ingresar con Google
                          </Link>
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Resumen de la oferta */}
              <Card>
                <CardContent className="flex flex-col gap-3 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Detalles
                  </p>
                  <Separator />
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Building2 className="size-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Modalidad</p>
                        <p className="font-medium">{JOB_TYPE_LABELS[job.type] ?? job.type}</p>
                      </div>
                    </div>

                    {job.location && (
                      <div className="flex items-start gap-3">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <MapPin className="size-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Ubicación</p>
                          <p className="font-medium">{job.location}</p>
                        </div>
                      </div>
                    )}

                    {job.salaryRange && (
                      <div className="flex items-start gap-3">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <DollarSign className="size-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Rango salarial</p>
                          <p className="font-medium">{job.salaryRange}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Clock className="size-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Publicada</p>
                        <p className="font-medium">{timeAgo(job.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI badge */}
              <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary">
                <Sparkles className="size-3.5 shrink-0" />
                Tu CV es analizado por IA y recibe un score de compatibilidad
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA mobile */}
      {!alreadyApplied && (
        <div className="fixed inset-x-0 bottom-0 border-t bg-card/95 px-6 py-4 backdrop-blur-sm lg:hidden">
          <Button asChild size="lg" className="w-full">
            <Link href={`/jobs/${job.id}/apply`}>
              <Sparkles data-icon="inline-start" />
              Postularme ahora
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
