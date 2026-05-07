import { db } from "@/lib/db"
import { recruiterProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { requireRecruiter } from "@/lib/auth-helpers"
import { NewJobForm } from "./new-job-form"

export default async function NewJobPage() {
  const { sessionUser, dbUser } = await requireRecruiter()

  const [profile] = await db
    .select()
    .from(recruiterProfiles)
    .where(eq(recruiterProfiles.userId, dbUser.id))

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
        <div className="mx-auto flex max-w-3xl items-center gap-2 text-sm text-muted-foreground">
          <Link href="/recruiter/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/recruiter/jobs" className="transition-colors hover:text-foreground">Mis ofertas</Link>
          <span>/</span>
          <span className="font-medium text-foreground">Nueva oferta</span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Nueva oferta laboral</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Completá los datos de la oferta. Podés guardarla como borrador o publicarla directamente.
          </p>
        </div>
        <NewJobForm companyName={profile?.company ?? null} />
      </main>
    </div>
  )
}
