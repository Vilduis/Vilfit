import Link from "next/link"
import Image from "next/image"
import { signIn } from "@/lib/proxy"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Brain, BarChart3, Users, CheckCircle, ArrowLeft, ShieldCheck } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

const features = [
  {
    Icon: Brain,
    text: "Análisis automático de CVs con Google Gemini",
  },
  {
    Icon: BarChart3,
    text: "Score de compatibilidad 0–100 por candidato",
  },
  {
    Icon: Users,
    text: "Candidatos ordenados por mejor match automáticamente",
  },
  {
    Icon: CheckCircle,
    text: "Gratis para candidatos, suscripción para reclutadores",
  },
]

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">

      {/* Panel izquierdo — brand */}
      <div className="relative hidden overflow-hidden md:flex">
        {/* Background photo */}
        <Image
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay — brand color sobre la foto */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.38_0.28_265/0.90)] via-[oklch(0.42_0.30_278/0.86)] to-[oklch(0.34_0.28_298/0.92)]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,oklch(1_0_0/0.06),transparent)]" />

        <div className="relative flex flex-1 flex-col justify-between p-12 text-white">
          <Logo variant="on-primary" />

          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight">
                Contrata con IA.
                <br />
                <span className="opacity-65">Sin leer CVs.</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
                La IA analiza cada postulación y te entrega un ranking de candidatos con
                fortalezas y brechas explicadas. Contratá mejor, más rápido.
              </p>
            </div>

            <ul className="flex flex-col gap-3.5">
              {features.map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-white/80">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-white/15 backdrop-blur-sm">
                    <Icon className="size-3" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="flex items-center gap-8 border-t border-white/15 pt-8">
              <div>
                <p className="text-2xl font-bold tabular-nums">1,200+</p>
                <p className="mt-0.5 text-xs text-white/50">Candidatos</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">150+</p>
                <p className="mt-0.5 text-xs text-white/50">Empresas</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">89%</p>
                <p className="mt-0.5 text-xs text-white/50">Precisión IA</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/30">© 2025 Vilfit · Todos los derechos reservados</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" />
              Volver
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <div className="mb-10 flex flex-col items-center gap-2 md:hidden">
              <Logo variant="on-light" />
              <p className="text-sm text-muted-foreground">
                Marketplace de empleo para Latinoamérica
              </p>
            </div>

            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Bienvenido a Vilfit</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ingresá con tu cuenta de Google para continuar
              </p>
            </div>

            {/* Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4 text-center">
                <CardTitle className="text-base">Ingresá a tu cuenta</CardTitle>
                <CardDescription>
                  Usamos Google OAuth. Es rápido, seguro y sin contraseña.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pb-6">
                <form
                  action={async () => {
                    "use server"
                    await signIn("google", { redirectTo: "/onboarding" })
                  }}
                >
                  <Button type="submit" className="w-full" size="lg">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      data-icon="inline-start"
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continuar con Google
                  </Button>
                </form>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 shrink-0 text-success" />
                  Conexión segura · Solo usamos tu nombre y email
                </div>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            <p className="text-center text-xs text-muted-foreground">
              <span className="font-medium text-foreground">¿Sos candidato?</span>{" "}
              La plataforma es completamente gratis.{" "}
              <Link
                href="/jobs"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Ver ofertas disponibles
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
