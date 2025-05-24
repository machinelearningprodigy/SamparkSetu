import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { createPaymentOrder } from "@/lib/cashfree"

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is properly initialized
    if (!adminDb) {
      console.error("Firebase Admin not properly initialized")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const body = await request.json()
    const {
      amount,
      currency = "INR",
      customerId,
      customerEmail,
      customerPhone,
      returnUrl,
      notifyUrl,
      itemId,
      type = "direct",
    } = body

    // Validate required fields
    if (!amount || !customerId || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields: amount, customerId, customerEmail" }, { status: 400 })
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // Create payment order with Cashfree
      const paymentOrder = await createPaymentOrder({
        orderId,
        amount,
        currency,
        customerId,
        customerEmail,
        customerPhone,
        returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/status?orderId=${orderId}`,
        notifyUrl: notifyUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      })

      if (!paymentOrder.success) {
        console.error("Cashfree payment order creation failed:", paymentOrder.error)
        return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
      }

      // Create payment record in Firestore
      const paymentData = {
        orderId,
        amount,
        currency,
        customerId,
        customerEmail,
        customerPhone: customerPhone || null,
        status: "pending",
        type,
        itemId: itemId || null,
        paymentSessionId: paymentOrder.data.payment_session_id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await adminDb.collection("payments").doc(orderId).set(paymentData)

      return NextResponse.json({
        success: true,
        data: {
          orderId,
          paymentSessionId: paymentOrder.data.payment_session_id,
          paymentUrl: paymentOrder.data.payment_url,
        },
      })
    } catch (cashfreeError) {
      console.error("Cashfree API error:", cashfreeError)
      return NextResponse.json({ error: "Payment service temporarily unavailable" }, { status: 503 })
    }
  } catch (error) {
    console.error("Payment creation error:", error)

    // Handle specific Firebase errors
    if (error instanceof Error) {
      if (error.message.includes("Firebase Admin")) {
        return NextResponse.json({ error: "Server configuration error. Please contact support." }, { status: 500 })
      }
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
