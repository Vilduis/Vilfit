"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewJobFormProps {
  companyName: string | null
}

export function NewJobForm({ companyName }: NewJobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>([""])

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, status: "draft" | "active") {
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
      screeningQuestions: screeningQuestions.filter((q) => q.trim()),
      status,
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error()

      const job = await res.json()

      if (status === "active") {
        await fetch(`/api/jobs/${job.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active" }),
        })
      }

      router.push("/recruiter/dashboard")
    } catch {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, "draft")}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <div className="flex items-center gap-2 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Building2 className="size-4 shrink-0" />
                <span className="flex-1">
                  {companyName || "Sin nombre de empresa"}
                </span>
                <a
                  href="/recruiter/profile"
                  className="text-xs text-primary hover:underline"
                >
                  Editar
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título del puesto *</Label>
              <Input
                id="title"
                name="title"
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
                  placeholder="Ej: Buenos Aires, Argentina"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Rango salarial</Label>
                <Input
                  id="salaryRange"
                  name="salaryRange"
                  placeholder="Ej: $2,000 - $3,500 USD"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Modalidad</Label>
              <select
                id="type"
                name="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="full-time">Tiempo completo</option>
                <option value="part-time">Medio tiempo</option>
                <option value="remote">Remoto</option>
                <option value="hybrid">Híbrido</option>
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
              Los candidatos responderán estas preguntas al postularse. La IA las tomará en cuenta para el análisis.
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
            type="submit"
            variant="outline"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              const form = e.currentTarget.closest("form") as HTMLFormElement
              handleSubmit({ currentTarget: form, preventDefault: () => {} } as React.FormEvent<HTMLFormElement>, "draft")
            }}
          >
            Guardar borrador
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={(e) => {
              const form = e.currentTarget.closest("form") as HTMLFormElement
              handleSubmit({ currentTarget: form, preventDefault: () => {} } as React.FormEvent<HTMLFormElement>, "active")
            }}
          >
            Publicar oferta
          </Button>
        </div>
      </div>
    </form>
  )
}
