"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, MapPin, Tag, RefreshCw, Check, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

interface Item {
  id: string
  name?: string
  title?: string
  category?: string
  location?: string
  date?: string
  description?: string
  images?: string[]
  type: "lost" | "found"
  user_id: string
}

interface Match {
  id: string
  name: string
  category: string
  location: string
  date: string
  description?: string
  score: number
  reason: string
  isMock: boolean
}

export default function ItemMatcherPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [lostItems, setLostItems] = useState<Item[]>([])
  const [foundItems, setFoundItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("lost")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchItems = async () => {
      try {
        setLoading(true)
        const itemsRef = collection(db, "items")

        // Fetch lost items
        const lostQuery = query(itemsRef, where("user_id", "==", user.uid), where("type", "==", "lost"))
        const lostSnapshot = await getDocs(lostQuery)
        const lostData = lostSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]

        // Fetch found items
        const foundQuery = query(itemsRef, where("user_id", "==", user.uid), where("type", "==", "found"))
        const foundSnapshot = await getDocs(foundQuery)
        const foundData = foundSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]

        setLostItems(lostData)
        setFoundItems(foundData)
      } catch (error) {
        console.error("Error fetching items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [user, router])

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item)
    setMatches([])
  }

  const generateMatches = async () => {
    if (!selectedItem || !user) return

    try {
      setMatchLoading(true)

      const response = await fetch("/api/matches/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: selectedItem.id,
          userId: user.uid,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMatches(data.matches)
      } else {
        console.error("Error generating matches:", data.error)
      }
    } catch (error) {
      console.error("Error generating matches:", error)
    } finally {
      setMatchLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500"
    if (score >= 0.6) return "bg-yellow-500"
    return "bg-orange-500"
  }

  const getItemName = (item: Item) => {
    return item.name || item.title || "Untitled Item"
  }

  const getItemImage = (item: Item) => {
    if (item.images && item.images.length > 0) {
      return item.images[0]
    }

    // Generate placeholder based on category
    const category = item.category || "item"
    return `/placeholder.svg?height=400&width=400&query=${category}`
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Item Matcher</h1>
        <p className="text-muted-foreground">Find potential matches for your lost or found items</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="lost" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Your Lost Items</span>
            <Badge variant="secondary" className="ml-2">
              {lostItems.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="found" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Your Found Items</span>
            <Badge variant="secondary" className="ml-2">
              {foundItems.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lost" className="space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lostItems.map((item) => (
                <Card
                  key={item.id}
                  className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedItem?.id === item.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={getItemImage(item) || "/placeholder.svg"}
                      alt={getItemName(item)}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">Lost</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg truncate">{getItemName(item)}</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{item.date || "No date"}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{item.location || "No location"}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Tag className="h-4 w-4 mr-2" />
                        <span>{item.category || "Other"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {lostItems.length === 0 && (
                <div className="col-span-full text-center p-8 border rounded-lg bg-muted/50">
                  <p>You haven't reported any lost items yet.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="found" className="space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {foundItems.map((item) => (
                <Card
                  key={item.id}
                  className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedItem?.id === item.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={getItemImage(item) || "/placeholder.svg"}
                      alt={getItemName(item)}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">Found</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg truncate">{getItemName(item)}</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{item.date || "No date"}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{item.location || "No location"}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Tag className="h-4 w-4 mr-2" />
                        <span>{item.category || "Other"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {foundItems.length === 0 && (
                <div className="col-span-full text-center p-8 border rounded-lg bg-muted/50">
                  <p>You haven't reported any found items yet.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedItem && (
        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                Selected Item: <span className="text-primary">{getItemName(selectedItem)}</span>
              </h2>
              <p className="text-muted-foreground">Find potential matches for this {selectedItem.type} item</p>
            </div>
            <Button
              onClick={generateMatches}
              disabled={matchLoading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {matchLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Matches
                </>
              )}
            </Button>
          </div>

          {matchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Potential Matches</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <Card key={match.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={`/abstract-geometric-shapes.png?height=400&width=400&query=${match.category}`}
                        alt={match.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                        <h3 className="font-bold text-xl text-white">{match.name}</h3>
                        <div className="flex items-center mt-2">
                          <Badge
                            className={`${
                              selectedItem.type === "lost"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            {selectedItem.type === "lost" ? "Found" : "Lost"}
                          </Badge>
                          {match.isMock && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="ml-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20"
                                  >
                                    AI Generated
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>This is an AI-generated potential match based on your item details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-white rounded-full p-1 shadow-md">
                                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600">
                                  {Math.round(match.score * 100)}%
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Match confidence score</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{match.date}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{match.location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{match.category}</span>
                        </div>
                        <div className="pt-2">
                          <p className="text-sm font-medium">Match Reason:</p>
                          <p className="text-sm text-muted-foreground mt-1">{match.reason}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <p>Click "Generate Matches" to find potential matches for your selected item.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
