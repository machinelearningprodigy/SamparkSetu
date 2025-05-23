import crypto from "crypto"
import { calculatePlatformFee, calculateTotalAmount } from "./payment-utils"
import axios from "axios"

// Re-export the utility functions for server-side use
export { calculatePlatformFee, calculateTotalAmount }

// Cashfree API credentials
const CLIENT_ID = process.env.CASHFREE_CLIENT_ID || "TEST105109316878a2d6aacd12dbf90f13901501"
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || "cfsk_ma_test_7e11b8a14fc275e6f6d0bed3f1bbab79_f56775be"
const ENVIRONMENT = "SANDBOX" // or "PRODUCTION" for live

// Generate a unique order ID
export async function generateOrderId(): Promise<string> {
  const uniqueId = crypto.randomBytes(16).toString("hex")
  const hash = crypto.createHash("sha256")
  hash.update(uniqueId)
  const orderId = hash.digest("hex")
  return orderId.substr(0, 12)
}

// Create a payment order using direct API calls instead of SDK
export async function createPaymentOrder(
  amount: number,
  userId: string,
  userName: string,
  userEmail: string,
  userPhone: string,
  metadata: Record<string, any> = {},
) {
  try {
    const orderId = await generateOrderId()

    const paymentRequest = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: userName || "User",
        customer_email: userEmail || "user@example.com",
        customer_phone: userPhone || "9999999999",
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/status?order_id={order_id}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/webhook`,
      },
      order_note: metadata.purpose || "Payment for item exchange",
    }

    // Make direct API call to Cashfree
    const response = await axios.post("https://sandbox.cashfree.com/pg/orders", paymentRequest, {
      headers: {
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
        "x-api-version": "2022-09-01",
        "Content-Type": "application/json",
      },
    })

    return {
      success: true,
      data: response.data,
      orderId,
    }
  } catch (error: any) {
    console.error("Error creating payment order:", error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create payment order",
    }
  }
}

// Verify payment status
export async function verifyPayment(orderId: string) {
  try {
    const response = await axios.get(`https://sandbox.cashfree.com/pg/orders/${orderId}/payments`, {
      headers: {
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
        "x-api-version": "2022-09-01",
      },
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to verify payment",
    }
  }
}
