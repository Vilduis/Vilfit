# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Vilfit — Marketplace de Empleo para Latinoamérica

Plataforma donde reclutadores publican ofertas laborales, candidatos se postulan subiendo su CV, y la IA analiza automáticamente cada postulación calculando un score de compatibilidad.

**Modelo de negocio:** Candidatos usan la plataforma gratis. Reclutadores pagan suscripción mensual (Stripe) para publicar ofertas y acceder al ranking IA.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 App Router |
| Auth | NextAuth v5 beta + Google OAuth |
| DB | Drizzle ORM + Neon PostgreSQL (serverless) |
| UI | Tailwind CSS v4 + shadcn/ui + radix-ui |
| AI | Google Gemini `gemini-2.5-flash` (`@google/generative-ai`) |
| PDF Parsing | `pdf-parse` (required via `require()` — no ESM default export) |
| Pagos | Stripe |
| Storage CVs | Vercel Blob (`@vercel/blob`) |

---

## Comandos

```bash
npm run dev          # Dev server con Turbopack
npm run build        # Build de producción
npm run typecheck    # Type check TypeScript
npm run lint         # ESLint
npm run format       # Prettier

# DB (Drizzle)
npx drizzle-kit generate   # Genera migraciones
npx drizzle-kit migrate    # Corre migraciones
npx drizzle-kit studio     # Drizzle Studio UI
```

---

## Variables de Entorno Requeridas

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

DATABASE_URL=

GOOGLE_GENERATIVE_AI_API_KEY=

BLOB_READ_WRITE_TOKEN=

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

NEXT_PUBLIC_URL=   # Base URL usada en Stripe redirect URLs
```

---

## Arquitectura de Roles

### Flujo post-login
Primer login → `/onboarding` (seleccionar rol) → dashboard según rol

### `candidate`
- Accede a la plataforma gratis
- Se postula subiendo su CV (PDF) + responde preguntas de screening
- Ve el estado de sus postulaciones en `/dashboard`

### `recruiter`
- Paga suscripción mensual (Stripe)
- Crea y gestiona ofertas laborales con preguntas de screening
- Ve candidatos rankeados por score IA en `/recruiter/dashboard`

---

## Estructura de Rutas

```
app/
  page.tsx                              # Landing page
  layout.tsx                            # Root layout (ThemeProvider, Geist fonts)
  login/page.tsx
  onboarding/page.tsx + onboarding-form.tsx
  dashboard/page.tsx                    # Candidato: mis postulaciones
  profile/page.tsx                      # Candidato: perfil
  jobs/
    page.tsx                            # Listado público de ofertas
    [id]/
      page.tsx                          # Detalle de oferta
      apply/page.tsx                    # Postulación (requiere role=candidate)
  recruiter/
    dashboard/page.tsx
    profile/page.tsx
    jobs/
      page.tsx
      new/page.tsx + new-job-form.tsx
      delete-job-button.tsx
      [id]/
        edit/page.tsx + edit-job-form.tsx
        candidates/page.tsx             # Ranking IA de candidatos
  actions/
    auth.ts                             # Server action: handleSignOut()

  api/
    auth/[...nextauth]/route.ts
    user/role/route.ts                  # POST: set role en onboarding
    jobs/route.ts                       # GET (listado), POST (crear oferta)
    jobs/[id]/route.ts                  # GET, PATCH, DELETE
    jobs/[id]/apply/route.ts            # POST: postulación + trigger IA
    applications/[id]/route.ts          # DELETE: retirar postulación
    profile/route.ts                    # PATCH: perfil candidato
    recruiter/profile/route.ts          # PATCH: perfil reclutador
    recruiter/jobs/[id]/applications/route.ts  # GET: candidatos rankeados
    billing/checkout/route.ts           # POST: crear Stripe checkout session
    webhooks/stripe/route.ts            # POST: webhook Stripe

lib/
  auth.ts → lib/proxy.ts               # Re-exporta auth() de NextAuth
  db/schema.ts                          # Tablas Drizzle + tipos exportados
  db/index.ts                           # Conexión Neon
  ai.ts                                 # Gemini integration + analyzeApplication()
  blob.ts                               # Vercel Blob helpers
  stripe.ts                             # Stripe client (lazy singleton)
  utils.ts                              # cn() helper
```

---

## Schema de Base de Datos

### `users`
- `id`, `name`, `email`, `image` (de Google OAuth)
- `role`: `'candidate' | 'recruiter' | null` (null = onboarding pendiente)

### `candidate_profiles`
- `userId` (FK → users)
- `headline`, `bio`, `location`, `phone`, `linkedin`, `portfolio`

### `recruiter_profiles`
- `userId` (FK → users)
- `company`, `description`, `website`
- `subscriptionStatus`: `'free' | 'active' | 'cancelled'`

### `job_offers`
- `recruiterId` (FK → users)
- `title`, `description`, `requirements`, `location`, `salaryRange`
- `type`: `'full-time' | 'part-time' | 'remote' | 'hybrid'`
- `status`: `'draft' | 'active' | 'closed'`
- `screeningQuestions`: JSON `string[]`

### `applications`
- `candidateId` (FK → users), `jobOfferId` (FK → job_offers)
- `cvUrl`: URL pública en Vercel Blob
- `status`: `'pending' | 'reviewing' | 'accepted' | 'rejected'`
- `matchScore`: integer 0-100 (null hasta que IA termine)
- `aiAnalysis`: JSON `{ strengths[], gaps[], summary, recommendation: 'hire'|'maybe'|'pass' }`

### `screening_answers`
- `applicationId` (FK → applications), `question`, `answer`

### `subscriptions`
- `recruiterId` (FK → users)
- `stripeCustomerId`, `stripePriceId`, `stripeSubscriptionId`
- `status`, `currentPeriodEnd`

Tipos exportados desde `lib/db/schema.ts` con `$inferSelect` / `$inferInsert`.

---

## Flujo de Análisis IA

1. `POST /api/jobs/[id]/apply` sube el PDF a Vercel Blob, inserta `applications` + `screening_answers`
2. Llama `analyzeApplication()` de forma **no bloqueante** (`.catch(console.error)` — fire and forget)
3. `analyzeApplication()` en `lib/ai.ts`:
   - Descarga el PDF desde la URL y lo parsea con `pdf-parse` (texto truncado a 8000 chars)
   - Envía prompt a `gemini-2.5-flash` con job + CV + screening answers
   - Parsea el JSON de respuesta y actualiza `applications.matchScore` + `applications.aiAnalysis`
   - Cambia `status` a `'reviewing'`
4. El dashboard del reclutador muestra candidatos ordenados por `matchScore DESC`

---

## Convenciones Clave

- **Server Components por defecto**, `"use client"` solo cuando sea necesario
- **Auth en Server Components**: `import { auth } from "@/lib/proxy"` (re-exporta desde `auth.ts` en raíz)
- **Patrón de auth en API routes**: session → `session.user.email` → lookup en DB para obtener `dbUser` con `role`. El token JWT almacena `id` y `role` pero siempre se verifica el rol contra `dbUser.role`
- **Params en Next.js 16**: `params` es `Promise<{ id: string }>`, siempre hacer `const { id } = await params`
- **IDs generados** con `crypto.randomUUID()` (no UUID library)
- **DB queries** directamente con Drizzle en route handlers o server components — sin capa de repositorio
- **API routes** devuelven `NextResponse.json()`
