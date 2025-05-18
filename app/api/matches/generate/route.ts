import { NextResponse } from "next/server"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { findMatchesWithGemini, generateMockMatches, generateFallbackMockMatches } from "@/lib/gemini-client"
import type { Item } from "@/lib/database.types"

/**
 * Helper function to log API errors and return a friendly message
 */
function handleApiError(error: any, context: string): string {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(`Error in ${context}:`, errorMessage)
  return `Failed to process request: ${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? "..." : ""}`
}

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
    const allItemsQuery = query(itemsRef, where("type", "==", oppositeType))
    const allItemsSnapshot = await getDocs(allItemsQuery)

    const allItems = allItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Item[]

    // Filter out items from the same user
    const potentialItems = allItems.filter((item) => item.user_id !== userId)

    let matches = []

    // If there are potential items, use Gemini to find matches
    if (potentialItems.length > 0) {
      try {
        const matchRequest = {
          targetItem: {
            id: targetItem.id,
            name: targetItem.name || targetItem.title || "Untitled Item",
            category: targetItem.category || "Uncategorized",
            description: targetItem.description,
            date: targetItem.date || new Date().toISOString().split("T")[0],
            location: targetItem.location || "Unknown",
            type: targetItem.type,
            images: targetItem.images,
          },
          potentialItems: potentialItems.map((item) => ({
            id: item.id,
            name: item.name || item.title || "Untitled Item",
            category: item.category || "Uncategorized",
            description: item.description,
            date: item.date || new Date().toISOString().split("T")[0],
            location: item.location || "Unknown",
            type: item.type,
            images: item.images,
            user_id: item.user_id,
          })),
        }

        matches = await findMatchesWithGemini(matchRequest)
      } catch (error) {
        console.error("Error using Gemini for matching:", error)
        // If Gemini fails, we'll continue and generate mock matches
      }
    }

    // If no matches found, generate mock matches
    if (matches.length === 0) {
      try {
        matches = await generateMockMatches({
          id: targetItem.id,
          name: targetItem.name || targetItem.title || "Untitled Item",
          category: targetItem.category || "Uncategorized",
          description: targetItem.description,
          date: targetItem.date || new Date().toISOString().split("T")[0],
          location: targetItem.location || "Unknown",
          type: targetItem.type,
        })
      } catch (error) {
        console.error("Error generating mock matches:", error)
        // If all else fails, use our fallback
        matches = generateFallbackMockMatches({
          id: targetItem.id,
          name: targetItem.name || targetItem.title || "Untitled Item",
          category: targetItem.category || "Uncategorized",
          description: targetItem.description,
          date: targetItem.date || new Date().toISOString().split("T")[0],
          location: targetItem.location || "Unknown",
          type: targetItem.type,
        })
      }
    }

    // Store real matches in the database (skip for mock matches)
    const matchPromises = matches
      .filter((match) => !match.id.startsWith("mock_"))
      .map(async (match) => {
        // Check if this match already exists
        const matchesRef = collection(db, "matches")
        const existingMatchQuery = query(
          matchesRef,
          where("lost_item_id", "==", targetItem.type === "lost" ? targetItem.id : match.id),
          where("found_item_id", "==", targetItem.type === "found" ? targetItem.id : match.id),
        )

        const existingMatchSnapshot = await getDocs(existingMatchQuery)

        if (existingMatchSnapshot.empty) {
          // Create a new match
          return addDoc(matchesRef, {
            lost_item_id: targetItem.type === "lost" ? targetItem.id : match.id,
            found_item_id: targetItem.type === "found" ? targetItem.id : match.id,
            match_score: match.matchScore / 100, // Convert to 0-1 scale
            match_reason: match.matchReason,
            status: "suggested",
            created_at: serverTimestamp(),
            created_by: "gemini",
          })
        }

        return null
      })

    await Promise.all(matchPromises)

    return NextResponse.json({
      success: true,
      matches: matches.map((match) => ({
        id: match.id,
        name: match.name,
        category: match.category,
        location: match.location,
        date: match.date,
        description: match.description,
        // Handle different score ranges - Gemini returns 0-100, our local algorithm returns 0-100
        score: match.matchScore > 1 ? match.matchScore / 100 : match.matchScore,
        reason: match.matchReason,
        isMock: match.id.startsWith("mock_"),
      })),
    })
  } catch (error) {
    console.error("Error generating matches:", error)
    return NextResponse.json({ error: "Failed to generate matches" }, { status: 500 })
  }
}
