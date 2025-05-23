"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./components/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set isClient to true once component mounts
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only check authentication after component has mounted and auth state is loaded
    if (isClient && !isLoading && !user) {
      console.log("User not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [user, isLoading, router, isClient])

  // Show nothing during server-side rendering or initial load
  if (!isClient || isLoading) {
    return (
      <div className="flex min-h-screen bg-black">
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-pulse text-blue-500">Loading...</div>
        </div>
      </div>
    )
  }

  // If we're client-side and not loading and have no user, we'll redirect
  // But still render something in the meantime
  if (!user) {
    return (
      <div className="flex min-h-screen bg-black">
        <div className="flex-1 flex justify-center items-center">
          <div className="text-blue-500">Redirecting to login...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
    </div>
  )
}
