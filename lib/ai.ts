import { GoogleGenerativeAI } from "@google/generative-ai"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (data: Buffer) => Promise<{ text: string; numpages: number }>
import { db } from "@/lib/db"
import { applications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { JobOffer } from "@/lib/db/schema"

let genAI: GoogleGenerativeAI | null = null
function getGenAI() {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  return genAI
}

interface AnalyzeInput {
  applicationId: string
  cvUrl: string
  job: JobOffer
  answers: { question: string; answer: string }[]
}

interface AIResult {
  matchScore: number
  strengths: string[]
  gaps: string[]
  summary: string
  recommendation: "hire" | "maybe" | "pass"
}

async function fetchCvText(cvUrl: string): Promise<string> {
  const res = await fetch(cvUrl)
  const buffer = await res.arrayBuffer()
  const result = await pdfParse(Buffer.from(buffer))
  return result.text.slice(0, 8000)
}

export async function analyzeApplication({
  applicationId,
  cvUrl,
  job,
  answers,
}: AnalyzeInput): Promise<void> {
  let cvText = ""
  try {
    cvText = await fetchCvText(cvUrl)
  } catch (err) {
    console.error("[AI] Error extrayendo texto del PDF:", err)
    cvText = "(No se pudo extraer el texto del CV)"
  }

  const screeningSection =
    answers.length > 0
      ? `\n\nRespuestas a preguntas de screening:\n${answers.map((a) => `- ${a.question}: ${a.answer}`).join("\n")}`
      : ""

  const prompt = `Eres un experto reclutador para empresas de Latinoamérica. Analiza la compatibilidad entre este candidato y la oferta laboral.

OFERTA LABORAL:
Título: ${job.title}
Descripción: ${job.description}
Requisitos: ${job.requirements ?? "No especificados"}
Modalidad: ${job.type}
${job.location ? `Ubicación: ${job.location}` : ""}

CV DEL CANDIDATO:
${cvText}
${screeningSection}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "matchScore": <número entre 0 y 100>,
  "strengths": [<lista de 2-4 fortalezas del candidato para este puesto>],
  "gaps": [<lista de 1-3 brechas o áreas de mejora>],
  "summary": "<resumen de 1-2 oraciones sobre la compatibilidad>",
  "recommendation": "<'hire' si score >= 75, 'maybe' si score >= 50, 'pass' si score < 50>"
}

No incluyas ningún texto fuera del JSON.`

  const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" })
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("Gemini no devolvió JSON válido")

  const analysis: AIResult = JSON.parse(jsonMatch[0])

  await db
    .update(applications)
    .set({
      matchScore: Math.min(100, Math.max(0, Math.round(analysis.matchScore))),
      aiAnalysis: {
        strengths: analysis.strengths ?? [],
        gaps: analysis.gaps ?? [],
        summary: analysis.summary ?? "",
        recommendation: analysis.recommendation ?? "maybe",
      },
      status: "reviewing",
    })
    .where(eq(applications.id, applicationId))
}
