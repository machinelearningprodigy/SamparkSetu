"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Tag,
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { doc, getDoc, collection, query, where, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
// Import the PaymentModal component
import { PaymentModal } from "@/components/payment-modal"

export default function ItemDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [item, setItem] = useState<any>(null)
  const [owner, setOwner] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([])
  // Add state for payment modal inside the component
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) return

      try {
        setIsLoading(true)

        // Fetch item details
        const itemRef = doc(db, "items", id as string)
        const itemSnapshot = await getDoc(itemRef)

        if (!itemSnapshot.exists()) {
          throw new Error("Item not found")
        }

        const itemData = {
          id: itemSnapshot.id,
          ...itemSnapshot.data(),
        }

        setItem(itemData)

        // Fetch owner details
        if (itemData.user_id) {
          const ownerRef = doc(db, "profiles", itemData.user_id)
          const ownerSnapshot = await getDoc(ownerRef)

          if (ownerSnapshot.exists()) {
            setOwner({
              id: ownerSnapshot.id,
              ...ownerSnapshot.data(),
            })
          }
        }

        // Fetch suggested matches
        let matchesQuery
        if (itemData.type === "lost") {
          matchesQuery = query(
            collection(db, "items"),
            where("type", "==", "found"),
            where("category", "==", itemData.category),
            limit(3),
          )
        } else {
          matchesQuery = query(
            collection(db, "items"),
            where("type", "==", "lost"),
            where("category", "==", itemData.category),
            limit(3),
          )
        }

        const matchesSnapshot = await getDocs(matchesQuery)
        const matchesData = matchesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((match) => match.user_id !== itemData.user_id)

        setSuggestedMatches(matchesData)
      } catch (error) {
        console.error("Error fetching item details:", error)
        toast({
          title: "Error",
          description: "Failed to load item details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchItemDetails()
  }, [id, toast])

  // Add a function to handle payment completion
  const handlePaymentComplete = async () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully. You can now proceed with the item exchange.",
    })

    // Refresh item data
    const itemRef = doc(db, "items", id as string)
    const itemSnapshot = await getDoc(itemRef)

    if (itemSnapshot.exists()) {
      setItem({
        id: itemSnapshot.id,
        ...itemSnapshot.data(),
      })
    }
  }

  // Modify the handleContactOwner function to open payment modal for found items
  const handleContactOwner = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the owner",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // For found items that require payment, open payment modal
    if (item.type === "found" && item.requires_payment) {
      setIsPaymentModalOpen(true)
    } else {
      // Create or navigate to chat
      router.push(`/dashboard/chat?item=${id}`)
    }
  }

  // Modify the handleClaimItem function to open payment modal
  const handleClaimItem = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to claim this item",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // For items that require payment, open payment modal
    if (item.requires_payment) {
      setIsPaymentModalOpen(true)
    } else {
      try {
        // Create a match
        await addDoc(collection(db, "matches"), {
          lost_item_id: user.uid,
          found_item_id: id,
          status: "suggested",
          created_at: serverTimestamp(),
        })

        toast({
          title: "Claim Submitted",
          description: "Your claim has been submitted. The finder will be notified.",
        })

        // Navigate to chat
        router.push(`/dashboard/chat?item=${id}`)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to claim item",
          variant: "destructive",
        })
      }
    }
  }

  const nextImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex === item.images.length - 1 ? 0 : prevIndex + 1))
    }
  }

  const prevImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? item.images.length - 1 : prevIndex - 1))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
            <p className="text-slate-400 mb-6">The item you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/search">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    {item.images && item.images.length > 0 ? (
                      <>
                        <img
                          src={item.images[currentImageIndex] || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />

                        {item.images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>

                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                              {item.images.map((_: any, index: number) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`w-2 h-2 rounded-full ${
                                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Info className="h-12 w-12 text-slate-600" />
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

                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">{item.name}</h1>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-slate-300">
                        <Calendar className="h-5 w-5 mr-2 text-slate-400" />
                        <div>
                          <div className="text-xs text-slate-400">Date</div>
                          <div>{item.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-300">
                        <MapPin className="h-5 w-5 mr-2 text-slate-400" />
                        <div>
                          <div className="text-xs text-slate-400">Location</div>
                          <div>{item.location}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-300">
                        <Tag className="h-5 w-5 mr-2 text-slate-400" />
                        <div>
                          <div className="text-xs text-slate-400">Category</div>
                          <div className="capitalize">{item.category}</div>
                        </div>
                      </div>

                      {item.condition && (
                        <div className="flex items-center text-slate-300">
                          <Info className="h-5 w-5 mr-2 text-slate-400" />
                          <div>
                            <div className="text-xs text-slate-400">Condition</div>
                            <div className="capitalize">{item.condition}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Tabs defaultValue="description">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>
                      <TabsContent value="description" className="pt-4">
                        {item.description ? (
                          <p className="text-slate-300">{item.description}</p>
                        ) : (
                          <p className="text-slate-400 italic">No description provided</p>
                        )}
                      </TabsContent>
                      <TabsContent value="details" className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b border-slate-800">
                            <span className="text-slate-400">Status</span>
                            <span className="capitalize">{item.status}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-800">
                            <span className="text-slate-400">Reported On</span>
                            <span>{new Date(item.created_at?.toDate()).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-800">
                            <span className="text-slate-400">Item ID</span>
                            <span className="text-sm font-mono">{item.id}</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact & Suggested Matches */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {item.type === "lost" ? "Contact Owner" : "Claim This Item"}
                  </CardTitle>
                  <CardDescription>
                    {item.type === "lost"
                      ? "If you found this item, contact the owner"
                      : "If this is your lost item, you can claim it"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {owner && (
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                        {owner.avatar_url ? (
                          <img
                            src={owner.avatar_url || "/placeholder.svg"}
                            alt={owner.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium">{owner.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{owner.username}</div>
                        <div className="text-sm text-slate-400">
                          {new Date(owner.created_at?.toDate()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Status */}
                  {item.payment_status && (
                    <div
                      className={`p-3 rounded-md mb-4 ${
                        item.payment_status === "paid"
                          ? "bg-green-900/20 border border-green-800/30 text-green-300"
                          : "bg-blue-900/20 border border-blue-800/30 text-blue-300"
                      }`}
                    >
                      <p className="text-sm">
                        {item.payment_status === "paid"
                          ? "Payment has been completed for this item."
                          : "This item requires a secure payment to proceed with the exchange."}
                      </p>
                    </div>
                  )}

                  {/* Platform Fee Notice */}
                  {(item.type === "found" || item.requires_payment) && !item.payment_status && (
                    <div className="bg-blue-900/20 border border-blue-800/30 p-3 rounded-md text-sm text-blue-300 mb-4">
                      <p>
                        A 10% platform fee will be applied to secure the transaction and protect both parties during the
                        exchange.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {item.payment_status === "paid" ? (
                    <Button
                      onClick={() => router.push(`/dashboard/chat?item=${id}`)}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Go to Chat
                    </Button>
                  ) : item.type === "lost" ? (
                    <Button
                      onClick={handleContactOwner}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Owner
                    </Button>
                  ) : (
                    <Button
                      onClick={handleClaimItem}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Claim This Item
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Suggested Matches */}
              {suggestedMatches.length > 0 && (
                <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Suggested Matches</CardTitle>
                    <CardDescription>
                      {item.type === "lost" ? "Items that might be yours" : "People who might have lost this item"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {suggestedMatches.map((match) => (
                        <motion.div
                          key={match.id}
                          whileHover={{ x: 5 }}
                          className="flex items-center p-2 rounded-md hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                            {match.images && match.images.length > 0 ? (
                              <img
                                src={match.images[0] || "/placeholder.svg"}
                                alt={match.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                {match.type === "lost" ? (
                                  <AlertTriangle className="h-6 w-6 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{match.name}</div>
                            <div className="text-sm text-slate-400 truncate">{match.location}</div>
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/items/${match.id}`}>View</Link>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/search">View More Matches</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        itemId={id as string}
        itemName={item?.name || ""}
        recipientId={item?.user_id || ""}
        recipientDetails={{
          name: owner?.username || "User",
          email: owner?.email || "user@example.com",
          phone: owner?.phone || "0000000000",
        }}
        onPaymentComplete={handlePaymentComplete}
      />
      <Footer />
    </div>
  )
}
