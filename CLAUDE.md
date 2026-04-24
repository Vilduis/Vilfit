# Vilfit — Marketplace de Empleo para Latinoamérica

## Descripción
Plataforma donde reclutadores publican ofertas laborales, candidatos se postulan subiendo su CV, y la IA analiza automáticamente cada postulación calculando un score de compatibilidad. Los reclutadores ven un ranking de candidatos sin leer un solo CV.

**Modelo de negocio:** Candidatos usan la plataforma gratis. Reclutadores pagan suscripción mensual para publicar ofertas y acceder al ranking IA.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 App Router |
| Auth | NextAuth v5 beta + Google OAuth |
| DB | Drizzle ORM + Neon PostgreSQL (serverless) |
| UI | Tailwind CSS v4 + shadcn/ui (28 componentes) |
| AI | Google Gemini (`@google/generative-ai`) |
| PDF Parsing | `pdf-parse` |
| Pagos | Stripe |
| Storage CVs | Vercel Blob (`@vercel/blob`) |

---

## Variables de Entorno Requeridas

```env
# Auth
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# DB
DATABASE_URL=

# AI
GOOGLE_GENERATIVE_AI_API_KEY=

# Storage
BLOB_READ_WRITE_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
```

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

## Arquitectura de Roles

### `candidate`
- Accede a la plataforma gratis
- Ve ofertas de trabajo públicas
- Se postula subiendo su CV (PDF) + responde preguntas de screening
- Ve el estado de sus postulaciones en su dashboard

### `recruiter`
- Paga suscripción mensual (Stripe)
- Crea y gestiona ofertas laborales
- Define preguntas de screening por oferta
- Ve candidatos rankeados por score IA en su dashboard

### Flujo post-login
Primer login → `/onboarding` (seleccionar rol) → dashboard según rol

---

## Estructura de Carpetas

```
app/
  (public)/              # Rutas públicas
    page.tsx             # Landing page
    jobs/
      page.tsx           # Listado de ofertas
      [id]/
        page.tsx         # Detalle de oferta
        apply/page.tsx   # Postulación (candidato auth)
  (auth)/
    login/page.tsx
    onboarding/page.tsx
  (candidate)/           # Layout con guard role=candidate
    dashboard/page.tsx
    profile/page.tsx
  (recruiter)/           # Layout con guard role=recruiter + subscription
    recruiter/
      dashboard/page.tsx
      jobs/
        page.tsx
        new/page.tsx
        [id]/candidates/page.tsx
      billing/page.tsx
      profile/page.tsx
  api/
    auth/[...nextauth]/route.ts
    jobs/route.ts
    jobs/[id]/route.ts
    jobs/[id]/apply/route.ts
    recruiter/jobs/[id]/applications/route.ts
    ai/analyze/route.ts
    billing/checkout/route.ts
    webhooks/stripe/route.ts

lib/
  db/
    schema.ts            # Tablas Drizzle
    index.ts             # Conexión Neon
  ai.ts                  # Gemini integration
  blob.ts                # Vercel Blob helpers
  stripe.ts              # Stripe client
  utils.ts               # cn() helper
  proxy.ts               # Auth proxy

components/
  ui/                    # shadcn/ui components
  theme-provider.tsx
```

---

## Schema de Base de Datos

### `users`
- `id`, `name`, `email`, `image` (de Google OAuth)
- `role`: `'candidate' | 'recruiter' | null` (null = onboarding pendiente)
- `createdAt`

### `recruiter_profiles`
- `id`, `userId` (FK → users)
- `company`, `description`, `website`
- `subscriptionStatus`: `'free' | 'active' | 'cancelled'`

### `job_offers`
- `id`, `recruiterId` (FK → users)
- `title`, `description`, `requirements`, `location`, `salaryRange`
- `type`: `'full-time' | 'part-time' | 'remote' | 'hybrid'`
- `status`: `'draft' | 'active' | 'closed'`
- `screeningQuestions`: JSON array de strings
- `createdAt`, `updatedAt`

### `applications`
- `id`, `candidateId` (FK → users), `jobOfferId` (FK → job_offers)
- `cvUrl`: URL del PDF en Vercel Blob
- `status`: `'pending' | 'reviewing' | 'accepted' | 'rejected'`
- `matchScore`: integer 0-100 (null hasta que IA corra)
- `aiAnalysis`: JSON `{ strengths, gaps, summary, recommendation }`
- `createdAt`

### `screening_answers`
- `id`, `applicationId` (FK → applications)
- `question`, `answer`

### `subscriptions`
- `id`, `recruiterId` (FK → users)
- `stripeCustomerId`, `stripePriceId`, `stripeSubscriptionId`
- `status`, `currentPeriodEnd`

---

## Flujo de Análisis IA

1. Candidato envía postulación → PDF subido a Vercel Blob → URL en `applications.cvUrl`
2. `pdf-parse` extrae texto del PDF
3. Gemini recibe: texto del CV + título/descripción/requisitos de la oferta
4. Gemini responde JSON: `{ matchScore, strengths[], gaps[], summary, recommendation }`
5. Se guarda en `applications.matchScore` y `applications.aiAnalysis`
6. Dashboard del reclutador muestra candidatos ordenados por `matchScore DESC`

---

## Convenciones

- Server Components por defecto, `"use client"` solo cuando sea necesario
- API routes devuelven `Response` con `NextResponse.json()`
- Auth checks con `auth()` de `lib/proxy.ts` en Server Components
- DB queries directamente con Drizzle en server actions o route handlers
- Tipos TypeScript inferidos del schema Drizzle con `InferSelectModel` / `InferInsertModel`
