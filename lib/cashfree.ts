import axios from "axios"

// Utility functions for payment calculations
export function calculatePlatformFee(amount: number): number {
  // 10% platform fee
  return amount * 0.1
}


export function calculateTotalAmount(amount: number): number {
  return amount + calculatePlatformFee(amount)
}

// Cashfree API credentials
const CLIENT_ID = process.env.CASHFREE_CLIENT_ID || "TEST105109316878a2d6aacd12dbf90f13901501"
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || "cfsk_ma_test_7e11b8a14fc275e6f6d0bed3f1bbab79_f56775be"
const ENVIRONMENT = "SANDBOX" // or "PRODUCTION" for live

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

// Create a payment order
export async function createPaymentOrder(
  orderId: string,
  amount: number,
  userId: string,
  userName: string,
  userEmail: string,
  userPhone: string,
  returnUrl: string,
  notifyUrl: string,
  purpose = "Payment",
) {
  try {
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
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
          return_url: returnUrl,
          notify_url: notifyUrl,
        },
        order_note: purpose,
      },
      {
        headers: {
          "x-client-id": CLIENT_ID,
          "x-client-secret": CLIENT_SECRET,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      },
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error creating payment order:", error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create payment order",
    }
  }
}
