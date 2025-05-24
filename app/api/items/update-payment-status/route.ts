import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"
import { db } from "@/lib/firebase-admin"

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
    const { itemId, status } = body

    if (!itemId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the item
    const itemRef = db.collection("items").doc(itemId)
    const itemDoc = await itemRef.get()

    if (!itemDoc.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Update the item
    await itemRef.update({
      payment_status: status,
      updated_at: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating item payment status:", error)
    return NextResponse.json({ error: error.message || "An error occurred while updating the item" }, { status: 500 })
  }
}
