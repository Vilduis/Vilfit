# Vilfit

Marketplace de empleo para Latinoamérica donde la IA elimina el filtrado manual de CVs. Los reclutadores publican ofertas laborales y reciben un ranking automático de candidatos con score de compatibilidad — sin leer un solo CV. Los candidatos se postulan subiendo su CV y respondiendo preguntas de screening.

## Modelo de negocio

Candidatos usan la plataforma completamente gratis. Reclutadores pagan suscripción mensual vía Stripe para publicar ofertas y acceder al ranking IA de candidatos. Primer login requiere selección de rol (candidato o reclutador) en onboarding.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 App Router + Turbopack |
| Auth | Auth.js v5 (next-auth@beta) + Google OAuth |
| DB | Drizzle ORM + Neon PostgreSQL (serverless) |
| UI | Tailwind CSS v4 + shadcn/ui + Radix UI + Lucide React |
| IA | Google Gemini (`@google/generative-ai`) |
| Parsing CV | `pdf-parse` |
| Storage CVs | Vercel Blob (`@vercel/blob`) |
| Pagos | Stripe (suscripción mensual) |
| Deploy | Vercel |
| Lenguaje | TypeScript strict |

## Comandos

```bash
npm run dev        # Servidor de desarrollo (Turbopack)
npm run build      # Build de producción
npm run typecheck  # Verificar tipos TypeScript
npm run lint       # ESLint
npm run format     # Prettier

# Base de datos (Drizzle)
npx drizzle-kit generate   # Genera migraciones
npx drizzle-kit migrate    # Corre migraciones
npx drizzle-kit studio     # UI de Drizzle Studio
```

## Variables de entorno requeridas

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
```
