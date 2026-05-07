import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Zap, Users, Brain, BarChart3, CheckCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { jobOffers, recruiterProfiles } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Navbar } from "@/components/navbar"
import { CompanyAvatar } from "@/components/company-avatar"

const socialProofAvatars = [
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1494790108377-be9c29b29330",
  "photo-1500648767791-00dcc994a43e",
  "photo-1534528741775-53994a69daeb",
  "photo-1438761681033-6461ffad8d80",
]

const partnerCompanies = [
  "Mercado Libre",
  "Globant",
  "Naranja X",
  "Ualá",
  "Satellogic",
  "OLX",
]

const faqs = [
  {
    q: "¿Es completamente gratis para candidatos?",
    a: "Sí, 100%. Los candidatos pueden crear su perfil, postularse a cualquier oferta y recibir su score de compatibilidad con IA sin pagar nada.",
  },
  {
    q: "¿Cómo funciona el análisis de IA?",
    a: "Cuando te postulás, subís tu CV en PDF. Nuestro sistema extrae el texto y lo analiza junto con la descripción de la oferta usando Google Gemini. En segundos generamos un score del 0 al 100 con fortalezas y brechas detalladas.",
  },
  {
    q: "¿Qué información necesito para publicar una oferta?",
    a: "El título del puesto, una descripción clara, los requisitos del candidato ideal y la modalidad de trabajo. También podés agregar preguntas de screening personalizadas para filtrar mejor.",
  },
  {
    q: "¿Puedo cancelar mi suscripción en cualquier momento?",
    a: "Sí. Tu suscripción se puede cancelar cuando quieras desde el panel de facturación. Las ofertas publicadas seguirán activas hasta el final del período pagado.",
  },
  {
    q: "¿Qué tan preciso es el score de compatibilidad?",
    a: "El score alcanza ~89% de precisión comparado con evaluaciones humanas. No reemplaza la entrevista, sino que prioriza inteligentemente para que veas primero los candidatos más prometedores.",
  },
]

const steps = [
  {
    step: "01",
    icon: <Brain className="size-5" />,
    title: "Publicá tu oferta",
    description: "Creá la descripción del puesto, requisitos y preguntas de screening personalizadas en minutos.",
    forRole: "Reclutador",
  },
  {
    step: "02",
    icon: <Users className="size-5" />,
    title: "Candidatos se postulan",
    description: "Los candidatos suben su CV en PDF y responden las preguntas de screening. Gratis para ellos.",
    forRole: "Candidato",
  },
  {
    step: "03",
    icon: <BarChart3 className="size-5" />,
    title: "IA rankea automáticamente",
    description: "Gemini analiza cada CV contra la oferta y genera un score 0–100 con fortalezas y brechas.",
    forRole: "IA",
  },
]

export default async function LandingPage() {
  const session = await auth()
  const role = (session?.user as { role?: "candidate" | "recruiter" } | undefined)?.role

  const dashboardHref =
    role === "recruiter" ? "/recruiter/dashboard" : role === "candidate" ? "/applications" : "/onboarding"

  const featuredJobs = await db
    .select({
      id: jobOffers.id,
      title: jobOffers.title,
      type: jobOffers.type,
      location: jobOffers.location,
      company: recruiterProfiles.company,
    })
    .from(jobOffers)
    .leftJoin(recruiterProfiles, eq(jobOffers.recruiterId, recruiterProfiles.userId))
    .where(eq(jobOffers.status, "active"))
    .orderBy(desc(jobOffers.createdAt))
    .limit(3)

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? null}
        userImage={session?.user?.image ?? null}
        role={role ?? null}
      />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.38_0.28_265)] via-[oklch(0.42_0.30_278)] to-[oklch(0.34_0.28_298)] px-6 py-20 text-white lg:py-28">
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Radial glow top */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,oklch(1_0_0/0.10),transparent)]" />

          <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_440px]">
            {/* Columna izquierda — texto */}
            <div className="text-center lg:text-left">
              <Badge
                variant="secondary"
                className="animate-fade-in mb-6 border border-white/25 bg-white/10 px-4 py-1.5 text-white backdrop-blur-sm"
              >
                Marketplace de empleo para Latinoamérica
              </Badge>

              <h1
                className="animate-fade-in-up text-5xl font-bold leading-tight tracking-tight sm:text-6xl"
                style={{ animationDelay: "0.1s" }}
              >
                Contrata con IA.
                <br />
                <span className="opacity-70">Sin leer CVs.</span>
              </h1>

              <p
                className="animate-fade-in-up mx-auto mt-6 max-w-xl text-lg text-white/65 lg:mx-0"
                style={{ animationDelay: "0.2s" }}
              >
                Los candidatos se postulan con su CV. La IA analiza cada postulación y calcula un
                score de compatibilidad. Los reclutadores ven el ranking listo al instante.
              </p>

              {/* Social proof — avatares reales */}
              <div
                className="animate-fade-in-up mt-8 flex items-center justify-center gap-3 lg:justify-start"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex -space-x-2">
                  {socialProofAvatars.map((id) => (
                    <div
                      key={id}
                      className="relative size-8 overflow-hidden rounded-full border-2 border-white/30 shadow-sm"
                    >
                      <Image
                        src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=64&h=64&q=80`}
                        alt="Candidato"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/65">
                  <span className="font-semibold text-white">+1,200</span> candidatos ya registrados
                </p>
              </div>

              <div
                className="animate-fade-in-up mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
                style={{ animationDelay: "0.4s" }}
              >
                {session ? (
                  <Button asChild size="lg" className="bg-white px-8 text-primary shadow-lg hover:bg-white/90">
                    <Link href={dashboardHref}>
                      {role === "candidate" ? "Mis postulaciones" : "Panel de control"}
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="bg-white px-8 text-primary shadow-lg hover:bg-white/90">
                    <Link href="/login">
                      Comenzar gratis
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/jobs">Ver ofertas disponibles</Link>
                </Button>
              </div>
            </div>

            {/* Columna derecha — live ranking preview */}
            <div
              className="animate-fade-in-up relative mx-auto w-full max-w-md lg:mx-0"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="absolute -inset-3 rounded-3xl bg-white/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
                {/* Titlebar */}
                <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-red-400" />
                    <div className="size-2.5 rounded-full bg-yellow-400" />
                    <div className="size-2.5 rounded-full bg-green-400" />
                  </div>
                  <p className="mx-auto text-xs font-medium text-muted-foreground">
                    Desarrollador Full-Stack · 18 candidatos
                  </p>
                </div>

                {/* Candidates */}
                <div className="divide-y divide-border/60">
                  {(
                    [
                      { name: "Valentina Mora", jobRole: "Backend Lead @ Mercado Libre", score: 94, rank: 1, photo: "photo-1494790108377-be9c29b29330" },
                      { name: "Sebastián Lagos", jobRole: "Full-Stack Dev @ Rappi", score: 81, rank: 2, photo: "photo-1507003211169-0a1dd7228f2d" },
                      { name: "Camila Torres", jobRole: "Software Engineer", score: 68, rank: 3, photo: "photo-1438761681033-6461ffad8d80" },
                    ] as const
                  ).map(({ name, jobRole, score, rank, photo }) => (
                    <div key={name} className="flex items-center gap-3 px-4 py-3">
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black",
                          rank === 1
                            ? "bg-amber-400 text-amber-900"
                            : rank === 2
                              ? "bg-slate-200 text-slate-600"
                              : "bg-orange-700/80 text-white"
                        )}
                      >
                        #{rank}
                      </div>
                      <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=64&h=64&q=80`}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-semibold text-foreground">{name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{jobRole}</p>
                      </div>
                      <div
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                          score >= 75
                            ? "bg-success/15 text-success"
                            : score >= 50
                              ? "bg-warning/15 text-warning-foreground"
                              : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {score}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status bar */}
                <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-4 py-2.5">
                  <div className="size-2 shrink-0 animate-pulse rounded-full bg-success" />
                  <p className="text-[10px] text-muted-foreground">IA analizando 4 CVs más...</p>
                  <span className="ml-auto text-[10px] text-muted-foreground">Hace 2 min</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b bg-card px-6 py-10 shadow-sm">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {[
              { value: "1,200+", label: "Candidatos registrados" },
              { value: "150+", label: "Empresas activas", bordered: true },
              { value: "89%", label: "Precisión del score IA" },
            ].map(({ value, label, bordered }, i) => (
              <div
                key={label}
                className={cn(
                  "animate-fade-in-up flex flex-col items-center gap-1",
                  bordered && "sm:border-x sm:border-border"
                )}
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <p className="text-4xl font-bold tabular-nums text-primary">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Logos de empresas */}
        <section className="border-b bg-card/50 px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <p className="mb-7 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Empresas que ya contratan con Vilfit
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
              {partnerCompanies.map((company) => (
                <span
                  key={company}
                  className="text-sm font-bold tracking-tight text-muted-foreground/35 transition-colors hover:text-muted-foreground/60"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Ofertas Destacadas — solo se muestra si hay ofertas activas */}
        {featuredJobs.length > 0 && (
          <section className="px-6 py-20">
            <div className="mx-auto max-w-5xl">
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Ofertas disponibles</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Oportunidades activas en Latinoamérica</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="hidden shrink-0 sm:flex">
                  <Link href="/jobs">
                    Ver todas
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {featuredJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="group">
                    <div className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <CompanyAvatar name={job.company ?? "Empresa"} />
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {job.type === "remote"
                            ? "Remoto"
                            : job.type === "hybrid"
                              ? "Híbrido"
                              : job.type === "part-time"
                                ? "Medio tiempo"
                                : "Tiempo completo"}
                        </Badge>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                        {job.title}
                      </h3>
                      {job.company && (
                        <p className="mt-1 text-xs text-muted-foreground">{job.company}</p>
                      )}
                      {job.location && (
                        <div className="mt-auto flex items-center gap-1 pt-3 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          {job.location}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 text-center sm:hidden">
                <Button asChild variant="outline" size="sm">
                  <Link href="/jobs">
                    Ver todas las ofertas
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Cómo funciona */}
        <section
          id="como-funciona"
          className={cn("px-6 py-24", featuredJobs.length > 0 ? "border-t bg-muted/30" : "")}
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight">¿Cómo funciona?</h2>
              <p className="mt-3 text-muted-foreground">
                Tres pasos para encontrar al candidato ideal, sin perder tiempo.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {steps.map((item, i) => (
                <div
                  key={item.step}
                  className="animate-fade-in-up rounded-2xl border bg-card p-6 shadow-sm"
                  style={{ animationDelay: `${0.1 + i * 0.15}s` }}
                >
                  <span className="text-5xl font-black leading-none text-primary/10">{item.step}</span>
                  <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    {item.icon}
                  </div>
                  <Badge variant="outline" className="mt-3 text-xs text-muted-foreground">
                    {item.forRole}
                  </Badge>
                  <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios por rol */}
        <section className={cn("px-6 py-20", featuredJobs.length === 0 ? "border-t bg-muted/30" : "")}>
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">¿Sos candidato o reclutador?</h2>
              <p className="mt-3 text-muted-foreground">Vilfit tiene algo especial para cada uno.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Candidatos */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm">
                <div className="flex size-12 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Users className="size-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold">Para candidatos</h3>
                <Badge className="mt-1 bg-success/10 text-success hover:bg-success/20">100% gratis</Badge>
                <ul className="mt-6 flex flex-col gap-3">
                  {[
                    "Subí tu CV en PDF en segundos",
                    "Respondé preguntas de screening personalizadas",
                    "Recibí tu score de compatibilidad con IA",
                    "Seguí el estado de tus postulaciones en tiempo real",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full" variant="outline">
                  <Link href={session && role === "candidate" ? "/applications" : "/login"}>
                    {session && role === "candidate" ? "Ver mis postulaciones" : "Crear cuenta gratis"}
                  </Link>
                </Button>
              </div>

              {/* Reclutadores */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm ring-2 ring-primary/20">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Brain className="size-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold">Para reclutadores</h3>
                <Badge className="mt-1 bg-primary/10 text-primary hover:bg-primary/20">Suscripción mensual</Badge>
                <ul className="mt-6 flex flex-col gap-3">
                  {[
                    "Creá ofertas con preguntas de screening personalizadas",
                    "La IA lee y analiza cada CV automáticamente",
                    "Candidatos ordenados por score de compatibilidad",
                    "Fortalezas y brechas de cada candidato explicadas",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full">
                  <Link href={session && role === "recruiter" ? "/recruiter/dashboard" : "/login"}>
                    {session && role === "recruiter" ? "Ir al dashboard" : "Empezar a contratar"}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Preguntas frecuentes</h2>
              <p className="mt-2 text-muted-foreground">Todo lo que necesitás saber antes de empezar.</p>
            </div>
            <Accordion type="single" collapsible className="flex flex-col gap-2">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.q}
                  value={faq.q}
                  className="rounded-xl border bg-card px-5 shadow-sm data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA final */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.38_0.28_265)] via-[oklch(0.42_0.30_278)] to-[oklch(0.34_0.28_298)] px-6 py-24 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,oklch(1_0_0/0.07),transparent)]" />
          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Zap className="size-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Listo para contratar mejor</h2>
            <p className="mt-3 text-white/70">
              Únete a los reclutadores que ya usan IA para encontrar al candidato ideal. Sin sesgo,
              sin horas leyendo CVs.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary shadow-lg hover:bg-white/90"
              >
                <Link href={session ? dashboardHref : "/login"}>
                  {session ? "Ir a mi dashboard" : "Crear cuenta gratis"}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/jobs">Ver ofertas disponibles</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-6 pb-8 pt-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div>
              <Logo variant="on-light" />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Marketplace de empleo con análisis IA para Latinoamérica. Candidatos gratis, reclutadores con superpoderes.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Plataforma</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/jobs" className="transition-colors hover:text-foreground">Ver ofertas de trabajo</Link>
                </li>
                <li>
                  <Link href="/login" className="transition-colors hover:text-foreground">Ingresar</Link>
                </li>
                <li>
                  <Link href="/login" className="transition-colors hover:text-foreground">Crear cuenta gratis</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Reclutadores</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="transition-colors hover:text-foreground">Publicar una oferta</Link>
                </li>
                <li>
                  <Link href="/recruiter/dashboard" className="transition-colors hover:text-foreground">Panel de control</Link>
                </li>
                <li>
                  <Link href="#como-funciona" className="transition-colors hover:text-foreground">Cómo funciona</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 border-t pt-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <span>© 2025 Vilfit · Todos los derechos reservados</span>
            <span className="flex items-center gap-1.5">
              <Brain className="size-3.5" />
              Impulsado por IA · Hecho en Latinoamérica
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
