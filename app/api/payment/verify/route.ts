import { adminDb } from "@/lib/firebase-admin"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 })
    }

    await adminDb
      .collection("users")
      .doc(session?.metadata?.userId)
      .set(
        {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items?.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeRole: "pro",
        },
        { merge: true },
      )
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    await adminDb
      .collection("users")
      .doc(session?.metadata?.userId)
      .set(
        {
          stripePriceId: subscription.items?.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        { merge: true },
      )
  }

  return new NextResponse(null, { status: 200 })
}
