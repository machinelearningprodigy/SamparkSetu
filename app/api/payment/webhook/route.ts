import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc, collection, serverTimestamp, getDoc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Validate webhook payload
    if (!payload.order_id || !payload.order_status) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
    }

    // Process payment status update
    if (payload.order_status === "PAID") {
      // Find the item associated with this payment
      const paymentsRef = collection(db, "payments")
      const querySnapshot = await getDoc(doc(paymentsRef, payload.order_id))

      if (querySnapshot.exists()) {
        const paymentData = querySnapshot.data()
        const itemId = paymentData.item_id

        // Update item status
        const itemRef = doc(db, "items", itemId)
        await updateDoc(itemRef, {
          status: "completed",
          payment_status: "paid",
          updated_at: serverTimestamp(),
        })

        // Update payment record
        await updateDoc(doc(paymentsRef, payload.order_id), {
          status: "SUCCESS",
          webhook_received: true,
          updated_at: serverTimestamp(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: error.message || "Failed to process webhook" }, { status: 500 })
  }
}
