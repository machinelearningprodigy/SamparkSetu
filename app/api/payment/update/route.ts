import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const body = await request.json()
    const { paymentId, orderId, paymentLink, status, userId } = body

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Get the payment document
    const paymentRef = adminDb.collection("payments").doc(paymentId)
    const paymentDoc = await paymentRef.get()

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Update fields
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (orderId) updateData.orderId = orderId
    if (paymentLink) updateData.paymentLink = paymentLink
    if (status) updateData.status = status

    await paymentRef.update(updateData)

    return NextResponse.json({
      success: true,
      message: "Payment updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: error.message || "Failed to update payment" }, { status: 500 })
  }
}
