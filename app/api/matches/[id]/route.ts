import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 })
    }

    const matchDoc = await getDoc(doc(db, "matches", matchId))

    if (!matchDoc.exists()) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    const matchData = matchDoc.data()

    return NextResponse.json({
      id: matchDoc.id,
      ...matchData,
    })
  } catch (error) {
    console.error("Error fetching match:", error)
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id
    const { status } = await request.json()

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const matchRef = doc(db, "matches", matchId)
    const matchDoc = await getDoc(matchRef)

    if (!matchDoc.exists()) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    await updateDoc(matchRef, {
      status,
      updated_at: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Match status updated successfully",
    })
  } catch (error) {
    console.error("Error updating match:", error)
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 })
  }
}
