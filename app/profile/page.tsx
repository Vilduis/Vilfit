import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, candidateProfiles, applications } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Link2, Globe, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/profile-form"

export default async function CandidateProfilePage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "candidate")
    redirect("/recruiter/profile")

  const profile = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser[0].id))
    .limit(1)

  const appCount = await db
    .select({ count: count() })
    .from(applications)
    .where(eq(applications.candidateId, dbUser[0].id))

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
            <Link href="/jobs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Mi perfil</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        {/* Tarjeta de vista previa */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-4">
            <Avatar size="lg">
              <AvatarImage src={dbUser[0].image ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-lg font-semibold">
                {dbUser[0].name ?? "Sin nombre"}
              </p>
              {p?.headline && (
                <p className="text-sm text-muted-foreground">{p.headline}</p>
              )}
              <p className="text-sm text-muted-foreground">{dbUser[0].email}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {p?.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {p.location}
                  </span>
                )}
                {p?.phone && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="size-3" />
                    {p.phone}
                  </span>
                )}
                {p?.linkedin && (
                  <a
                    href={p.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Link2 className="size-3" />
                    LinkedIn
                  </a>
                )}
                {p?.portfolio && (
                  <a
                    href={p.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Globe className="size-3" />
                    Portafolio
                  </a>
                )}
              </div>
            </div>
            <Badge variant="secondary">
              <FileText className="size-3" />
              {appCount[0]?.count ?? 0} postulacion
              {(appCount[0]?.count ?? 0) !== 1 ? "es" : ""}
            </Badge>
          </div>
          {p?.bio && (
            <>
              <Separator className="my-4" />
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {p.bio}
              </p>
            </>
          )}
        </div>

        {/* Formulario de edición */}
        <ProfileForm
          role="candidate"
          apiPath="/api/profile"
          initialValues={{
            name: dbUser[0].name ?? "",
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
