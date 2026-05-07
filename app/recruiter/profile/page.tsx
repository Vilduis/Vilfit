import { db } from "@/lib/db"
import { recruiterProfiles, jobOffers } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import Image from "next/image"
import { Globe, Building2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { RecruiterNav } from "@/components/recruiter-nav"
import { CompanyAvatar } from "@/components/company-avatar"
import { ProfileForm } from "@/components/profile-form"
import { requireRecruiter } from "@/lib/auth-helpers"

export default async function RecruiterProfilePage() {
  const { sessionUser, dbUser } = await requireRecruiter()

  const [profileRows, jobCountRows] = await Promise.all([
    db.select().from(recruiterProfiles).where(eq(recruiterProfiles.userId, dbUser.id)).limit(1),
    db.select({ count: count() }).from(jobOffers).where(eq(jobOffers.recruiterId, dbUser.id)),
  ])

  const p = profileRows[0]
  const jobCount = jobCountRows[0]?.count ?? 0
  const companyName = p?.company ?? dbUser.name ?? "Tu empresa"

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={sessionUser.name ?? null}
        userEmail={sessionUser.email ?? null}
        userImage={sessionUser.image ?? null}
        role="recruiter"
      />
      <RecruiterNav />

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

          <div className="px-6 pb-6">
            {/* Avatares — sobresalen del banner */}
            <div className="-mt-10 flex items-end justify-between gap-4">
              <div className="flex items-end gap-3">
                {/* Avatar del reclutador (Google photo) */}
                <div className="relative size-20 overflow-hidden rounded-full ring-4 ring-background shadow-lg">
                  {dbUser.image ? (
                    <Image
                      src={dbUser.image}
                      alt={dbUser.name ?? "Perfil"}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-[oklch(0.50_0.26_275)] to-[oklch(0.42_0.28_295)] text-xl font-bold text-white">
                      {(dbUser.name ?? dbUser.email)[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Company avatar */}
                <CompanyAvatar
                  name={companyName}
                  size="lg"
                  className="mb-1 ring-4 ring-background shadow-lg"
                />
              </div>

              <div className="mb-1 flex items-center gap-2">
                <Badge
                  variant={p?.subscriptionStatus === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {p?.subscriptionStatus === "active" ? "Plan Pro" : "Plan gratuito"}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <Building2 className="size-3" />
                  {jobCount} oferta{jobCount !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>

            {/* Info de empresa */}
            <div className="mt-3">
              <h1 className="text-xl font-bold tracking-tight">{companyName}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{dbUser.email}</p>
            </div>

            {/* Links */}
            {p?.website && (
              <>
                <Separator className="my-4" />
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Globe className="size-3.5 shrink-0" />
                  {p.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="size-2.5" />
                </a>
              </>
            )}

            {/* Descripción */}
            {p?.description && (
              <>
                <Separator className="my-4" />
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Formulario de edición */}
        <ProfileForm
          role="recruiter"
          apiPath="/api/recruiter/profile"
          initialValues={{
            name: dbUser.name ?? "",
            company: p?.company ?? "",
            description: p?.description ?? "",
            website: p?.website ?? "",
          }}
        />
      </main>
    </div>
  )
}
