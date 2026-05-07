"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ApplyFormProps {
  jobId: string
  screeningQuestions: string[]
}

export function ApplyForm({ jobId, screeningQuestions }: ApplyFormProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<string[]>(
    new Array(screeningQuestions.length).fill(""),
  )
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cvFile) {
      setError("Debés subir tu CV en formato PDF")
      return
    }
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("cv", cvFile)
    formData.append("jobId", jobId)
    formData.append("answers", JSON.stringify(answers))

    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Error al enviar la postulación")
      setLoading(false)
      return
    }

    router.push("/applications?applied=1")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* CV Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tu CV</CardTitle>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="cv-upload"
            className={cn(
              "flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
              cvFile
                ? "border-primary/40 bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-muted/30",
            )}
          >
            {cvFile ? (
              <>
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                  <FileText className="size-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{cvFile.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB · PDF
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <CheckCircle2 className="size-3.5" />
                  Listo para enviar
                </span>
              </>
            ) : (
              <>
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <Upload className="size-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Subí tu CV en PDF</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Máximo 10 MB</p>
                </div>
                <span className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground">
                  Seleccionar archivo
                </span>
              </>
            )}
            <input
              id="cv-upload"
              type="file"
              accept=".pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (
                  file &&
                  file.type === "application/pdf" &&
                  file.size <= 10 * 1024 * 1024
                ) {
                  setCvFile(file)
                  setError("")
                } else if (file) {
                  setError("Solo se aceptan archivos PDF de hasta 10 MB")
                }
              }}
            />
          </label>
        </CardContent>
      </Card>

      {/* Screening questions */}
      {screeningQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preguntas de screening</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {screeningQuestions.map((question, i) => (
              <div key={i} className="space-y-2">
                <Label className="flex items-start gap-2 text-sm font-medium leading-snug">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  {question}
                </Label>
                <Textarea
                  value={answers[i] ?? ""}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                  placeholder="Tu respuesta..."
                  rows={3}
                  required
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading || !cvFile}
      >
        {loading ? (
          <>
            <Loader2 data-icon="inline-start" className="animate-spin" />
            Enviando postulación...
          </>
        ) : (
          "Enviar postulación"
        )}
      </Button>
    </form>
  )
}
