// Client-side utility functions for payment calculations

export function calculatePlatformFee(amount: number): number {
  // 10% platform fee
  return amount * 0.1
}

export function calculateTotalAmount(amount: number): number {
  return amount + calculatePlatformFee(amount)
}
