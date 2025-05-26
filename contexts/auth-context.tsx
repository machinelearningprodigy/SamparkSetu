"use client"
 
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser?.email)
      setUser(currentUser)

      // Only set loading to true if we need to check profile
      if (currentUser) {
        try {
          const profileRef = doc(db, "profiles", currentUser.uid)
          const profileSnap = await getDoc(profileRef)

          console.log("Profile exists:", profileSnap.exists())
          console.log("Profile data:", profileSnap.exists() ? profileSnap.data() : null)

          if (profileSnap.exists()) {
            const profileData = profileSnap.data()

            // Store onboarding status in localStorage for quick access
            if (profileData.onboarded === false) {
              console.log("User not onboarded, redirecting to onboarding")
              localStorage.setItem("needsOnboarding", "true")
              router.push("/onboarding")
            } else {
              console.log("User already onboarded")
              localStorage.setItem("needsOnboarding", "false")
            }
          } else {
            // If profile doesn't exist at all, create it and redirect to onboarding
            console.log("Creating new profile and redirecting to onboarding")
            await setDoc(profileRef, {
              id: currentUser.uid,
              username:
                currentUser.displayName?.split(" ")[0].toLowerCase() || `user_${currentUser.uid.substring(0, 5)}`,
              full_name: currentUser.displayName || "",
              email: currentUser.email || "",
              avatar_url: currentUser.photoURL || "",
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
              is_admin: false,
              onboarded: false,
            })
            localStorage.setItem("needsOnboarding", "true")
            router.push("/onboarding")
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error)
        }
      } else {
        // Clear onboarding status when user logs out
        localStorage.removeItem("needsOnboarding")
      }

      // Always set loading to false when we're done
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile with display name
      await updateProfile(user, {
        displayName: fullName,
      })

      console.log("User created, creating profile in Firestore")

      // Create user profile in Firestore
      const profileData = {
        id: user.uid,
        username,
        full_name: fullName,
        email,
        avatar_url: "",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        is_admin: false,
        onboarded: false, // Mark as not onboarded yet
      }

      await setDoc(doc(db, "profiles", user.uid), profileData)
      console.log("Profile created in Firestore, redirecting to onboarding")

      // Force redirect to onboarding page
      router.push("/onboarding")

      return user
    } catch (error) {
      console.error("Error in sign up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // The onAuthStateChanged listener will handle redirects if needed
    } catch (error) {
      console.error("Error in sign in:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      console.log("Google sign in successful:", user.email)

      // Check if user profile exists
      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)

      if (!profileSnap.exists()) {
        // Create new profile if it doesn't exist
        console.log("Creating new profile for Google user")
        const userProfile = {
          id: user.uid,
          username: user.displayName?.split(" ")[0].toLowerCase() || `user_${user.uid.substring(0, 5)}`,
          full_name: user.displayName || "",
          email: user.email || "",
          avatar_url: user.photoURL || "",
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          is_admin: false,
          onboarded: false, // Mark as not onboarded yet
        }

        await setDoc(profileRef, userProfile)
        console.log("Profile created, redirecting to onboarding")

        // Force redirect to onboarding
        router.push("/onboarding")
      } else if (!profileSnap.data().onboarded) {
        // If profile exists but not onboarded, redirect to onboarding
        console.log("User exists but not onboarded, redirecting to onboarding")
        router.push("/onboarding")
      }

      return user
    } catch (error) {
      console.error("Error in Google sign in:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
