"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/app/dashboard/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [unreadMatchCount, setUnreadMatchCount] = useState(0)

  useEffect(() => {
    if (!user) return

    // Set up real-time listener for matches
    const matchesQuery = query(collection(db, "matches"), where("status", "in", ["suggested", "pending"]))

    const unsubscribe = onSnapshot(matchesQuery, async (snapshot) => {
      try {
        let count = 0

        // Process each match document
        for (const docChange of snapshot.docChanges()) {
          const matchData = { id: docChange.doc.id, ...docChange.doc.data() }

          // Get the lost and found items to check if user is involved
          const [lostItemDoc, foundItemDoc] = await Promise.all([
            getDocs(query(collection(db, "items"), where("__name__", "==", matchData.lost_item_id))),
            getDocs(query(collection(db, "items"), where("__name__", "==", matchData.found_item_id))),
          ])

          if (lostItemDoc.empty || foundItemDoc.empty) continue

          const lostItem = { id: lostItemDoc.docs[0].id, ...lostItemDoc.docs[0].data() }
          const foundItem = { id: foundItemDoc.docs[0].id, ...foundItemDoc.docs[0].data() }

          // Determine if this match involves the current user
          const isUserInvolved = lostItem.user_id === user.uid || foundItem.user_id === user.uid

          if (isUserInvolved) {
            count++
          }
        }

        setUnreadMatchCount(count)
      } catch (error) {
        console.error("Error counting matches:", error)
      }
    })

    return () => unsubscribe()
  }, [user])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="hidden md:block">
          <div className="border-b border-slate-800">
            <div className="flex h-16 items-center px-4">
              <div className="ml-auto flex items-center space-x-4">
                <Link href="/dashboard/matches">
                  <Button variant="ghost" size="sm" className="relative">
                    Matches
                    {unreadMatchCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs">
                        {unreadMatchCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </ScrollArea>
      </div>
    </div>
  )
}
