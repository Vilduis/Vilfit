"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, User, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
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

const roles = [
  {
    value: "candidate" as const,
    icon: User,
    title: "Soy candidato",
    description:
      "Busco trabajo, quiero postularme a ofertas subiendo mi CV y recibir feedback automático de IA.",
    features: [
      "Acceso completamente gratuito",
      "Análisis IA de tu CV por cada postulación",
      "Postulaciones con un clic",
    ],
  },
  {
    value: "recruiter" as const,
    icon: Briefcase,
    title: "Soy reclutador",
    description:
      "Publico ofertas y quiero encontrar los mejores candidatos con IA, sin leer CVs manualmente.",
    features: [
      "Candidatos rankeados por score IA",
      "Preguntas de screening personalizadas",
      "Plan mensual flexible",
    ],
  },
]

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
      console.error(err)
    }
    router.push(selected === "recruiter" ? "/recruiter/dashboard" : "/jobs")
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-primary/5 to-transparent" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Logo variant="on-light" />
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido a Vilfit</h1>
          <p className="mt-2 text-muted-foreground">
            Contanos cómo vas a usar la plataforma para personalizar tu experiencia.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {roles.map(({ value, icon: Icon, title, description, features }) => {
            const isSelected = selected === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelected(value)}
                className={cn(
                  "relative flex flex-col items-start rounded-2xl border p-6 text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-sm",
                )}
              >
                {/* Selection indicator */}
                <div
                  className={cn(
                    "absolute right-4 top-4 flex size-5 items-center justify-center rounded-full border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background",
                  )}
                >
                  {isSelected && <CheckCircle2 className="size-3.5" />}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "mb-4 flex size-12 items-center justify-center rounded-xl transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-6" />
                </div>

                <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>

                <ul className="mt-4 flex flex-col gap-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          isSelected ? "text-primary" : "text-muted-foreground/60",
                        )}
                      />
                      <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* Continue */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto sm:min-w-48"
            disabled={!selected || loading}
            onClick={handleContinue}
          >
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
