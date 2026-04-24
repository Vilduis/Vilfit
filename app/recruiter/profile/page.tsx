import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, recruiterProfiles, jobOffers, applications } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Globe, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/profile-form"

export default async function RecruiterProfilePage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "recruiter") redirect("/profile")

  const profile = await db
    .select()
    .from(recruiterProfiles)
    .where(eq(recruiterProfiles.userId, dbUser[0].id))
    .limit(1)

  const jobCount = await db
    .select({ count: count() })
    .from(jobOffers)
    .where(eq(jobOffers.recruiterId, dbUser[0].id))

  const p = profile[0]
  const initials = (dbUser[0].name ?? dbUser[0].email)
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/recruiter/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Perfil de empresa</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        {/* Vista previa */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-4">
            <Avatar size="lg">
              <AvatarImage src={dbUser[0].image ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-lg font-semibold">
                {p?.company ?? dbUser[0].name ?? "Sin empresa"}
              </p>
              <p className="text-sm text-muted-foreground">{dbUser[0].email}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {p?.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Globe className="size-3" />
                    {p.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary">
                <Building2 className="size-3" />
                {jobCount[0]?.count ?? 0} oferta{(jobCount[0]?.count ?? 0) !== 1 ? "s" : ""}
              </Badge>
              <Badge
                variant={p?.subscriptionStatus === "active" ? "default" : "secondary"}
              >
                {p?.subscriptionStatus === "active" ? "Pro" : "Plan gratuito"}
              </Badge>
            </div>
          </div>
          {p?.description && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {p.description}
              </p>
            </>
          )}
        </div>

        {/* Formulario de edición */}
        <ProfileForm
          role="recruiter"
          apiPath="/api/recruiter/profile"
          initialValues={{
            name: dbUser[0].name ?? "",
            company: p?.company ?? "",
            description: p?.description ?? "",
            website: p?.website ?? "",
          }}
        />
      </main>
    </div>
  )
}
