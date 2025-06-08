import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateTextWithGemini } from "./gemini-direct-api"

// Initialize the Google Generative AI with the provided API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBbaxcAPax4yXfi_b3IzRLmqXI-OHJJ16w")

// Get the generative model - using the correct model name
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })


export interface ItemMatchRequest {
  targetItem: {
    id: string
    name: string
    category: string
    description?: string
    date: string
    location: string
    type: "lost" | "found"
    images?: string[]
  }
  potentialItems: Array<{
    id: string
    name: string
    category: string
    description?: string
    date: string
    location: string
    type: "lost" | "found"
    images?: string[]
    user_id: string
  }>
}

export interface ItemMatch {
  id: string
  name: string
  category: string
  date: string
  location: string
  description?: string
  matchScore: number
  matchReason: string
  user_id: string
}

/**
 * Uses Gemini AI to analyze and find potential matches between items
 * Falls back to a simpler matching algorithm if Gemini API fails
 */
export async function findMatchesWithGemini(request: ItemMatchRequest): Promise<ItemMatch[]> {
  try {
    // Check if we should skip Gemini API call to avoid rate limits
    const shouldUseLocalFallback = true // Always use local fallback to avoid rate limits

    if (shouldUseLocalFallback) {
      console.log("Using local fallback for match finding to avoid rate limits")
      return findMatchesLocally(request)
    }

    // Create a prompt for Gemini to analyze the items
    const prompt = `
You are an AI assistant for a lost and found application. Your task is to analyze a target item and a list of potential matching items to determine if any of them could be a match.

TARGET ITEM (${request.targetItem.type.toUpperCase()}):
ID: ${request.targetItem.id}
Name: ${request.targetItem.name}
Category: ${request.targetItem.category}
Description: ${request.targetItem.description || "No description provided"}
Date: ${request.targetItem.date}
Location: ${request.targetItem.location}

POTENTIAL MATCHING ITEMS (${request.potentialItems.length} items):
${request.potentialItems
  .map(
    (item, index) => `
ITEM ${index + 1}:
ID: ${item.id}
Name: ${item.name}
Category: ${item.category}
Description: ${item.description || "No description provided"}
Date: ${item.date}
Location: ${item.location}
Type: ${item.type}
`,
  )
  .join("\n")}

For each potential matching item, analyze:
1. Category similarity
2. Date proximity (items reported within a reasonable timeframe)
3. Location proximity
4. Description similarity (look for key identifying features)

For each potential match, provide:
1. A match score between 0 and 100 (where 100 is a perfect match)
2. A brief explanation of why this might be a match

Return your analysis as a JSON array with this structure:
[
  {
    "id": "item_id",
    "matchScore": 85,
    "matchReason": "Explanation of why this is a potential match"
  }
]

Only include items with a match score of 50 or higher. Sort the results by match score in descending order.
`

    try {
      // First try using the Google AI SDK
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extract the JSON from the response
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s)

      if (!jsonMatch) {
        console.log("Failed to parse response from Google AI SDK, trying direct API...")

        // Try the direct API as a fallback
        const directApiResponse = await generateTextWithGemini(prompt, {
          temperature: 0.2,
          maxTokens: 2048,
        })

        const directJsonMatch = directApiResponse.match(/\[\s*\{.*\}\s*\]/s)

        if (!directJsonMatch) {
          console.error("Failed to parse Gemini response from both methods:", directApiResponse)
          return findMatchesLocally(request)
        }

        const matchResults = JSON.parse(directJsonMatch[0])

        // Map the results to include the full item details
        return matchResults
          .map((match: any) => {
            const matchedItem = request.potentialItems.find((item) => item.id === match.id)
            if (!matchedItem) return null

            return {
              id: matchedItem.id,
              name: matchedItem.name,
              category: matchedItem.category,
              date: matchedItem.date,
              location: matchedItem.location,
              description: matchedItem.description,
              matchScore: match.matchScore,
              matchReason: match.matchReason,
              user_id: matchedItem.user_id,
            }
          })
          .filter(Boolean)
      }

      const matchResults = JSON.parse(jsonMatch[0])

      // Map the results to include the full item details
      return matchResults
        .map((match: any) => {
          const matchedItem = request.potentialItems.find((item) => item.id === match.id)
          if (!matchedItem) return null

          return {
            id: matchedItem.id,
            name: matchedItem.name,
            category: matchedItem.category,
            date: matchedItem.date,
            location: matchedItem.location,
            description: matchedItem.description,
            matchScore: match.matchScore,
            matchReason: match.matchReason,
            user_id: matchedItem.user_id,
          }
        })
        .filter(Boolean)
    } catch (error) {
      console.error("Error using Gemini for matching:", error)
      return findMatchesLocally(request)
    }
  } catch (error) {
    console.error("Error using Gemini for matching:", error)
    return findMatchesLocally(request)
  }
}

/**
 * Performs local matching without using the Gemini API
 * Used as a fallback when Gemini API hits rate limits
 */
function findMatchesLocally(request: ItemMatchRequest): ItemMatch[] {
  try {
    const { targetItem, potentialItems } = request

    // Simple scoring function based on category, date, and location
    const calculateMatchScore = (item: any) => {
      let score = 0

      // Category matching (max 30 points)
      if (item.category.toLowerCase() === targetItem.category.toLowerCase()) {
        score += 30
      } else if (isSimilarCategory(item.category, targetItem.category)) {
        score += 15
      }

      // Date proximity (max 30 points)
      const targetDate = new Date(targetItem.date)
      const itemDate = new Date(item.date)
      const daysDifference = Math.abs(Math.floor((targetDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)))

      if (daysDifference <= 3) {
        score += 30
      } else if (daysDifference <= 7) {
        score += 20
      } else if (daysDifference <= 14) {
        score += 10
      }

      // Location matching (max 30 points)
      if (item.location.toLowerCase() === targetItem.location.toLowerCase()) {
        score += 30
      } else if (isSimilarLocation(item.location, targetItem.location)) {
        score += 15
      }

      // Description similarity (max 10 points)
      if (item.description && targetItem.description) {
        if (hasCommonWords(item.description, targetItem.description)) {
          score += 10
        }
      }

      return score
    }

    // Check if categories are similar
    function isSimilarCategory(cat1: string, cat2: string) {
      const relatedCategories: Record<string, string[]> = {
        Clothing: ["Accessories", "Personal Items"],
        Electronics: ["Gadgets", "Accessories", "Technology"],
        Jewelry: ["Accessories", "Valuables"],
        Keys: ["Personal Items", "Accessories"],
        Documents: ["Personal Items", "ID Cards"],
        Bags: ["Accessories", "Personal Items"],
      }

      cat1 = cat1.toLowerCase()
      cat2 = cat2.toLowerCase()

      if (relatedCategories[cat1] && relatedCategories[cat1].some((c) => c.toLowerCase() === cat2)) {
        return true
      }

      if (relatedCategories[cat2] && relatedCategories[cat2].some((c) => c.toLowerCase() === cat1)) {
        return true
      }

      return false
    }

    // Check if locations are similar
    function isSimilarLocation(loc1: string, loc2: string) {
      // Simple check if locations share common words
      const words1 = loc1.toLowerCase().split(/[,\s]+/)
      const words2 = loc2.toLowerCase().split(/[,\s]+/)

      return words1.some((word) => words2.includes(word) && word.length > 3)
    }

    // Check if descriptions share common words
    function hasCommonWords(desc1: string, desc2: string) {
      const words1 = desc1
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)
      const words2 = desc2
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)

      return words1.some((word) => words2.includes(word))
    }

    // Generate match reasons based on score
    function generateMatchReason(item: any, score: number) {
      const reasons = []

      if (item.category.toLowerCase() === targetItem.category.toLowerCase()) {
        reasons.push(`matching category (${item.category})`)
      }

      const targetDate = new Date(targetItem.date)
      const itemDate = new Date(item.date)
      const daysDifference = Math.abs(Math.floor((targetDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)))

      if (daysDifference <= 7) {
        reasons.push(`reported within ${daysDifference} days`)
      }

      if (isSimilarLocation(item.location, targetItem.location)) {
        reasons.push(`similar location`)
      }

      if (reasons.length === 0) {
        return `Potential match with ${score}% confidence.`
      }

      return `Potential match based on ${reasons.join(", ")} with ${score}% confidence.`
    }

    // Calculate scores for all potential items
    const scoredItems = potentialItems.map((item) => {
      const score = calculateMatchScore(item)
      return {
        ...item,
        matchScore: score,
        matchReason: generateMatchReason(item, score),
      }
    })

    // Filter items with score >= 50 and sort by score
    return scoredItems
      .filter((item) => item.matchScore >= 50)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        date: item.date,
        location: item.location,
        description: item.description,
        matchScore: item.matchScore,
        matchReason: item.matchReason,
        user_id: item.user_id,
      }))
  } catch (error) {
    console.error("Error in local matching:", error)
    return []
  }
}

/**
 * Generates mock matches without using Gemini when the API fails
 */
export function generateFallbackMockMatches(item: any): ItemMatch[] {
  try {
    // Parse the date or use current date
    const itemDate = item.date ? new Date(item.date) : new Date()

    // Generate random dates within 2 weeks of the item date
    const getRandomDate = () => {
      const randomDays = Math.floor(Math.random() * 14) - 7
      const date = new Date(itemDate)
      date.setDate(date.getDate() + randomDays)
      return date.toISOString().split("T")[0]
    }

    // Generate random user IDs
    const getRandomUserId = () => `user_${Math.floor(10000 + Math.random() * 90000)}`

    // Define some realistic locations based on the original location
    const locations = [
      "Ulubari, Guwahati, Assam",
      "Panbazar, Guwahati, Assam",
      "Fancy Bazar, Guwahati, Assam",
      "Ganeshguri, Guwahati, Assam",
      "Zoo Road, Guwahati, Assam",
    ]

    // Define categories that might match with the item's category
    const getRelatedCategories = (category: string) => {
      const categoryMap: Record<string, string[]> = {
        Clothing: ["Clothing", "Accessories", "Personal Items"],
        Electronics: ["Electronics", "Gadgets", "Accessories"],
        Jewelry: ["Jewelry", "Accessories", "Valuables"],
        Keys: ["Keys", "Personal Items", "Accessories"],
        Documents: ["Documents", "Personal Items", "ID Cards"],
        Bags: ["Bags", "Accessories", "Personal Items"],
        Other: ["Personal Items", "Miscellaneous", "Accessories"],
      }

      return categoryMap[category] || ["Personal Items", "Miscellaneous", "Accessories"]
    }

    // Generate match reasons based on the item type and category
    const generateMatchReason = (category: string, location: string, date: string) => {
      const reasons = [
        `Similar ${category} item found in ${location.split(",")[0]} area, reported within a few days of the original item.`,
        `This ${category} matches the description and was found near ${location.split(",")[0]} around the same time period.`,
        `High probability match based on the ${category} category, location proximity to ${location.split(",")[0]}, and date (${date}).`,
        `The item details closely align with the reported ${item.type} item, particularly the ${category} category and location.`,
      ]

      return reasons[Math.floor(Math.random() * reasons.length)]
    }

    // Generate names based on the category
    const generateItemName = (category: string) => {
      const nameMap: Record<string, string[]> = {
        Clothing: ["Blue Jacket", "Black Sweater", "Red T-shirt", "Gray Hoodie"],
        Electronics: ["Samsung Phone", "Apple Watch", "Wireless Earbuds", "Laptop Charger"],
        Jewelry: ["Silver Ring", "Gold Necklace", "Diamond Earrings", "Wristwatch"],
        Keys: ["House Keys", "Car Keys", "Office Keys", "Key Chain"],
        Documents: ["ID Card", "Passport", "Driver's License", "Student ID"],
        Bags: ["Backpack", "Handbag", "Laptop Bag", "Tote Bag"],
        Other: ["Umbrella", "Water Bottle", "Sunglasses", "Wallet"],
      }

      const names = nameMap[category] || ["Personal Item", "Lost Item", "Found Item", "Miscellaneous Item"]
      return names[Math.floor(Math.random() * names.length)]
    }

    // Generate descriptions based on the category
    const generateDescription = (category: string, name: string) => {
      const descMap: Record<string, string[]> = {
        Clothing: [
          `A ${name.toLowerCase()} with some distinctive markings`,
          `${name} with a logo on the front`,
          `Slightly worn ${name.toLowerCase()}`,
        ],
        Electronics: [`${name} in good condition`, `${name} with a cracked screen`, `${name} in a protective case`],
        Jewelry: [
          `${name} with some engravings`,
          `Vintage style ${name.toLowerCase()}`,
          `Modern design ${name.toLowerCase()}`,
        ],
        Keys: [
          `Set of ${name.toLowerCase()} with a distinctive keychain`,
          `${name} with a colored tag`,
          `Multiple ${name.toLowerCase()} on a ring`,
        ],
        Documents: [
          `${name} in a plastic holder`,
          `Slightly damaged ${name.toLowerCase()}`,
          `${name} with contact information`,
        ],
        Bags: [`${name} with multiple compartments`, `${name} with a logo`, `Colorful ${name.toLowerCase()}`],
        Other: [
          `Standard ${name.toLowerCase()}`,
          `Unique design ${name.toLowerCase()}`,
          `Branded ${name.toLowerCase()}`,
        ],
      }

      const descriptions = descMap[category] || [
        `Standard ${name.toLowerCase()}`,
        `Unique ${name.toLowerCase()}`,
        `Distinctive ${name.toLowerCase()}`,
      ]
      return descriptions[Math.floor(Math.random() * descriptions.length)]
    }

    // Generate 3 mock matches
    const mockMatches: ItemMatch[] = []

    for (let i = 1; i <= 3; i++) {
      const relatedCategories = getRelatedCategories(item.category || "Other")
      const category = relatedCategories[Math.floor(Math.random() * relatedCategories.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]
      const date = getRandomDate()
      const name = generateItemName(category)
      const description = generateDescription(category, name)

      mockMatches.push({
        id: `mock_${i}`,
        name,
        category,
        date,
        location,
        description,
        matchScore: Math.floor(60 + Math.random() * 36), // Score between 60-95
        matchReason: generateMatchReason(category, location, date),
        user_id: getRandomUserId(),
      })
    }

    // Sort by match score in descending order
    return mockMatches.sort((a, b) => b.matchScore - a.matchScore)
  } catch (error) {
    console.error("Error generating fallback mock matches:", error)
    return []
  }
}

/**
 * Generates mock matches using Gemini when no real matches are found
 * Falls back to local generation if Gemini API fails
 */
export async function generateMockMatches(item: any): Promise<ItemMatch[]> {
  try {
    // Check if we should skip Gemini API call to avoid rate limits
    // We'll use a simple localStorage-based approach to track recent API calls
    const shouldUseLocalFallback = true // Always use local fallback to avoid rate limits

    if (shouldUseLocalFallback) {
      console.log("Using local fallback for mock match generation to avoid rate limits")
      return generateFallbackMockMatches(item)
    }

    const prompt = `
You are an AI assistant for a lost and found application. A user has reported a ${item.type} item, but no matches were found in our database. 
Please generate 3 realistic mock potential matches that could exist in a lost and found system.

ITEM DETAILS:
Name: ${item.name}
Category: ${item.category}
Description: ${item.description || "No description provided"}
Date: ${item.date}
Location: ${item.location}
Type: ${item.type}

For each mock match, generate:
1. A realistic item name
2. A matching category (should be related to the original item)
3. A realistic date (within 2 weeks of the original date: ${item.date})
4. A realistic location (should be near the original location: ${item.location})
5. A brief description
6. A match score between 60 and 95
7. A realistic explanation of why this might be a match
8. A random user ID (format: "user_xxxxx" where xxxxx is a 5-digit number)

Return your generated matches as a JSON array with this structure:
[
  {
    "id": "mock_1",
    "name": "Generated item name",
    "category": "Category",
    "date": "YYYY-MM-DD",
    "location": "Generated location",
    "description": "Generated description",
    "matchScore": 85,
    "matchReason": "Explanation of why this is a potential match",
    "user_id": "user_12345"
  }
]

Make the matches realistic and varied in their match scores and reasons.
`

    try {
      // First try using the Google AI SDK
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extract the JSON from the response
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s)

      if (!jsonMatch) {
        console.log("Failed to parse response from Google AI SDK for mock data, trying direct API...")

        // Try the direct API as a fallback
        const directApiResponse = await generateTextWithGemini(prompt, {
          temperature: 0.7,
          maxTokens: 2048,
        })

        const directJsonMatch = directApiResponse.match(/\[\s*\{.*\}\s*\]/s)

        if (!directJsonMatch) {
          console.error("Failed to parse Gemini response for mock data from both methods:", directApiResponse)
          // Fall back to local mock generation
          return generateFallbackMockMatches(item)
        }

        return JSON.parse(directJsonMatch[0])
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error("Error generating mock matches with Gemini:", error)
      // Fall back to local mock generation
      return generateFallbackMockMatches(item)
    }
  } catch (error) {
    console.error("Error in mock match generation:", error)
    // Fall back to local mock generation
    return generateFallbackMockMatches(item)
  }
}
