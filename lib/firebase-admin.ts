import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
 
// Check if we're in build time
const isBuildTime = process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV


// Default exports for build time
let auth: any = null
let adminDb: any = null

// Only initialize Firebase Admin if not in build time and env vars are available
if (!isBuildTime && process.env.FIREBASE_PROJECT_ID) {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    }

    // Initialize Firebase Admin
    const apps = getApps()
    const app = apps.length === 0 ? initializeApp(firebaseAdminConfig) : apps[0]

    auth = getAuth(app)
    adminDb = getFirestore(app)
  } catch (error) {
    console.warn("Firebase Admin initialization failed:", error)
  }
}

export { auth, adminDb }
