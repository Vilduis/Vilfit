import { db } from "@/lib/db"
import { candidateProfiles, applications } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import Image from "next/image"
import Link from "next/link"
import { requireCandidate } from "@/lib/auth-helpers"
import { MapPin, Phone, Link2, Globe, FileText, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { CandidateNav } from "@/components/candidate-nav"
import { ProfileForm } from "@/components/profile-form"

export default async function CandidateProfilePage() {
  const { sessionUser, dbUser } = await requireCandidate()

  const [profileRows, appCountRows] = await Promise.all([
    db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, dbUser.id))
      .limit(1),
    db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.candidateId, dbUser.id)),
  ])

  const p = profileRows[0]
  const appCount = appCountRows[0]?.count ?? 0

  const initials = (dbUser.name ?? dbUser.email)
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

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

        {/* Profile hero card */}
        <div className="mb-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
          {/* Banner */}
          <div className="relative h-32 bg-gradient-to-br from-[oklch(0.38_0.28_265)] via-[oklch(0.42_0.30_278)] to-[oklch(0.34_0.28_298)]">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          {/* Contenido bajo el banner */}
          <div className="px-6 pb-6">
            {/* Avatar — sobresale del banner */}
            <div className="-mt-12 flex items-end justify-between gap-4">
              <div className="relative size-24 overflow-hidden rounded-full ring-4 ring-background shadow-lg">
                {dbUser.image ? (
                  <Image
                    src={dbUser.image}
                    alt={dbUser.name ?? "Perfil"}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-[oklch(0.50_0.26_275)] to-[oklch(0.42_0.28_295)] text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>

              <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <FileText className="size-3" />
                  {appCount} postulación{appCount !== 1 ? "es" : ""}
                </Badge>
              </div>
            </div>

            {/* Nombre + headline */}
            <div className="mt-3">
              <h1 className="text-xl font-bold tracking-tight">
                {dbUser.name ?? "Sin nombre"}
              </h1>
              {p?.headline ? (
                <p className="mt-0.5 text-sm text-muted-foreground">{p.headline}</p>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground/50 italic">
                  Agregá un título profesional para destacar
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{dbUser.email}</p>
            </div>

            {/* Info chips */}
            {(p?.location || p?.phone || p?.linkedin || p?.portfolio) && (
              <>
                <Separator className="my-4" />
                <div className="flex flex-wrap items-center gap-3">
                  {p?.location && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0 text-muted-foreground/60" />
                      {p.location}
                    </span>
                  )}
                  {p?.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="size-3.5 shrink-0 text-muted-foreground/60" />
                      {p.phone}
                    </span>
                  )}
                  {p?.linkedin && (
                    <a
                      href={p.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Link2 className="size-3.5 shrink-0" />
                      LinkedIn
                      <ExternalLink className="size-2.5" />
                    </a>
                  )}
                  {p?.portfolio && (
                    <a
                      href={p.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Globe className="size-3.5 shrink-0" />
                      Portafolio
                      <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Bio */}
            {p?.bio && (
              <>
                <Separator className="my-4" />
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {p.bio}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Formulario de edición */}
        <ProfileForm
          role="candidate"
          apiPath="/api/profile"
          initialValues={{
            name: dbUser.name ?? "",
            headline: p?.headline ?? "",
            bio: p?.bio ?? "",
            location: p?.location ?? "",
            phone: p?.phone ?? "",
            linkedin: p?.linkedin ?? "",
            portfolio: p?.portfolio ?? "",
          }}
        />
      </main>
    </div>
  )
}
