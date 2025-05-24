// Environment variable validation and defaults
export const env = {
  // Firebase Admin
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "",
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || "",

  // Cashfree
  CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID || "",
  CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET || "",

  // App
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Build time check
  IS_BUILD_TIME: process.env.NODE_ENV === "production" && !process.env.VERCEL,
}

export function validateEnv() {
  const requiredVars = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY", "FIREBASE_DATABASE_URL"]

  const missing = requiredVars.filter((key) => !env[key as keyof typeof env])

  if (missing.length > 0 && !env.IS_BUILD_TIME) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  return true
}
