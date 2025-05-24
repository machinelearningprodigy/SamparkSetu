import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Cashfree webhook signature verification
    const signature = request.headers.get("x-webhook-signature")
    const timestamp = request.headers.get("x-webhook-timestamp")

    // Log the webhook data for debugging
    console.log("Cashfree webhook received:", body)

    // Extract payment information from Cashfree webhook
    const { type, data } = body

    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { order } = data
      const orderId = order?.order_id
      const paymentStatus = order?.order_status

      if (orderId && adminDb) {
        try {
          // Find and update the payment record
          const paymentsRef = adminDb.collection("payments")
          const querySnapshot = await paymentsRef.where("orderId", "==", orderId).get()

          if (!querySnapshot.empty) {
            const paymentDoc = querySnapshot.docs[0]
            await paymentDoc.ref.update({
              status: paymentStatus === "PAID" ? "SUCCESS" : paymentStatus,
              updatedAt: new Date(),
              webhookData: data,
            })

            // If there's an associated item, update its payment status
            const paymentData = paymentDoc.data()
            if (paymentData.itemId && paymentStatus === "PAID") {
              await adminDb.collection("items").doc(paymentData.itemId).update({
                payment_status: "paid",
                updated_at: new Date(),
              })
            }
          }
        } catch (dbError) {
          console.error("Error updating payment from webhook:", dbError)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
