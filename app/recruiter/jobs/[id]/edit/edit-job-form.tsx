"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JobOffer } from "@/lib/db/schema"

interface EditJobFormProps {
  job: JobOffer
}

export function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>(
    job.screeningQuestions && job.screeningQuestions.length > 0
      ? job.screeningQuestions
      : [""]
  )

  function addQuestion() {
    setScreeningQuestions((prev) => [...prev, ""])
  }

  function removeQuestion(index: number) {
    setScreeningQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, value: string) {
    setScreeningQuestions((prev) =>
      prev.map((q, i) => (i === index ? value : q))
    )
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
      type: (form.elements.namedItem("type") as HTMLSelectElement).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
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
              <Label htmlFor="type">Modalidad</Label>
              <select
                id="type"
                name="type"
                defaultValue={job.type}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="full-time">Tiempo completo</option>
                <option value="part-time">Medio tiempo</option>
                <option value="remote">Remoto</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                name="status"
                defaultValue={job.status}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Borrador</option>
                <option value="active">Activa</option>
                <option value="closed">Cerrada</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descripción y requisitos</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Preguntas de screening</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Los candidatos responderán estas preguntas al postularse.
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
              <Plus className="size-4" />
              Agregar pregunta
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
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
