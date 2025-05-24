import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Validate required environment variables
const requiredEnvVars = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
}

// Check if all required environment variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase Admin environment variables: ${missingVars.join(", ")}\n` +
      "Please ensure the following environment variables are set:\n" +
      "- FIREBASE_PROJECT_ID\n" +
      "- FIREBASE_CLIENT_EMAIL\n" +
      "- FIREBASE_PRIVATE_KEY\n" +
      "- FIREBASE_DATABASE_URL",
  )
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: requiredEnvVars.projectId!,
    clientEmail: requiredEnvVars.clientEmail!,
    privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, "\n"),
  }),
  databaseURL: requiredEnvVars.databaseURL!,
}

// Initialize Firebase Admin
const apps = getApps()
const app = apps.length === 0 ? initializeApp(firebaseAdminConfig) : apps[0]

export const auth = getAuth(app)
export const adminDb = getFirestore(app)
