"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

async function setUserRole(role: "candidate" | "recruiter") {
  const res = await fetch("/api/user/role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error ?? "Error al guardar el rol")
  }
}

export function OnboardingForm() {
  const router = useRouter()
  const [selected, setSelected] = useState<"candidate" | "recruiter" | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    try {
      await setUserRole(selected)
    } catch (err) {
      // Role already set — just redirect to the right place
      console.error(err)
    }
    router.push(selected === "recruiter" ? "/recruiter/dashboard" : "/jobs")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido a Vilfit</h1>
          <p className="mt-2 text-muted-foreground">
            ¿Cómo vas a usar la plataforma?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card
            className={cn(
              "cursor-pointer transition-all hover:ring-2 hover:ring-primary",
              selected === "candidate" && "ring-2 ring-primary"
            )}
            onClick={() => setSelected("candidate")}
          >
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="size-5" />
              </div>
              <CardTitle className="mt-3">Soy candidato</CardTitle>
              <CardDescription>
                Busco trabajo, quiero postularme a ofertas subiendo mi CV y recibir feedback automático.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Acceso gratuito</li>
                <li>• Postulaciones con un clic</li>
                <li>• Feedback IA sobre tu CV</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer transition-all hover:ring-2 hover:ring-primary",
              selected === "recruiter" && "ring-2 ring-primary"
            )}
            onClick={() => setSelected("recruiter")}
          >
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Briefcase className="size-5" />
              </div>
              <CardTitle className="mt-3">Soy reclutador</CardTitle>
              <CardDescription>
                Publico ofertas y quiero encontrar los mejores candidatos con ayuda de IA, sin leer CVs manualmente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Candidatos rankeados por IA</li>
                <li>• Preguntas de screening</li>
                <li>• Suscripción mensual</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selected || loading}
            onClick={handleContinue}
            className="w-full sm:w-auto px-12"
          >
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
