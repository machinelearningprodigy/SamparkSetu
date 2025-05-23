import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/cashfree"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Verify payment with Cashfree
    const result = await verifyPayment(orderId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Update payment status in Firestore
    try {
      const paymentQuery = query(collection(db, "payments"), where("orderId", "==", orderId))
      const querySnapshot = await getDocs(paymentQuery)

      if (!querySnapshot.empty) {
        const paymentDoc = querySnapshot.docs[0]
        const paymentStatus = result.data[0]?.payment_status || "UNKNOWN"

        await updateDoc(doc(db, "payments", paymentDoc.id), {
          status: paymentStatus,
          updatedAt: new Date(),
        })
      }
    } catch (dbError) {
      console.error("Error updating payment record:", dbError)
      // Continue even if DB update fails
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while verifying the payment" },
      { status: 500 },
    )
  }
}
