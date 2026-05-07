import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { jobOffers, users, recruiterProfiles, applications } from "@/lib/db/schema"
import { eq, desc, and, ilike, count, inArray } from "drizzle-orm"
import Link from "next/link"
import { MapPin, DollarSign, Clock, Search, Users, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { CompanyAvatar } from "@/components/company-avatar"
import { timeAgo, cn } from "@/lib/utils"
import { JOB_TYPE_LABELS } from "@/lib/constants"

const typeFilters = [
  { value: "", label: "Todos" },
  { value: "remote", label: "Remoto" },
  { value: "full-time", label: "Tiempo completo" },
  { value: "hybrid", label: "Híbrido" },
  { value: "part-time", label: "Medio tiempo" },
]

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const { q, type } = await searchParams
  const query = q?.trim() ?? ""
  const typeFilter = type ?? ""

  const [session, jobs] = await Promise.all([
    auth(),
    db
      .select({ job: jobOffers, recruiter: users, profile: recruiterProfiles })
      .from(jobOffers)
      .innerJoin(users, eq(jobOffers.recruiterId, users.id))
      .leftJoin(recruiterProfiles, eq(recruiterProfiles.userId, users.id))
      .where(
        and(
          eq(jobOffers.status, "active"),
          query ? ilike(jobOffers.title, `%${query}%`) : undefined,
          typeFilter
            ? eq(jobOffers.type, typeFilter as "full-time" | "part-time" | "remote" | "hybrid")
            : undefined,
        ),
      )
      .orderBy(desc(jobOffers.createdAt)),
  ])

  const jobIds = jobs.map(({ job }) => job.id)
  const appCounts =
    jobIds.length > 0
      ? await db
          .select({ jobOfferId: applications.jobOfferId, count: count() })
          .from(applications)
          .where(inArray(applications.jobOfferId, jobIds))
          .groupBy(applications.jobOfferId)
      : []
  const appCountMap = Object.fromEntries(appCounts.map((r) => [r.jobOfferId, r.count]))

  const role = (session?.user as { role?: "candidate" | "recruiter" } | undefined)?.role

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? null}
        userImage={session?.user?.image ?? null}
        role={role ?? null}
      />

      {/* Hero con búsqueda */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.38_0.28_265)] via-[oklch(0.42_0.30_278)] to-[oklch(0.34_0.28_298)] px-6 py-16 text-white">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,oklch(1_0_0/0.06),transparent)]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Encuentra tu próximo trabajo
          </h1>
          <p className="mt-2 text-white/65">
            {jobs.length} oportunidad{jobs.length !== 1 ? "es" : ""} disponible
            {jobs.length !== 1 ? "s" : ""} en Latinoamérica
          </p>

          <form method="GET" action="/jobs" className="mt-8">
            <input type="hidden" name="type" value={typeFilter} />
            <div className="relative mx-auto max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Puesto, empresa, tecnología..."
                className="h-12 rounded-xl border-0 bg-white pl-11 pr-28 text-base text-foreground shadow-xl placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg px-4"
              >
                Buscar
              </Button>
            </div>
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <Link
              key={filter.value}
              href={`/jobs?${query ? `q=${encodeURIComponent(query)}&` : ""}type=${filter.value}`}
            >
              <span
                className={cn(
                  "inline-flex cursor-pointer items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150",
                  typeFilter === filter.value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {filter.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Lista de ofertas */}
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl border bg-card py-20 text-center shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
              <Search className="size-7 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {query
                  ? `Sin resultados para "${query}"`
                  : "No hay ofertas disponibles aún"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {query
                  ? "Probá con otro término de búsqueda"
                  : "Volvé pronto para ver nuevas oportunidades"}
              </p>
            </div>
            {(query || typeFilter) && (
              <Button variant="outline" asChild>
                <Link href="/jobs">Ver todas las ofertas</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map(({ job, profile }) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                  {/* Accent bar izquierdo */}
                  <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl bg-primary/0 transition-colors duration-200 group-hover:bg-primary" />

                  <div className="flex items-center gap-4 p-5 pl-6">
                    <CompanyAvatar name={profile?.company ?? "Empresa"} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                          {job.title}
                        </h2>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {JOB_TYPE_LABELS[job.type] ?? job.type}
                        </Badge>
                      </div>

                      {profile?.company && (
                        <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                          {profile.company}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 shrink-0" />
                            {job.location}
                          </span>
                        )}
                        {job.salaryRange && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="size-3 shrink-0" />
                            {job.salaryRange}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 shrink-0" />
                          {timeAgo(job.createdAt)}
                        </span>
                        {(appCountMap[job.id] ?? 0) > 0 && (
                          <span className="flex items-center gap-1 font-medium text-primary/70">
                            <Users className="size-3 shrink-0" />
                            {appCountMap[job.id]} postulación
                            {appCountMap[job.id] !== 1 ? "es" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="hidden shrink-0 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary sm:block">
                      Ver oferta →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {jobs.length === 0 && !query && !typeFilter && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <Briefcase className="size-7 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              ¿Sos reclutador?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Publicá tu primera oferta
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
