import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { jobOffers, users, recruiterProfiles } from "@/lib/db/schema"
import { eq, desc, and, ilike } from "drizzle-orm"
import Link from "next/link"
import { MapPin, DollarSign, Clock, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserMenu } from "@/components/user-menu"
import { timeAgo } from "@/lib/utils"

const typeLabels: Record<string, string> = {
  "full-time": "Tiempo completo",
  "part-time": "Medio tiempo",
  remote: "Remoto",
  hybrid: "Híbrido",
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  const [session, jobs] = await Promise.all([
    auth(),
    db
      .select({
        job: jobOffers,
        recruiter: users,
        profile: recruiterProfiles,
      })
      .from(jobOffers)
      .innerJoin(users, eq(jobOffers.recruiterId, users.id))
      .leftJoin(recruiterProfiles, eq(recruiterProfiles.userId, users.id))
      .where(
        query
          ? and(eq(jobOffers.status, "active"), ilike(jobOffers.title, `%${query}%`))
          : eq(jobOffers.status, "active")
      )
      .orderBy(desc(jobOffers.createdAt)),
  ])

  const role = (session?.user as { role?: string })?.role

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Vilfit
          </Link>
          {session ? (
            <UserMenu
              name={session.user?.name}
              email={session.user?.email}
              image={session.user?.image}
              role={role as "candidate" | "recruiter" | null}
            />
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Ingresar</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-6 space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Ofertas de trabajo</h1>
            <p className="text-muted-foreground">
              {jobs.length} oportunidad{jobs.length !== 1 ? "es" : ""} disponible{jobs.length !== 1 ? "s" : ""} en Latinoamérica
            </p>
          </div>

          <form method="GET" action="/jobs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Buscar por título del puesto..."
                className="pl-9"
              />
            </div>
          </form>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
              <Search className="size-8" />
              <p>
                {query
                  ? `No hay ofertas que coincidan con "${query}"`
                  : "No hay ofertas disponibles en este momento."}
              </p>
              {query && (
                <Button variant="outline" asChild>
                  <Link href="/jobs">Ver todas las ofertas</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map(({ job, profile }) => (
              <Card key={job.id} className="transition-all hover:ring-2 hover:ring-primary/30">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold">{job.title}</h2>
                        <Badge variant="secondary">{typeLabels[job.type] ?? job.type}</Badge>
                      </div>
                      {profile?.company && (
                        <p className="text-sm font-medium text-foreground/70">{profile.company}</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {job.location}
                          </span>
                        )}
                        {job.salaryRange && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="size-3.5" />
                            {job.salaryRange}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {timeAgo(job.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/jobs/${job.id}`}>Ver oferta</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
