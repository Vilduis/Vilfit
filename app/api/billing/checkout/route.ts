import { NextResponse } from "next/server"
import { auth } from "@/lib/proxy"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { stripe } from "@/lib/stripe"

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!dbUser[0] || dbUser[0].role !== "recruiter") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/recruiter/billing?success=1`,
    cancel_url: `${baseUrl}/recruiter/billing?cancelled=1`,
    metadata: {
      userId: dbUser[0].id,
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
