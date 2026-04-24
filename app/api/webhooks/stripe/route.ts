import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { recruiterProfiles, subscriptions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    if (!userId || !session.subscription) return NextResponse.json({ ok: true })

    const sub = await getStripe().subscriptions.retrieve(session.subscription as string)
    const periodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000)

    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.recruiterId, userId))
      .limit(1)

    if (existing[0]) {
      await db
        .update(subscriptions)
        .set({
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0].price.id,
          currentPeriodEnd: periodEnd,
        })
        .where(eq(subscriptions.recruiterId, userId))
    } else {
      await db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        recruiterId: userId,
        stripeCustomerId: session.customer as string,
        stripePriceId: sub.items.data[0].price.id,
        stripeSubscriptionId: sub.id,
        status: "active",
        currentPeriodEnd: periodEnd,
      })
    }

    await db
      .update(recruiterProfiles)
      .set({ subscriptionStatus: "active" })
      .where(eq(recruiterProfiles.userId, userId))
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription

    await db
      .update(subscriptions)
      .set({ status: "cancelled" })
      .where(eq(subscriptions.stripeSubscriptionId, sub.id))

    const subRecord = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, sub.id))
      .limit(1)

    if (subRecord[0]) {
      await db
        .update(recruiterProfiles)
        .set({ subscriptionStatus: "cancelled" })
        .where(eq(recruiterProfiles.userId, subRecord[0].recruiterId))
    }
  }

  return NextResponse.json({ ok: true })
}
