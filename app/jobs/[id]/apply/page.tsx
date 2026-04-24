"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Upload, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface JobData {
  id: string
  title: string
  screeningQuestions: string[]
}

async function fetchJob(id: string): Promise<JobData> {
  const res = await fetch(`/api/jobs/${id}`)
  if (!res.ok) throw new Error("Oferta no encontrada")
  return res.json()
}

export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<JobData | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingJob, setFetchingJob] = useState(true)
  const [error, setError] = useState("")

  // Fetch job on mount
  useState(() => {
    fetchJob(id)
      .then((data) => {
        setJob(data)
        setAnswers(new Array(data.screeningQuestions?.length ?? 0).fill(""))
        setFetchingJob(false)
      })
      .catch(() => {
        setError("No se pudo cargar la oferta")
        setFetchingJob(false)
      })
  })

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cvFile) {
      setError("Debes subir tu CV en formato PDF")
      return
    }
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("cv", cvFile)
    formData.append("jobId", id)
    formData.append("answers", JSON.stringify(answers))

    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Error al enviar la postulación")
      setLoading(false)
      return
    }

    router.push("/dashboard?applied=1")
  }

  if (fetchingJob) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Oferta no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/jobs/${id}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Postularme</h1>
            <p className="text-sm text-muted-foreground">{job.title}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tu CV</CardTitle>
            </CardHeader>
            <CardContent>
              <label
                htmlFor="cv-upload"
                className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary hover:bg-muted/30"
              >
                <Upload className="size-8 text-muted-foreground" />
                {cvFile ? (
                  <div>
                    <p className="font-medium text-foreground">{cvFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Sube tu CV en PDF</p>
                    <p className="text-sm text-muted-foreground">Máximo 10 MB</p>
                  </div>
                )}
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && file.type === "application/pdf" && file.size <= 10 * 1024 * 1024) {
                      setCvFile(file)
                    } else if (file) {
                      setError("Solo se aceptan archivos PDF de hasta 10 MB")
                    }
                  }}
                />
              </label>
            </CardContent>
          </Card>

          {job.screeningQuestions && job.screeningQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preguntas de screening</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.screeningQuestions.map((question, i) => (
                  <div key={i} className="space-y-2">
                    <Label>
                      {i + 1}. {question}
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

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !cvFile}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando postulación...
              </>
            ) : (
              "Enviar postulación"
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
