/**
 * Calculate text similarity between two strings
 * Returns a score between 0 and 1, where 1 is a perfect match
 */
export function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0

  // Convert to lowercase and remove punctuation
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim()
  }

  const normalizedText1 = normalize(text1)
  const normalizedText2 = normalize(text2)

  // Split into words
  const words1 = normalizedText1.split(/\s+/).filter(Boolean)
  const words2 = normalizedText2.split(/\s+/).filter(Boolean)

  if (words1.length === 0 || words2.length === 0) return 0

  // Count matching words
  const uniqueWords1 = new Set(words1)
  const uniqueWords2 = new Set(words2)

  let matchCount = 0
  for (const word of uniqueWords1) {
    if (uniqueWords2.has(word)) {
      matchCount++
    }
  }

  // Calculate Jaccard similarity coefficient
  const unionSize = uniqueWords1.size + uniqueWords2.size - matchCount
  return matchCount / unionSize
}
