import { auth } from "@/lib/proxy"
import { redirect } from "next/navigation"
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const role = (session.user as { role?: string | null })?.role
  if (role === "candidate") redirect("/jobs")
  if (role === "recruiter") redirect("/recruiter/dashboard")

  return <OnboardingForm />
}
