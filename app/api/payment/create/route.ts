import { type NextRequest, NextResponse } from "next/server"
import { Cashfree } from "cashfree-pg"
import crypto from "crypto"
import { auth, adminDb } from "@/lib/firebase-admin"

// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID || ""
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET || ""
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX

function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex")
  const hash = crypto.createHash("sha256")
  hash.update(uniqueId)
  const orderId = hash.digest("hex")
  return orderId.substr(0, 12)
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase is available
    if (!auth || !adminDb) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 })
    }

    // Get authorization token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Get request body
    const { amount, itemId, itemTitle } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get user details
    const userRecord = await auth.getUser(userId)
    const userEmail = userRecord.email || "user@example.com"
    const userName = userRecord.displayName || "User"
    const userPhone = userRecord.phoneNumber || "9999999999"

    // Generate order ID
    const orderId = await generateOrderId()

    // Create payment order
    const paymentRequest = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: userId,
        customer_phone: userPhone,
        customer_name: userName,
        customer_email: userEmail,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/status?order_id={order_id}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      },
      order_note: itemTitle ? `Payment for ${itemTitle}` : "Item payment",
    }

    // Create order in Cashfree
    const response = await Cashfree.PGCreateOrder("2023-08-01", paymentRequest)

    if (response && response.data) {
      // Store payment details in Firestore
      const paymentRef = adminDb.collection("payments").doc(orderId)
      await paymentRef.set({
        orderId,
        userId,
        amount,
        itemId,
        itemTitle,
        status: "PENDING",
        createdAt: new Date(),
        paymentLink: response.data.payment_link,
        type: "item",
      })

      return NextResponse.json(response.data)
    } else {
      throw new Error("Failed to create payment order")
    }
  } catch (error: any) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 500 })
  }
}
