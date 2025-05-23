import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, purpose, recipientEmail, userId, userName, userEmail, userPhone } = body

    if (!amount || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create direct payment order with Cashfree API
    try {
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

      // Cashfree credentials
      const clientId = process.env.CASHFREE_CLIENT_ID || "TEST105109316878a2d6aacd12dbf90f13901501"
      const clientSecret =
        process.env.CASHFREE_CLIENT_SECRET || "cfsk_ma_test_7e11b8a14fc275e6f6d0bed3f1bbab79_f56775be"

      console.log("Using Cashfree credentials:", { clientId, clientSecret: "***" })

      const response = await axios.post(
        "https://sandbox.cashfree.com/pg/orders",
        {
          order_id: orderId,
          order_amount: Number.parseFloat(amount),
          order_currency: "INR",
          customer_details: {
            customer_id: userId,
            customer_name: userName || "User",
            customer_email: userEmail || "user@example.com",
            customer_phone: userPhone || "9999999999",
          },
          order_meta: {
            return_url: `${appUrl}/payment/status?order_id={order_id}`,
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

      console.log("Payment order created successfully:", response.data)

      // Generate payment link using the session ID
      const paymentLink = `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`

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
