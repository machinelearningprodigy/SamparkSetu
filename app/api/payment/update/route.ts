import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"
import { db } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Get request body
    const body = await request.json()
    const { paymentId, orderId, paymentLink, status } = body

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Get the payment
    const paymentRef = db.collection("payments").doc(paymentId)
    const paymentDoc = await paymentRef.get()

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const paymentData = paymentDoc.data()

    // Verify that the user is authorized to update this payment
    if (paymentData.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized to update this payment" }, { status: 403 })
    }

    // Update fields
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (orderId) updateData.orderId = orderId
    if (paymentLink) updateData.paymentLink = paymentLink
    if (status) updateData.status = status

    await paymentRef.update(updateData)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating payment:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while updating the payment" },
      { status: 500 },
    )
  }
}
