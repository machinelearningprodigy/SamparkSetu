import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { env, validateEnv } from "./env"

// Skip validation during build time
if (!env.IS_BUILD_TIME) {
  validateEnv()
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID || "build-placeholder",
    clientEmail: env.FIREBASE_CLIENT_EMAIL || "build@placeholder.com",
    privateKey: (
      env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nplaceholder\n-----END PRIVATE KEY-----\n"
    ).replace(/\\n/g, "\n"),
  }),
  databaseURL: env.FIREBASE_DATABASE_URL || "https://placeholder.firebaseio.com",
}

// Initialize Firebase Admin only if not in build time or if all env vars are present
let app: any = null
let auth: any = null
let adminDb: any = null

try {
  if (
    !env.IS_BUILD_TIME ||
    (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
  ) {
    const apps = getApps()
    app = apps.length === 0 ? initializeApp(firebaseAdminConfig) : apps[0]
    auth = getAuth(app)
    adminDb = getFirestore(app)
  }
} catch (error) {
  console.warn("Firebase Admin initialization skipped during build time")
}

export { auth, adminDb }
