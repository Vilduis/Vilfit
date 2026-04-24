"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

/* ── Candidate ── */
interface CandidateProfileFormProps {
  role: "candidate"
  apiPath: "/api/profile"
  initialValues: {
    name: string
    headline: string
    bio: string
    location: string
    phone: string
    linkedin: string
    portfolio: string
  }
}

/* ── Recruiter ── */
interface RecruiterProfileFormProps {
  role: "recruiter"
  apiPath: "/api/recruiter/profile"
  initialValues: {
    name: string
    company: string
    description: string
    website: string
  }
}

type ProfileFormProps = CandidateProfileFormProps | RecruiterProfileFormProps

export function ProfileForm({ role, apiPath, initialValues }: ProfileFormProps) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setLoading(true)
    const res = await fetch(apiPath, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    setLoading(false)
    if (res.ok) {
      setSaved(true)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>
            Tu nombre es visible para{" "}
            {role === "candidate" ? "los reclutadores" : "los candidatos"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={(values as { name: string }).name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          {role === "candidate" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="headline">Título profesional</Label>
                <Input
                  id="headline"
                  value={(values as CandidateProfileFormProps["initialValues"]).headline}
                  onChange={(e) => set("headline", e.target.value)}
                  placeholder="Ej: Frontend Developer · 5 años de experiencia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={(values as CandidateProfileFormProps["initialValues"]).location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Ej: Buenos Aires, Argentina"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={(values as CandidateProfileFormProps["initialValues"]).phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+54 11 1234-5678"
                />
              </div>
            </>
          )}

          {role === "recruiter" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={(values as RecruiterProfileFormProps["initialValues"]).company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Nombre de tu empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  id="website"
                  value={(values as RecruiterProfileFormProps["initialValues"]).website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://tuempresa.com"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{role === "candidate" ? "Sobre mí" : "Sobre la empresa"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {role === "candidate" && (
            <div className="space-y-2">
              <Label htmlFor="bio">Resumen profesional</Label>
              <Textarea
                id="bio"
                value={(values as CandidateProfileFormProps["initialValues"]).bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Cuéntale a los reclutadores quién eres, qué tecnologías usas y qué tipo de rol buscas..."
                rows={5}
              />
            </div>
          )}
          {role === "recruiter" && (
            <div className="space-y-2">
              <Label htmlFor="description">Descripción de la empresa</Label>
              <Textarea
                id="description"
                value={(values as RecruiterProfileFormProps["initialValues"]).description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Cuéntales a los candidatos qué hace tu empresa, su cultura, misión..."
                rows={5}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {role === "candidate" && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={(values as CandidateProfileFormProps["initialValues"]).linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/tu-perfil"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portafolio / GitHub</Label>
              <Input
                id="portfolio"
                value={(values as CandidateProfileFormProps["initialValues"]).portfolio}
                onChange={(e) => set("portfolio", e.target.value)}
                placeholder="https://github.com/tuusuario"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <p className="text-sm text-muted-foreground">Cambios guardados</p>
        )}
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
