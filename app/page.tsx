import Link from "next/link"
import { ArrowRight, Zap, Users, Brain, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/proxy"
import { UserMenu } from "@/components/user-menu"

export default async function LandingPage() {
  const session = await auth()
  const role = (session?.user as { role?: "candidate" | "recruiter" } | undefined)?.role

  const dashboardHref =
    role === "recruiter" ? "/recruiter/dashboard" : role === "candidate" ? "/dashboard" : "/onboarding"

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Vilfit
          </Link>

          <div className="flex items-center gap-3">
            {/* Nav links contextuales por rol */}
            {!session && (
              <Button variant="ghost" asChild>
                <Link href="/jobs">Ver ofertas</Link>
              </Button>
            )}
            {role === "candidate" && (
              <Button variant="ghost" asChild>
                <Link href="/jobs">Buscar trabajo</Link>
              </Button>
            )}
            {role === "recruiter" && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/recruiter/jobs/new">
                  <Plus className="size-4" />
                  Publicar oferta
                </Link>
              </Button>
            )}

            {/* Auth: dropdown si hay sesión, botón si no */}
            {session ? (
              <UserMenu
                name={session.user?.name}
                email={session.user?.email}
                image={session.user?.image}
                role={role}
              />
            ) : (
              <Button asChild>
                <Link href="/login">Ingresar</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <Badge variant="secondary" className="mb-6">
            Marketplace de empleo para Latinoamérica
          </Badge>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Contrata con IA.
            <br />
            <span className="text-primary">Sin leer CVs.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Los candidatos se postulan con su CV. La IA analiza cada postulación y
            calcula un score de compatibilidad. Los reclutadores ven el ranking
            listo cuando entran al dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {session ? (
              <Button asChild size="lg" className="px-8">
                <Link href={dashboardHref}>
                  {role === "candidate" ? "Mis postulaciones" : "Panel de control"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="px-8">
                <Link href="/login">
                  Comenzar gratis
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link href="/jobs">Ver ofertas disponibles</Link>
            </Button>
          </div>
        </section>

        <section className="border-y bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">¿Cómo funciona?</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="size-5" />
                  </div>
                  <CardTitle className="mt-3">Para candidatos — Gratis</CardTitle>
                  <CardDescription>
                    Postúlate a cientos de ofertas en toda Latinoamérica con tu CV.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Sube tu CV en PDF
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Responde preguntas de screening de cada oferta
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Ve el score de compatibilidad de tu postulación
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Completamente gratuito
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Brain className="size-5" />
                  </div>
                  <CardTitle className="mt-3">Para reclutadores — Suscripción</CardTitle>
                  <CardDescription>
                    Publica ofertas y recibe candidatos rankeados automáticamente por IA.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Crea ofertas con preguntas de screening personalizadas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      La IA lee y analiza cada CV automáticamente
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Candidatos ordenados por score de compatibilidad
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Fortalezas y brechas de cada candidato explicadas
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Zap className="mx-auto mb-4 size-10 text-primary" />
          <h2 className="text-3xl font-bold">Listo para contratar mejor</h2>
          <p className="mt-3 text-muted-foreground">
            Únete a los reclutadores que ya usan IA para encontrar al candidato ideal.
          </p>
          <Button asChild size="lg" className="mt-8 px-10">
            <Link href={session ? dashboardHref : "/login"}>
              {session ? "Ir a mi dashboard" : "Crear cuenta gratis"}
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Vilfit — Marketplace de empleo para Latinoamérica</p>
      </footer>
    </div>
  )
}
