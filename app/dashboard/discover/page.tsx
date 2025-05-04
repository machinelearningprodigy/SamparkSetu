"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Compass,
  Filter,
  HandshakeIcon,
  MapPin,
  MessageSquare,
  Search,
  Tag,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Item } from "@/lib/database.types"

export default function DiscoverPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Categories for filtering
  const categories = ["all", "electronics", "jewelry", "clothing", "accessories", "documents", "keys", "pets", "other"]

  useEffect(() => {
    fetchItems()
  }, [activeTab, categoryFilter, sortBy])

  const fetchItems = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setIsLoading(true)
      setItems([])
      setLastVisible(null)
    } else {
      setIsLoadingMore(true)
    }

    try {
      // Build query based on filters
      let itemsQuery: any = collection(db, "items")

      // Filter by type (lost/found/all)
      if (activeTab !== "all") {
        itemsQuery = query(itemsQuery, where("type", "==", activeTab))
      }

      // Filter by category
      if (categoryFilter !== "all") {
        itemsQuery = query(itemsQuery, where("category", "==", categoryFilter))
      }

      // Sort by date or location
      if (sortBy === "recent") {
        itemsQuery = query(itemsQuery, orderBy("created_at", "desc"))
      } else if (sortBy === "oldest") {
        itemsQuery = query(itemsQuery, orderBy("created_at", "asc"))
      }

      // Apply pagination
      itemsQuery = query(itemsQuery, limit(12))

      // If loading more, start after the last visible item
      if (isLoadMore && lastVisible) {
        itemsQuery = query(itemsQuery, startAfter(lastVisible))
      }

      const snapshot = await getDocs(itemsQuery)

      // Check if there are more items to load
      setHasMore(!snapshot.empty && snapshot.docs.length === 12)

      // Update last visible for pagination
      if (!snapshot.empty) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
      }

      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[]

      // Apply search filter client-side
      const filteredItems = searchQuery
        ? fetchedItems.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.location.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : fetchedItems

      if (isLoadMore) {
        setItems((prev) => [...prev, ...filteredItems])
      } else {
        setItems(filteredItems)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
      toast({
        title: "Error",
        description: "Failed to load items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchItems(true)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchItems()
  }

  // Replace the handleClaimItem function with this updated version that redirects to messages instead of chat
  const handleClaimItem = async (item: Item) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to claim this item",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (item.user_id === user.uid) {
      toast({
        title: "Cannot Claim Your Own Item",
        description: "You cannot claim an item you reported",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a match
      await addDoc(collection(db, "matches"), {
        lost_item_id: user.uid,
        found_item_id: item.id,
        status: "suggested",
        created_at: serverTimestamp(),
      })

      toast({
        title: "Claim Submitted",
        description: "Your claim has been submitted. You can now message the finder.",
      })

      // Navigate to messages with this item
      router.push(`/dashboard/messages?item=${item.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim item",
        variant: "destructive",
      })
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            <Compass className="h-8 w-8 text-blue-400" />
            Discover Items
          </h1>
          <p className="text-slate-400 mt-1">Browse lost and found items from across the platform</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-800"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="lost" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Lost</span>
            </TabsTrigger>
            <TabsTrigger value="found" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Found</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/50 border-slate-800">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/50 border-slate-800">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/70 backdrop-blur-lg border border-slate-800 rounded-lg overflow-hidden"
              >
                <div className="aspect-video bg-slate-800 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 bg-slate-800 animate-pulse rounded-md"></div>
                  <div className="h-4 w-1/2 bg-slate-800 animate-pulse rounded-md"></div>
                  <div className="h-4 w-full bg-slate-800 animate-pulse rounded-md"></div>
                  <div className="h-10 w-full bg-slate-800 animate-pulse rounded-md"></div>
                </div>
              </div>
            ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={item}>
                <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300 h-full flex flex-col">
                  <div className="relative aspect-video">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        {item.type === "lost" ? (
                          <AlertTriangle className="h-12 w-12 text-red-500/50" />
                        ) : (
                          <CheckCircle className="h-12 w-12 text-green-500/50" />
                        )}
                      </div>
                    )}
                    <div
                      className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
                        item.type === "lost" ? "bg-red-600 text-white" : "bg-green-600 text-white"
                      }`}
                    >
                      {item.type === "lost" ? "Lost" : "Found"}
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1">{item.name}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-300">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Tag className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="capitalize">{item.category}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                      {item.description || "No description provided"}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                        {item.status}
                      </Badge>
                      {item.condition && (
                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                          {item.condition}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  {/* Replace the CardFooter section in the items.map loop with this updated version
                  that changes the "Contact" button to "Message" and redirects to messages instead of chat */}
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => router.push(`/items/${item.id}`)}>
                      Details
                    </Button>
                    {item.type === "found" && (
                      <Button
                        className={`flex-1 ${
                          item.user_id === user?.uid
                            ? "bg-slate-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                        }`}
                        onClick={() => handleClaimItem(item)}
                        disabled={item.user_id === user?.uid}
                      >
                        <HandshakeIcon className="mr-2 h-4 w-4" />
                        Claim
                      </Button>
                    )}
                    {item.type === "lost" && (
                      <Button
                        className={`flex-1 ${
                          item.user_id === user?.uid
                            ? "bg-slate-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        }`}
                        onClick={() => router.push(`/dashboard/messages?item=${item.id}`)}
                        disabled={item.user_id === user?.uid}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore} className="min-w-[200px]">
                {isLoadingMore ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-slate-800/50 h-20 w-20 rounded-full flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No items found</h3>
          <p className="text-slate-400 max-w-md">
            {searchQuery
              ? `No items match your search for "${searchQuery}"`
              : activeTab === "all"
                ? "There are no items reported yet"
                : activeTab === "lost"
                  ? "No lost items have been reported yet"
                  : "No found items have been reported yet"}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                fetchItems()
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
