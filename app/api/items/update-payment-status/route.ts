import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const body = await request.json()
    const { itemId, paymentStatus } = body

    if (!itemId || !paymentStatus) {
      return NextResponse.json({ error: "Missing required fields: itemId, paymentStatus" }, { status: 400 })
    }

    // Update the item's payment status
    await adminDb.collection("items").doc(itemId).update({
      payment_status: paymentStatus,
      updated_at: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating item payment status:", error)
    return NextResponse.json({ error: error.message || "Failed to update payment status" }, { status: 500 })
  }
}
