import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { auth, adminDb } from "@/lib/firebase-admin"
import crypto from "crypto"

// Generate a unique order ID
function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex")
  const timestamp = Date.now().toString()
  return `order_${timestamp}_${uniqueId.substring(0, 8)}`
}

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
    const { amount, purpose, recipientEmail, paymentId, itemId, userName, userEmail, userPhone } = body

    if (!amount || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate order ID
    const orderId = generateOrderId()

    // Cashfree credentials
    const clientId = process.env.CASHFREE_CLIENT_ID || "TEST105109316878a2d6aacd12dbf90f13901501"
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET || "cfsk_ma_test_7e11b8a14fc275e6f6d0bed3f1bbab79_f56775be"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Create payment order with Cashfree API
    try {
      const response = await axios.post(
        "https://sandbox.cashfree.com/pg/orders",
        {
          order_id: orderId,
          order_amount: Number.parseFloat(amount.toString()),
          order_currency: "INR",
          customer_details: {
            customer_id: userId,
            customer_name: userName || "User",
            customer_email: userEmail || "user@example.com",
            customer_phone: userPhone || "9999999999",
          },
          order_meta: {
            return_url: `${appUrl}/payment/status?order_id={order_id}&item_id=${itemId || ""}&payment_id=${paymentId || ""}`,
            notify_url: `${appUrl}/api/payment/webhook`,
          },
          order_note: purpose || "Payment for lost and found item",
        },
        {
          headers: {
            "x-client-id": clientId,
            "x-client-secret": clientSecret,
            "x-api-version": "2022-09-01",
            "Content-Type": "application/json",
          },
        },
      )

      // Update the payment record with order ID
      if (paymentId) {
        await adminDb.collection("payments").doc(paymentId).update({
          orderId: orderId,
          cashfreeOrderId: response.data.cf_order_id,
          paymentLink: response.data.payment_link,
          updatedAt: new Date(),
        })
      }

      // Generate payment link using the session ID
      const paymentLink = response.data.payment_link || `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`

      // Return the payment link and order ID
      return NextResponse.json({
        success: true,
        order_id: orderId,
        payment_link: paymentLink,
        data: response.data,
      })
    } catch (apiError: any) {
      console.error("Cashfree API error:", apiError.response?.data || apiError.message)
      return NextResponse.json(
        {
          error: apiError.response?.data?.message || apiError.message,
          details: apiError.response?.data,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}
