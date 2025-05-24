import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log("Webhook payload received:", JSON.stringify(payload))

    // Validate webhook payload
    if (!payload.order_id || !payload.order_status) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
    }

    // Process payment status update
    if (payload.order_status === "PAID" || payload.data?.payment_status === "SUCCESS") {
      // Find the payment record
      const paymentsRef = db.collection("payments")
      const querySnapshot = await paymentsRef.where("orderId", "==", payload.order_id).get()

      if (!querySnapshot.empty) {
        const paymentDoc = querySnapshot.docs[0]
        const paymentData = paymentDoc.data()

        // Update payment record
        await paymentDoc.ref.update({
          status: "SUCCESS",
          webhook_received: true,
          webhook_data: payload,
          updated_at: new Date(),
        })

        // If this is an item payment, update the item status
        if (paymentData.itemId) {
          const itemRef = db.collection("items").doc(paymentData.itemId)
          const itemDoc = await itemRef.get()

          if (itemDoc.exists) {
            await itemRef.update({
              payment_status: "paid",
              updated_at: new Date(),
            })
          }
        }

        // If this is a direct payment to a recipient, create a notification
        if (paymentData.recipientId) {
          await db.collection("notifications").add({
            userId: paymentData.recipientId,
            type: "payment_received",
            title: "Payment Received",
            message: `You have received a payment of ₹${paymentData.amount} from ${paymentData.userName || "a user"}`,
            read: false,
            data: {
              paymentId: paymentDoc.id,
              amount: paymentData.amount,
              senderId: paymentData.userId,
              senderName: paymentData.userName,
            },
            created_at: new Date(),
          })
        }
      }
    } else if (payload.order_status === "FAILED" || payload.data?.payment_status === "FAILED") {
      // Update payment status to failed
      const paymentsRef = db.collection("payments")
      const querySnapshot = await paymentsRef.where("orderId", "==", payload.order_id).get()

      if (!querySnapshot.empty) {
        const paymentDoc = querySnapshot.docs[0]

        await paymentDoc.ref.update({
          status: "FAILED",
          webhook_received: true,
          webhook_data: payload,
          updated_at: new Date(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: error.message || "Failed to process webhook" }, { status: 500 })
  }
}
