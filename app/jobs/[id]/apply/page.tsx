import { db } from "@/lib/db"
import { jobOffers, applications } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { CompanyAvatar } from "@/components/company-avatar"
import { JOB_TYPE_LABELS } from "@/lib/constants"
import { requireCandidate } from "@/lib/auth-helpers"
import { ApplyForm } from "./apply-form"

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { sessionUser, dbUser } = await requireCandidate()

  const [jobRows, existingRows] = await Promise.all([
    db.select().from(jobOffers).where(eq(jobOffers.id, id)).limit(1),
    db
      .select()
      .from(applications)
      .where(and(eq(applications.jobOfferId, id), eq(applications.candidateId, dbUser.id)))
      .limit(1),
  ])

  if (!jobRows[0] || jobRows[0].status !== "active") notFound()
  if (existingRows[0]) redirect(`/jobs/${id}`)

  const job = jobRows[0]

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={sessionUser.name ?? null}
        userEmail={sessionUser.email ?? null}
        userImage={sessionUser.image ?? null}
        role="candidate"
      />

      {/* Breadcrumb */}
      <div className="border-b bg-card/60 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-2 text-sm text-muted-foreground">
          <Link href="/jobs" className="transition-colors hover:text-foreground">
            Ofertas
          </Link>
          <span>/</span>
          <Link
            href={`/jobs/${id}`}
            className="max-w-[160px] truncate transition-colors hover:text-foreground"
          >
            {job.title}
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Postularme</span>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {/* Job context */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <CompanyAvatar name={job.title} size="md" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-snug">{job.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {[job.location, JOB_TYPE_LABELS[job.type] ?? job.type].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Link
            href={`/jobs/${id}`}
            className="shrink-0 text-xs text-primary transition-colors hover:underline"
          >
            Ver oferta
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Postularme</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Subí tu CV y la IA analizará tu perfil automáticamente.
          </p>
        </div>

        <ApplyForm
          jobId={id}
          screeningQuestions={job.screeningQuestions ?? []}
        />
      </main>
    </div>
  )
}
