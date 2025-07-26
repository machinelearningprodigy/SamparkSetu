import { NextResponse } from "next/server"
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { calculateMatchScore } from "@/lib/matching-algorithm"
import type { Item } from "@/lib/database.types"

export async function POST(request: Request) {
  try {
    const { itemId, userId } = await request.json()

    
    if (!itemId || !userId) {
      return NextResponse.json({ error: "Item ID and User ID are required" }, { status: 400 })
    }

    // Fetch the target item
    const itemsRef = collection(db, "items")
    const itemQuery = query(itemsRef, where("__name__", "==", itemId))
    const itemSnapshot = await getDocs(itemQuery)

    if (itemSnapshot.empty) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const targetItem = {
      id: itemSnapshot.docs[0].id,
      ...itemSnapshot.docs[0].data(),
    } as Item

    // Fetch all items of the opposite type
    const oppositeType = targetItem.type === "lost" ? "found" : "lost"
    const allItemsQuery = query(itemsRef, where("type", "==", oppositeType), where("user_id", "!=", userId))
    const allItemsSnapshot = await getDocs(allItemsQuery)

    const allItems = allItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Item[]

    // Calculate match scores for all potential items
    const matches = await Promise.all(
      allItems.map(async (item) => {
        // Calculate match score
        const score =
          targetItem.type === "lost" ? calculateMatchScore(targetItem, item) : calculateMatchScore(item, targetItem)

        // Only include items with decent match score
        if (score < 0.5) return null

        // Get user profile for the item owner
        const userDoc = await getDoc(doc(db, "profiles", item.user_id))
        const otherUser = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null

        // Generate match reason
        const matchReason = generateMatchReason(
          targetItem.type === "lost" ? targetItem : item,
          targetItem.type === "found" ? targetItem : item,
          score,
        )

        return {
          ...item,
          matchScore: score,
          matchReason,
          otherUser,
        }
      }),
    )

    // Filter out null values, sort by score
    const validMatches = matches.filter(Boolean).sort((a, b) => b!.matchScore - a!.matchScore)

    return NextResponse.json({
      success: true,
      matches: validMatches,
    })
  } catch (error) {
    console.error("Error generating matches:", error)
    return NextResponse.json({ error: "Failed to generate matches" }, { status: 500 })
  }
}

// Generate a human-readable reason for the match
function generateMatchReason(lostItem: Item, foundItem: Item, score: number): string {
  const reasons = []

  // Check category match
  if (lostItem.category && foundItem.category && lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
    reasons.push(`matching category (${lostItem.category})`)
  }

  // Check name match
  if (lostItem.name && foundItem.name) {
    const nameWords1 = lostItem.name
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
    const nameWords2 = foundItem.name
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
    const commonNameWords = nameWords1.filter((word) => nameWords2.includes(word))

    if (commonNameWords.length > 0) {
      reasons.push(`similar item name`)
    }
  }

  // Check date proximity
  if (lostItem.date && foundItem.date) {
    const lostDate = new Date(lostItem.date)
    const foundDate = new Date(foundItem.date)
    const daysDifference = Math.abs(Math.floor((lostDate.getTime() - foundDate.getTime()) / (1000 * 60 * 60 * 24)))

    if (daysDifference <= 7) {
      reasons.push(`reported within ${daysDifference} days of each other`)
    }
  }

  // Check location similarity
  if (lostItem.location && foundItem.location) {
    if (lostItem.location.toLowerCase() === foundItem.location.toLowerCase()) {
      reasons.push(`exact same location (${lostItem.location})`)
    } else {
      const loc1 = lostItem.location
        .toLowerCase()
        .replace(/road|street|ave|avenue|st|blvd|boulevard|building|bldg/g, "")
      const loc2 = foundItem.location
        .toLowerCase()
        .replace(/road|street|ave|avenue|st|blvd|boulevard|building|bldg/g, "")

      const words1 = loc1.split(/[,\s]+/).filter((w) => w.length > 3)
      const words2 = loc2.split(/[,\s]+/).filter((w) => w.length > 3)
      const commonWords = words1.filter((word) => words2.includes(word))

      if (commonWords.length > 0) {
        reasons.push(`similar location`)
      }
    }
  }

  // Check description similarity
  if (lostItem.description && foundItem.description) {
    const desc1 = lostItem.description.toLowerCase()
    const desc2 = foundItem.description.toLowerCase()

    const descWords1 = desc1.split(/\W+/).filter((w) => w.length > 3)
    const descWords2 = desc2.split(/\W+/).filter((w) => w.length > 3)
    const commonDescWords = descWords1.filter((word) => descWords2.includes(word))

    if (commonDescWords.length >= 2) {
      reasons.push(`similar item description`)
    }
  }

  const scorePercentage = Math.round(score * 100)

  if (reasons.length === 0) {
    return `Potential match with ${scorePercentage}% confidence.`
  }

  return `Potential match based on ${reasons.join(", ")} with ${scorePercentage}% confidence.`
}
