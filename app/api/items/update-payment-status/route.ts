import { adminDb } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { id, paymentStatus } = await req.json()

    if (!id) {
      return new NextResponse("Missing item ID", { status: 400 })
    }

    if (!paymentStatus) {
      return new NextResponse("Missing payment status", { status: 400 })
    }

    const item = await adminDb.collection("items").doc(id).update({
      paymentStatus: paymentStatus,
    })

    return NextResponse.json(item, {
      status: 200,
    })
  } catch (error) {
    console.log("[UPDATE_PAYMENT_STATUS]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
