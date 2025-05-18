"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, HandshakeIcon, Search, PlusCircle, ArrowRight } from "lucide-react"
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    lostItems: 0,
    foundItems: 0,
    matches: 0,
  })
  const [recentItems, setRecentItems] = useState<any[]>([])

  useEffect(() => {
    // Check if user needs onboarding
    const needsOnboarding = localStorage.getItem("needsOnboarding") === "true"

    if (user && needsOnboarding) {
      console.log("User needs onboarding, redirecting from dashboard")
      router.push("/onboarding")
      return
    }

    // If we get here, user is authenticated and has completed onboarding
    // or the onboarding status hasn't been determined yet
    if (user) {
      const checkOnboardingStatus = async () => {
        try {
          const profileRef = doc(db, "profiles", user.uid)
          const profileSnap = await getDoc(profileRef)

          if (profileSnap.exists()) {
            const profileData = profileSnap.data()
            if (profileData.onboarded === false) {
              console.log("Double-checking: User not onboarded, redirecting from dashboard")
              localStorage.setItem("needsOnboarding", "true")
              router.push("/onboarding")
            }
          }
        } catch (error) {
          console.error("Error checking onboarding status in dashboard:", error)
        }
      }

      checkOnboardingStatus()
    }
  }, [user, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Fetch lost items count
        const lostQuery = query(collection(db, "items"), where("user_id", "==", user.uid), where("type", "==", "lost"))
        const lostSnapshot = await getDocs(lostQuery)

        // Fetch found items count
        const foundQuery = query(
          collection(db, "items"),
          where("user_id", "==", user.uid),
          where("type", "==", "found"),
        )
        const foundSnapshot = await getDocs(foundQuery)

        // Fetch matches count (items with status "matched")
        const matchesQuery = query(
          collection(db, "items"),
          where("user_id", "==", user.uid),
          where("status", "==", "matched"),
        )
        const matchesSnapshot = await getDocs(matchesQuery)

        // Fetch recent items
        const recentQuery = query(
          collection(db, "items"),
          where("user_id", "==", user.uid),
          orderBy("created_at", "desc"),
          limit(5),
        )
        const recentSnapshot = await getDocs(recentQuery)
        const recentItemsData = recentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setStats({
          lostItems: lostSnapshot.size,
          foundItems: foundSnapshot.size,
          matches: matchesSnapshot.size,
        })

        setRecentItems(recentItemsData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.displayName || "User"}</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => router.push("/report/lost")} className="bg-red-600 hover:bg-red-700 text-white">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report Lost
          </Button>
          <Button onClick={() => router.push("/report/found")} className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="mr-2 h-4 w-4" />
            Report Found
          </Button>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Lost Items Card */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-red-900/10 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center text-red-400">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Lost Items
              </CardTitle>
              <CardDescription>Items you've reported as lost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {isLoading ? <div className="h-10 w-16 bg-slate-800 animate-pulse rounded"></div> : stats.lostItems}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="link"
                className="text-red-400 p-0 hover:text-red-300"
                onClick={() => router.push("/dashboard/lost")}
              >
                View all lost items
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Found Items Card */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-green-900/10 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-green-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center text-green-400">
                <CheckCircle className="mr-2 h-5 w-5" />
                Found Items
              </CardTitle>
              <CardDescription>Items you've reported as found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {isLoading ? <div className="h-10 w-16 bg-slate-800 animate-pulse rounded"></div> : stats.foundItems}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="link"
                className="text-green-400 p-0 hover:text-green-300"
                onClick={() => router.push("/dashboard/found")}
              >
                View all found items
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Successful Matches Card */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center text-blue-400">
                <HandshakeIcon className="mr-2 h-5 w-5" />
                Successful Matches
              </CardTitle>
              <CardDescription>Items successfully matched and returned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {isLoading ? <div className="h-10 w-16 bg-slate-800 animate-pulse rounded"></div> : stats.matches}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="link"
                className="text-blue-400 p-0 hover:text-blue-300"
                onClick={() => router.push("/dashboard/matches")}
              >
                View all matches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={item}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Clock className="mr-2 h-5 w-5 text-purple-400" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recently reported items</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-800 animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-800 animate-pulse rounded w-3/4"></div>
                      <div className="h-3 bg-slate-800 animate-pulse rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentItems.length > 0 ? (
              <div className="space-y-4">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        item.type === "lost" ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"
                      }`}
                    >
                      {item.type === "lost" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{item.name || item.title || "Untitled Item"}</div>
                      <div className="text-sm text-slate-400">
                        {item.type === "lost" ? "Lost" : "Found"} • {item.location || "Unknown location"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      onClick={() => router.push(`/items/${item.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="bg-slate-800/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white">No items reported yet</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  You haven't reported any lost or found items yet. Start by reporting an item you've lost or found.
                </p>
                <div className="flex gap-3 justify-center mt-4">
                  <Button
                    onClick={() => router.push("/report/lost")}
                    variant="outline"
                    className="border-red-800 text-red-400 hover:bg-red-900/20"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Report Lost Item
                  </Button>
                  <Button
                    onClick={() => router.push("/report/found")}
                    variant="outline"
                    className="border-green-800 text-green-400 hover:bg-green-900/20"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Report Found Item
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
