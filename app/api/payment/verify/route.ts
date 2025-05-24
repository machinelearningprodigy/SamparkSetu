import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { db } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, itemId, paymentId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Cashfree credentials
    const clientId = process.env.CASHFREE_CLIENT_ID || "TEST105109316878a2d6aacd12dbf90f13901501"
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET || "cfsk_ma_test_7e11b8a14fc275e6f6d0bed3f1bbab79_f56775be"

    // Verify payment with Cashfree API
    try {
      const response = await axios.get(`https://sandbox.cashfree.com/pg/orders/${orderId}/payments`, {
        headers: {
          "x-client-id": clientId,
          "x-client-secret": clientSecret,
          "x-api-version": "2022-09-01",
        },
      })

      // Update payment status in Firestore
      if (paymentId) {
        const paymentStatus = response.data[0]?.payment_status || "UNKNOWN"

        await db
          .collection("payments")
          .doc(paymentId)
          .update({
            status: paymentStatus,
            paymentMethod: response.data[0]?.payment_method || "",
            paymentTime: new Date(),
            updatedAt: new Date(),
          })

        // If payment is successful and there's an item ID, update the item status
        if (paymentStatus === "SUCCESS" && itemId) {
          await db.collection("items").doc(itemId).update({
            payment_status: "paid",
            updated_at: new Date(),
          })
        }
      }

      return NextResponse.json({
        success: true,
        data: response.data,
      })
    } catch (apiError: any) {
      console.error("Cashfree API error:", apiError.response?.data || apiError.message)
      return NextResponse.json(
        {
          error: apiError.response?.data?.message || apiError.message,
          success: false,
          details: apiError.response?.data,
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
