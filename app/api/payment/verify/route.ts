import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentId, itemId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Cashfree credentials
    const clientId = process.env.CASHFREE_CLIENT_ID
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("Missing Cashfree credentials")
      return NextResponse.json({ error: "Payment service configuration error" }, { status: 500 })
    }

    // Verify payment with Cashfree API
    try {
      const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}/payments`, {
        method: "GET",
        headers: {
          "x-client-id": clientId,
          "x-client-secret": clientSecret,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Cashfree API error:", errorData)
        return NextResponse.json(
          { error: "Failed to verify payment with Cashfree", details: errorData },
          { status: response.status },
        )
      }

      const paymentData = await response.json()

      // Update payment status in Firestore if paymentId is provided
      if (paymentId && adminDb) {
        try {
          const paymentStatus = paymentData[0]?.payment_status || "UNKNOWN"

          await adminDb
            .collection("payments")
            .doc(paymentId)
            .update({
              status: paymentStatus,
              paymentMethod: paymentData[0]?.payment_method || "",
              paymentTime: new Date(),
              updatedAt: new Date(),
              cashfreeData: paymentData[0] || {},
            })

          // If payment is successful and there's an item ID, update the item status
          if (paymentStatus === "SUCCESS" && itemId) {
            await adminDb.collection("items").doc(itemId).update({
              payment_status: "paid",
              updated_at: new Date(),
            })
          }
        } catch (dbError) {
          console.error("Error updating payment record:", dbError)
          // Continue even if DB update fails
        }
      }

      return NextResponse.json({
        success: true,
        data: paymentData,
        status: paymentData[0]?.payment_status || "UNKNOWN",
      })
    } catch (apiError: any) {
      console.error("Cashfree API error:", apiError)
      return NextResponse.json(
        {
          error: "Failed to verify payment",
          details: apiError.message,
          success: false,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while verifying the payment", success: false },
      { status: 500 },
    )
  }
}
