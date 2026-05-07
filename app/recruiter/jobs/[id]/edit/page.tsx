import { db } from "@/lib/db"
import { jobOffers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { requireRecruiter } from "@/lib/auth-helpers"
import { EditJobForm } from "./edit-job-form"

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { sessionUser, dbUser } = await requireRecruiter()

  const [job] = await db
    .select()
    .from(jobOffers)
    .where(and(eq(jobOffers.id, id), eq(jobOffers.recruiterId, dbUser.id)))

  if (!job) notFound()

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
          <span className="max-w-[180px] truncate font-medium text-foreground">{job.title}</span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Editar oferta</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Actualizá los datos de la oferta laboral.
          </p>
        </div>
        <EditJobForm job={job} />
      </main>
    </div>
  )
}
