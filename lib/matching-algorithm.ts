import type { Item } from "./database.types"
import { calculateSimilarity } from "./text-similarity"

// Scoring weights for different match criteria
const WEIGHTS = {
  CATEGORY: 0.3,
  DATE: 0.2,
  LOCATION: 0.25,
  DESCRIPTION: 0.25,
}


// Maximum number of days difference to consider for matching
const MAX_DATE_DIFF_DAYS = 30

// Maximum distance in kilometers to consider for matching
const MAX_DISTANCE_KM = 20

/**
 * Calculate match score between a lost and found item
 * Returns a score between 0 and 1, where 1 is a perfect match
 */
export function calculateMatchScore(lostItem: Item, foundItem: Item): number {
  // Category match (exact match only)
  const categoryScore = lostItem.category === foundItem.category ? 1 : 0

  // Date proximity score
  const lostDate = new Date(lostItem.date)
  const foundDate = new Date(foundItem.date)
  const dateDiffMs = Math.abs(lostDate.getTime() - foundDate.getTime())
  const dateDiffDays = dateDiffMs / (1000 * 60 * 60 * 24)
  const dateScore = Math.max(0, 1 - dateDiffDays / MAX_DATE_DIFF_DAYS)

  // Location proximity score (simplified - would be better with geocoding)
  // For now, we'll use a simple text comparison
  const locationScore = lostItem.location === foundItem.location ? 1 : 0.5

  // Description similarity score
  const descriptionScore = calculateSimilarity(lostItem.description || "", foundItem.description || "")

  // Calculate weighted score
  const weightedScore =
    categoryScore * WEIGHTS.CATEGORY +
    dateScore * WEIGHTS.DATE +
    locationScore * WEIGHTS.LOCATION +
    descriptionScore * WEIGHTS.DESCRIPTION

  return weightedScore
}

/**
 * Find potential matches for a given item
 * Returns an array of items sorted by match score
 */
export function findPotentialMatches(
  targetItem: Item,
  allItems: Item[],
  minScore = 0.6,
  maxResults = 5,
): { item: Item; score: number }[] {
  // Determine if we're matching a lost item with found items or vice versa
  const isLostItem = targetItem.type === "lost"
  const oppositeType = isLostItem ? "found" : "lost"

  // Filter items of the opposite type
  const potentialMatches = allItems.filter((item) => item.type === oppositeType && item.user_id !== targetItem.user_id)

  // Calculate match scores
  const scoredMatches = potentialMatches.map((item) => {
    const score = isLostItem ? calculateMatchScore(targetItem, item) : calculateMatchScore(item, targetItem)
    return { item, score }
  })

  // Filter by minimum score and sort by score (descending)
  return scoredMatches
    .filter((match) => match.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
}
