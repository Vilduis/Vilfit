"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { JobOffer } from "@/lib/db/schema"

interface EditJobFormProps {
  job: JobOffer
}

const jobTypes: { value: "full-time" | "part-time" | "remote" | "hybrid"; label: string }[] = [
  { value: "full-time", label: "Tiempo completo" },
  { value: "part-time", label: "Medio tiempo" },
  { value: "remote", label: "Remoto" },
  { value: "hybrid", label: "Híbrido" },
]

const jobStatuses = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activa" },
  { value: "closed", label: "Cerrada" },
]

const statusActiveClass: Record<string, string> = {
  draft: "border-muted-foreground/60 bg-muted text-foreground",
  active: "border-primary bg-primary text-primary-foreground",
  closed: "border-destructive bg-destructive text-white",
}

export function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jobType, setJobType] = useState(job.type)
  const [jobStatus, setJobStatus] = useState(job.status)
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>(
    job.screeningQuestions && job.screeningQuestions.length > 0
      ? job.screeningQuestions
      : [""],
  )

  function addQuestion() {
    setScreeningQuestions((prev) => [...prev, ""])
  }

  function removeQuestion(index: number) {
    setScreeningQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, value: string) {
    setScreeningQuestions((prev) => prev.map((q, i) => (i === index ? value : q)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      requirements: (form.elements.namedItem("requirements") as HTMLTextAreaElement).value,
      location: (form.elements.namedItem("location") as HTMLInputElement).value,
      salaryRange: (form.elements.namedItem("salaryRange") as HTMLInputElement).value,
      type: jobType,
      status: jobStatus,
      screeningQuestions: screeningQuestions.filter((q) => q.trim()),
    }

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error()
      router.push("/recruiter/jobs")
    } catch {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">

        {/* Sección 1: Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </span>
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del puesto *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={job.title}
                placeholder="Ej: Desarrollador Backend Senior"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={job.location ?? ""}
                  placeholder="Ej: Buenos Aires, Argentina"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Rango salarial</Label>
                <Input
                  id="salaryRange"
                  name="salaryRange"
                  defaultValue={job.salaryRange ?? ""}
                  placeholder="Ej: $2,000 - $3,500 USD"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Modalidad</Label>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setJobType(value)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      jobType === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado de la oferta</Label>
              <div className="flex flex-wrap gap-2">
                {jobStatuses.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setJobStatus(value as typeof jobStatus)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      jobStatus === value
                        ? statusActiveClass[value]
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {jobStatus === "active" && "La oferta es visible para todos los candidatos."}
                {jobStatus === "draft" && "La oferta no es visible públicamente."}
                {jobStatus === "closed" && "La oferta no acepta nuevas postulaciones."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Descripción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                2
              </span>
              Descripción y requisitos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={job.description}
                placeholder="Describe el rol, responsabilidades y cultura del equipo..."
                rows={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos</Label>
              <Textarea
                id="requirements"
                name="requirements"
                defaultValue={job.requirements ?? ""}
                placeholder="Lista los requisitos técnicos, años de experiencia, habilidades..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 3: Screening */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                3
              </span>
              Preguntas de screening
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Los candidatos responderán estas preguntas al postularse. La IA las considerará en el análisis.
            </p>
            {screeningQuestions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  placeholder={`Pregunta ${i + 1}`}
                />
                {screeningQuestions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeQuestion(i)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestion}
            >
              <Plus data-icon="inline-start" />
              Agregar pregunta
            </Button>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => router.push("/recruiter/jobs")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  )
}
