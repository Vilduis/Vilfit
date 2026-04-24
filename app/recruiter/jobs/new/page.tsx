import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users, recruiterProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewJobForm } from "./new-job-form"

export default async function NewJobPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "recruiter") redirect("/dashboard")

  const profile = await db
    .select()
    .from(recruiterProfiles)
    .where(eq(recruiterProfiles.userId, dbUser[0].id))
    .limit(1)

  const companyName = profile[0]?.company ?? null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/recruiter/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Nueva oferta laboral</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <NewJobForm companyName={companyName} />
      </main>
    </div>
  )
}
