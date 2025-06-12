import { NextResponse } from "next/server"
import { collection, query, where, getDocs, getDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"





export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") || "suggested"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Fetch all items belonging to the user
    const itemsRef = collection(db, "items")
    const userItemsQuery = query(itemsRef, where("user_id", "==", userId))
    const userItemsSnapshot = await getDocs(userItemsQuery)

    if (userItemsSnapshot.empty) {
      return NextResponse.json({ matches: [] })
    }

    const userItemIds = userItemsSnapshot.docs.map((doc) => doc.id)

    // Fetch matches where user's items are involved
    const matchesRef = collection(db, "matches")
    const lostMatchesQuery = query(matchesRef, where("lost_item_id", "in", userItemIds), where("status", "==", status))

    const foundMatchesQuery = query(
      matchesRef,
      where("found_item_id", "in", userItemIds),
      where("status", "==", status),
    )

    const [lostMatchesSnapshot, foundMatchesSnapshot] = await Promise.all([
      getDocs(lostMatchesQuery),
      getDocs(foundMatchesQuery),
    ])

    // Combine and process matches
    const matches = []

    // Process lost item matches
    for (const matchDoc of lostMatchesSnapshot.docs) {
      const matchData = { id: matchDoc.id, ...matchDoc.data() }

      // Get the found item details
      const foundItemDoc = await getDoc(doc(db, "items", matchData.found_item_id))
      if (foundItemDoc.exists()) {
        const foundItem = { id: foundItemDoc.id, ...foundItemDoc.data() }

        // Get the found item's owner
        const ownerDoc = await getDoc(doc(db, "profiles", foundItem.user_id))
        const owner = ownerDoc.exists() ? { id: ownerDoc.id, ...ownerDoc.data() } : null

        matches.push({
          id: matchDoc.id,
          ...matchData,
          foundItem,
          owner,
          matchType: "lost",
        })
      }
    }

    // Process found item matches
    for (const matchDoc of foundMatchesSnapshot.docs) {
      const matchData = { id: matchDoc.id, ...matchDoc.data() }

      // Get the lost item details
      const lostItemDoc = await getDoc(doc(db, "items", matchData.lost_item_id))
      if (lostItemDoc.exists()) {
        const lostItem = { id: lostItemDoc.id, ...lostItemDoc.data() }

        // Get the lost item's owner
        const ownerDoc = await getDoc(doc(db, "profiles", lostItem.user_id))
        const owner = ownerDoc.exists() ? { id: ownerDoc.id, ...ownerDoc.data() } : null

        matches.push({
          id: matchDoc.id,
          ...matchData,
          lostItem,
          owner,
          matchType: "found",
        })
      }
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { matchId, status, userId } = await request.json()

    if (!matchId || !status || !userId) {
      return NextResponse.json({ error: "Match ID, status, and user ID are required" }, { status: 400 })
    }

    // Update match status
    const matchRef = doc(db, "matches", matchId)
    await updateDoc(matchRef, {
      status,
      updated_at: serverTimestamp(),
      updated_by: userId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating match:", error)
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 })
  }
}
