/**
 * Calculate distance between two locations
 * This is a simplified version that assumes locations are formatted as strings
 * In a real implementation, you would use geocoding and proper distance calculation
 */
export function calculateLocationDistance(location1: string, location2: string): number {
  // This is a placeholder implementation
  // In a real app, you would use geocoding to convert locations to coordinates
  // and then calculate the actual distance

  // For now, we'll return a simple match/no match score
  return location1.toLowerCase() === location2.toLowerCase() ? 0 : 10
}
