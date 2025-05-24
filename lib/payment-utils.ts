// Client-side utility functions for payment calculations

export function calculatePlatformFee(amount: number): number {
  // 10% platform fee
  return amount * 0.1
}

export function calculateTotalAmount(amount: number): number {
  return amount + calculatePlatformFee(amount)
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Generate a receipt number
export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `RCPT-${timestamp.substring(timestamp.length - 6)}-${random}`
}
