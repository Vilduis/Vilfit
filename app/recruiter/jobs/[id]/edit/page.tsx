import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, jobOffers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditJobForm } from "./edit-job-form"

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "recruiter") redirect("/dashboard")

  const job = await db
    .select()
    .from(jobOffers)
    .where(and(eq(jobOffers.id, id), eq(jobOffers.recruiterId, dbUser[0].id)))
    .limit(1)

  if (!job[0]) notFound()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/recruiter/jobs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Editar oferta</h1>
            <p className="text-sm text-muted-foreground">{job[0].title}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <EditJobForm job={job[0]} />
      </main>
    </div>
  )
}
