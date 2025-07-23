import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"



const firebaseConfig = {
  apiKey: "AIzaSyDGUFn1AnhHfJQ5Ng3kpdU6jla-ScDv0jo",
  authDomain: "samparksetu-8fb80.firebaseapp.com",
  projectId: "samparksetu-8fb80",
  storageBucket: "samparksetu-8fb80.firebasestorage.app",
  messagingSenderId: "273139918865",
  appId: "1:273139918865:web:aa27377f2259a1caa569b0",
  measurementId: "G-EWWG5Q4BN9",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
