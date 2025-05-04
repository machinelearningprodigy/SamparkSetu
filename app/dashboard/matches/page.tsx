"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  HandshakeIcon,
  X,
  MessageSquare,
  Search,
  Calendar,
  MapPin,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Match } from "@/lib/database.types"

export default function MatchesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([])
  const [pendingMatches, setPendingMatches] = useState<any[]>([])
  const [confirmedMatches, setConfirmedMatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("suggested")
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [meetupDetails, setMeetupDetails] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    // Set up real-time listener for matches
    const matchesQuery = query(
      collection(db, "matches"),
      where("status", "in", ["suggested", "pending", "confirmed", "rejected"]),
      orderBy("created_at", "desc"),
    )

    const unsubscribe = onSnapshot(matchesQuery, async (snapshot) => {
      try {
        setIsLoading(true)

        const suggested: any[] = []
        const pending: any[] = []
        const confirmed: any[] = []

        // Process each match document
        for (const docChange of snapshot.docChanges()) {
          const matchData = { id: docChange.doc.id, ...docChange.doc.data() } as Match & { id: string }

          // Get the lost and found items
          const [lostItemDoc, foundItemDoc] = await Promise.all([
            getDoc(doc(db, "items", matchData.lost_item_id)),
            getDoc(doc(db, "items", matchData.found_item_id)),
          ])

          if (!lostItemDoc.exists() || !foundItemDoc.exists()) continue

          const lostItem = { id: lostItemDoc.id, ...lostItemDoc.data() }
          const foundItem = { id: foundItemDoc.id, ...foundItemDoc.data() }

          // Get user profiles
          const [lostItemUserDoc, foundItemUserDoc] = await Promise.all([
            getDoc(doc(db, "profiles", lostItem.user_id)),
            getDoc(doc(db, "profiles", foundItem.user_id)),
          ])

          const lostItemUser = lostItemUserDoc.exists() ? { id: lostItemUserDoc.id, ...lostItemUserDoc.data() } : null
          const foundItemUser = foundItemUserDoc.exists()
            ? { id: foundItemUserDoc.id, ...foundItemUserDoc.data() }
            : null

          // Determine if this match involves the current user
          const isUserInvolved = lostItem.user_id === user.uid || foundItem.user_id === user.uid

          if (!isUserInvolved) continue

          // Determine if the user is the finder or loser
          const isUserFinder = foundItem.user_id === user.uid
          const userRole = isUserFinder ? "finder" : "loser"

          // Determine the other user
          const otherUser = isUserFinder ? lostItemUser : foundItemUser

          // Create the enriched match object
          const enrichedMatch = {
            ...matchData,
            lostItem,
            foundItem,
            lostItemUser,
            foundItemUser,
            userRole,
            otherUser,
          }

          // Categorize the match based on status
          if (matchData.status === "suggested") {
            suggested.push(enrichedMatch)
          } else if (matchData.status === "pending") {
            pending.push(enrichedMatch)
          } else if (matchData.status === "confirmed") {
            confirmed.push(enrichedMatch)
          }
        }

        setSuggestedMatches(suggested)
        setPendingMatches(pending)
        setConfirmedMatches(confirmed)

        // Fetch meetup details for confirmed matches
        if (confirmed.length > 0) {
          const meetupDetailsPromises = confirmed.map(async (match) => {
            const meetupQuery = query(collection(db, "meetups"), where("match_id", "==", match.id))
            const meetupSnapshot = await getDocs(meetupQuery)
            if (!meetupSnapshot.empty) {
              return {
                matchId: match.id,
                ...meetupSnapshot.docs[0].data(),
                id: meetupSnapshot.docs[0].id,
              }
            }
            return null
          })

          const meetupDetailsResults = await Promise.all(meetupDetailsPromises)
          setMeetupDetails(meetupDetailsResults.filter(Boolean))
        }
      } catch (error) {
        console.error("Error fetching matches:", error)
        toast({
          title: "Error",
          description: "Failed to load matches",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [user, toast])

  const handleViewMatch = (match: any) => {
    setSelectedMatch(match)
    setIsDialogOpen(true)
  }

  const handleAcceptMatch = async (match: any) => {
    if (!user || isProcessing) return

    try {
      setIsProcessing(true)

      // Update match status
      await updateDoc(doc(db, "matches", match.id), {
        status: "pending",
        updated_at: serverTimestamp(),
        [`${match.userRole}_confirmed`]: true,
      })

      // Create a notification for the other user
      await addDoc(collection(db, "notifications"), {
        user_id: match.otherUser.id,
        type: "match_accepted",
        title: "Match Accepted",
        message: `${user.displayName || "Someone"} has accepted your match for ${match.userRole === "finder" ? match.lostItem.name : match.foundItem.name}`,
        read: false,
        created_at: serverTimestamp(),
        match_id: match.id,
      })

      toast({
        title: "Match Accepted",
        description: "You've accepted this match. Waiting for the other party to confirm.",
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error accepting match:", error)
      toast({
        title: "Error",
        description: "Failed to accept match",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectMatch = async (match: any) => {
    if (!user || isProcessing) return

    try {
      setIsProcessing(true)

      // Update match status
      await updateDoc(doc(db, "matches", match.id), {
        status: "rejected",
        updated_at: serverTimestamp(),
        rejected_by: user.uid,
        rejection_reason: "Not a match",
      })

      // Create a notification for the other user
      await addDoc(collection(db, "notifications"), {
        user_id: match.otherUser.id,
        type: "match_rejected",
        title: "Match Rejected",
        message: `${user.displayName || "Someone"} has rejected the match for ${match.userRole === "finder" ? match.lostItem.name : match.foundItem.name}`,
        read: false,
        created_at: serverTimestamp(),
        match_id: match.id,
      })

      toast({
        title: "Match Rejected",
        description: "You've rejected this match.",
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error rejecting match:", error)
      toast({
        title: "Error",
        description: "Failed to reject match",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmMatch = async (match: any) => {
    if (!user || isProcessing) return

    try {
      setIsProcessing(true)

      // Check if both parties have confirmed
      const otherUserConfirmed = match[match.userRole === "finder" ? "loser_confirmed" : "finder_confirmed"]

      if (otherUserConfirmed) {
        // Both parties have confirmed, update to confirmed status
        await updateDoc(doc(db, "matches", match.id), {
          status: "confirmed",
          updated_at: serverTimestamp(),
          [`${match.userRole}_confirmed`]: true,
        })

        // Create a meetup record
        await addDoc(collection(db, "meetups"), {
          match_id: match.id,
          lost_item_id: match.lost_item_id,
          found_item_id: match.found_item_id,
          loser_id: match.lostItem.user_id,
          finder_id: match.foundItem.user_id,
          status: "scheduled",
          created_at: serverTimestamp(),
          scheduled_date: null,
          location: null,
          notes: null,
        })

        // Create notifications for both users
        await Promise.all([
          addDoc(collection(db, "notifications"), {
            user_id: match.lostItem.user_id,
            type: "match_confirmed",
            title: "Match Confirmed",
            message: `Your match for ${match.lostItem.name} has been confirmed! You can now arrange a meetup.`,
            read: false,
            created_at: serverTimestamp(),
            match_id: match.id,
          }),
          addDoc(collection(db, "notifications"), {
            user_id: match.foundItem.user_id,
            type: "match_confirmed",
            title: "Match Confirmed",
            message: `Your match for ${match.foundItem.name} has been confirmed! You can now arrange a meetup.`,
            read: false,
            created_at: serverTimestamp(),
            match_id: match.id,
          }),
        ])

        toast({
          title: "Match Confirmed",
          description: "Both parties have confirmed the match! You can now arrange a meetup.",
        })
      } else {
        // Only this user has confirmed
        await updateDoc(doc(db, "matches", match.id), {
          [`${match.userRole}_confirmed`]: true,
          updated_at: serverTimestamp(),
        })

        // Create a notification for the other user
        await addDoc(collection(db, "notifications"), {
          user_id: match.otherUser.id,
          type: "match_pending_confirmation",
          title: "Match Pending Confirmation",
          message: `${user.displayName || "Someone"} has confirmed the match for ${match.userRole === "finder" ? match.foundItem.name : match.lostItem.name}. Please confirm to proceed.`,
          read: false,
          created_at: serverTimestamp(),
          match_id: match.id,
        })

        toast({
          title: "Match Pending",
          description: "You've confirmed this match. Waiting for the other party to confirm.",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error confirming match:", error)
      toast({
        title: "Error",
        description: "Failed to confirm match",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleArrangeMeetup = (match: any) => {
    router.push(`/dashboard/meetups/${match.id}`)
  }

  const handleMessageUser = (match: any) => {
    // Determine which item to use for the message context
    const itemId = match.userRole === "finder" ? match.foundItem.id : match.lostItem.id
    router.push(`/dashboard/messages?item=${itemId}&user=${match.otherUser.id}`)
  }

  const getMeetupStatus = (matchId: string) => {
    const meetup = meetupDetails.find((m) => m.matchId === matchId)
    if (!meetup) return null

    return {
      status: meetup.status,
      date: meetup.scheduled_date ? new Date(meetup.scheduled_date.toDate()) : null,
      location: meetup.location,
      notes: meetup.notes,
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            <HandshakeIcon className="h-8 w-8 text-blue-400" />
            Item Matches
          </h1>
          <p className="text-slate-400 mt-1">View and manage potential matches for your lost and found items</p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="suggested" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Suggested</span>
            {suggestedMatches.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-600 text-white">
                {suggestedMatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
            {pendingMatches.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-yellow-600 text-white">
                {pendingMatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Confirmed</span>
            {confirmedMatches.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-green-600 text-white">
                {confirmedMatches.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggested" className="mt-6">
          {suggestedMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onView={() => handleViewMatch(match)}
                  onAccept={() => handleAcceptMatch(match)}
                  onReject={() => handleRejectMatch(match)}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="h-12 w-12 text-slate-600" />}
              title="No suggested matches"
              description="We don't have any suggested matches for your items at the moment."
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingMatches.map((match) => (
                <PendingMatchCard
                  key={match.id}
                  match={match}
                  onView={() => handleViewMatch(match)}
                  onConfirm={() => handleConfirmMatch(match)}
                  onMessage={() => handleMessageUser(match)}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Clock className="h-12 w-12 text-slate-600" />}
              title="No pending matches"
              description="You don't have any matches waiting for confirmation."
            />
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {confirmedMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {confirmedMatches.map((match) => (
                <ConfirmedMatchCard
                  key={match.id}
                  match={match}
                  meetupDetails={getMeetupStatus(match.id)}
                  onView={() => handleViewMatch(match)}
                  onArrangeMeetup={() => handleArrangeMeetup(match)}
                  onMessage={() => handleMessageUser(match)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle className="h-12 w-12 text-slate-600" />}
              title="No confirmed matches"
              description="You don't have any confirmed matches yet."
            />
          )}
        </TabsContent>
      </Tabs>

      {selectedMatch && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Match Details</DialogTitle>
              <DialogDescription>Review the details of this potential match</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lost Item */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Lost Item
                </h3>
                <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={
                          selectedMatch.lostItem.images && selectedMatch.lostItem.images.length > 0
                            ? selectedMatch.lostItem.images[0]
                            : "/placeholder.svg?height=200&width=300"
                        }
                        alt={selectedMatch.lostItem.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-red-600 text-white text-xs font-medium">
                        Lost
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xl font-semibold mb-2">{selectedMatch.lostItem.name}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Category:</span>{" "}
                          {selectedMatch.lostItem.category}
                        </div>
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Date:</span> {selectedMatch.lostItem.date}
                        </div>
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Location:</span>{" "}
                          {selectedMatch.lostItem.location}
                        </div>
                      </div>
                      {selectedMatch.lostItem.description && (
                        <div className="text-sm text-slate-400 mb-4">
                          <span className="font-medium text-slate-300">Description:</span>
                          <p className="mt-1">{selectedMatch.lostItem.description}</p>
                        </div>
                      )}
                      <div className="flex items-center mt-2">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={selectedMatch.lostItemUser?.avatar_url || ""} />
                          <AvatarFallback className="bg-slate-700">
                            {selectedMatch.lostItemUser?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{selectedMatch.lostItemUser?.username || "Unknown User"}</div>
                          <div className="text-slate-400">Owner</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Found Item */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Found Item
                </h3>
                <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={
                          selectedMatch.foundItem.images && selectedMatch.foundItem.images.length > 0
                            ? selectedMatch.foundItem.images[0]
                            : "/placeholder.svg?height=200&width=300"
                        }
                        alt={selectedMatch.foundItem.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-green-600 text-white text-xs font-medium">
                        Found
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xl font-semibold mb-2">{selectedMatch.foundItem.name}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Category:</span>{" "}
                          {selectedMatch.foundItem.category}
                        </div>
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Date:</span> {selectedMatch.foundItem.date}
                        </div>
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Location:</span>{" "}
                          {selectedMatch.foundItem.location}
                        </div>
                        {selectedMatch.foundItem.condition && (
                          <div className="text-sm text-slate-400">
                            <span className="font-medium text-slate-300">Condition:</span>{" "}
                            {selectedMatch.foundItem.condition}
                          </div>
                        )}
                      </div>
                      {selectedMatch.foundItem.description && (
                        <div className="text-sm text-slate-400 mb-4">
                          <span className="font-medium text-slate-300">Description:</span>
                          <p className="mt-1">{selectedMatch.foundItem.description}</p>
                        </div>
                      )}
                      <div className="flex items-center mt-2">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={selectedMatch.foundItemUser?.avatar_url || ""} />
                          <AvatarFallback className="bg-slate-700">
                            {selectedMatch.foundItemUser?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{selectedMatch.foundItemUser?.username || "Unknown User"}</div>
                          <div className="text-slate-400">Finder</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Match Status</h3>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Badge
                    className={`${
                      selectedMatch.status === "suggested"
                        ? "bg-blue-600"
                        : selectedMatch.status === "pending"
                          ? "bg-yellow-600"
                          : selectedMatch.status === "confirmed"
                            ? "bg-green-600"
                            : "bg-red-600"
                    } text-white`}
                  >
                    {selectedMatch.status.charAt(0).toUpperCase() + selectedMatch.status.slice(1)}
                  </Badge>
                  <span className="ml-2 text-slate-300">
                    {selectedMatch.created_at && `Created ${format(selectedMatch.created_at.toDate(), "PPP")}`}
                  </span>
                </div>

                {selectedMatch.status === "pending" && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          selectedMatch.finder_confirmed ? "bg-green-500" : "bg-slate-500"
                        }`}
                      ></div>
                      <span className="text-sm">Finder Confirmed: {selectedMatch.finder_confirmed ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          selectedMatch.loser_confirmed ? "bg-green-500" : "bg-slate-500"
                        }`}
                      ></div>
                      <span className="text-sm">Owner Confirmed: {selectedMatch.loser_confirmed ? "Yes" : "No"}</span>
                    </div>
                  </div>
                )}

                {selectedMatch.status === "confirmed" && getMeetupStatus(selectedMatch.id) && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Meetup Details</h4>
                    <div className="text-sm text-slate-300">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span>
                          {getMeetupStatus(selectedMatch.id)?.date
                            ? format(getMeetupStatus(selectedMatch.id)?.date, "PPP 'at' h:mm a")
                            : "Not scheduled yet"}
                        </span>
                      </div>
                      {getMeetupStatus(selectedMatch.id)?.location && (
                        <div className="flex items-center mb-1">
                          <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                          <span>{getMeetupStatus(selectedMatch.id)?.location}</span>
                        </div>
                      )}
                      {getMeetupStatus(selectedMatch.id)?.notes && (
                        <div className="mt-1 text-slate-400">{getMeetupStatus(selectedMatch.id)?.notes}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedMatch.status === "suggested" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectMatch(selectedMatch)}
                    disabled={isProcessing}
                    className="w-full sm:w-auto"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    Reject Match
                  </Button>
                  <Button
                    onClick={() => handleAcceptMatch(selectedMatch)}
                    disabled={isProcessing}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-4 w-4 mr-2" />
                    )}
                    Accept Match
                  </Button>
                </>
              )}

              {selectedMatch.status === "pending" && !selectedMatch[`${selectedMatch.userRole}_confirmed`] && (
                <Button
                  onClick={() => handleConfirmMatch(selectedMatch)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirm Match
                </Button>
              )}

              {selectedMatch.status === "confirmed" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleMessageUser(selectedMatch)}
                    className="w-full sm:w-auto"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    onClick={() => handleArrangeMeetup(selectedMatch)}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    <HandshakeIcon className="h-4 w-4 mr-2" />
                    Arrange Meetup
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Match Card Component for Suggested Matches
function MatchCard({ match, onView, onAccept, onReject, isProcessing }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="h-full">
      <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className="bg-blue-600 text-white">Suggested Match</Badge>
            <div className="text-xs text-slate-400">
              {match.created_at && format(match.created_at.toDate(), "MMM d")}
            </div>
          </div>
          <CardTitle className="text-lg mt-2">
            {match.userRole === "finder" ? match.lostItem.name : match.foundItem.name}
          </CardTitle>
          <CardDescription>
            {match.userRole === "finder"
              ? "This item might belong to someone who reported it lost"
              : "This item might be yours"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex gap-4 mb-4">
            <div className="relative w-20 h-20">
              <img
                src={
                  match.userRole === "finder"
                    ? match.lostItem.images && match.lostItem.images.length > 0
                      ? match.lostItem.images[0]
                      : "/placeholder.svg?height=80&width=80"
                    : match.foundItem.images && match.foundItem.images.length > 0
                      ? match.foundItem.images[0]
                      : "/placeholder.svg?height=80&width=80"
                }
                alt="Item"
                className="w-full h-full object-cover rounded-md"
              />
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                  match.userRole === "finder" ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {match.userRole === "finder" ? (
                  <AlertTriangle className="h-3 w-3 text-white" />
                ) : (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                <span className="text-sm">
                  {match.userRole === "finder" ? match.lostItem.date : match.foundItem.date}
                </span>
              </div>
              <div className="flex items-center mb-1">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                <span className="text-sm truncate">
                  {match.userRole === "finder" ? match.lostItem.location : match.foundItem.location}
                </span>
              </div>
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-slate-400" />
                <span className="text-sm capitalize">
                  {match.userRole === "finder" ? match.lostItem.category : match.foundItem.category}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={match.otherUser?.avatar_url || ""} />
              <AvatarFallback className="bg-slate-700">
                {match.otherUser?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{match.otherUser?.username || "Unknown User"}</div>
              <div className="text-slate-400">{match.userRole === "finder" ? "Owner" : "Finder"}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={onView} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onReject} disabled={isProcessing} className="flex-1">
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
            </Button>
            <Button
              onClick={onAccept}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Pending Match Card Component
function PendingMatchCard({ match, onView, onConfirm, onMessage, isProcessing }: any) {
  const userConfirmed = match[`${match.userRole}_confirmed`]

  return (
    <motion.div whileHover={{ y: -5 }} className="h-full">
      <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className="bg-yellow-600 text-white">Pending Confirmation</Badge>
            <div className="text-xs text-slate-400">
              {match.created_at && format(match.created_at.toDate(), "MMM d")}
            </div>
          </div>
          <CardTitle className="text-lg mt-2">
            {match.userRole === "finder" ? match.lostItem.name : match.foundItem.name}
          </CardTitle>
          <CardDescription>
            {userConfirmed ? "Waiting for the other party to confirm" : "Please confirm this match to proceed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex gap-4 mb-4">
            <div className="relative w-20 h-20">
              <img
                src={
                  match.userRole === "finder"
                    ? match.lostItem.images && match.lostItem.images.length > 0
                      ? match.lostItem.images[0]
                      : "/placeholder.svg?height=80&width=80"
                    : match.foundItem.images && match.foundItem.images.length > 0
                      ? match.foundItem.images[0]
                      : "/placeholder.svg?height=80&width=80"
                }
                alt="Item"
                className="w-full h-full object-cover rounded-md"
              />
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                  match.userRole === "finder" ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {match.userRole === "finder" ? (
                  <AlertTriangle className="h-3 w-3 text-white" />
                ) : (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                <span className="text-sm">
                  {match.userRole === "finder" ? match.lostItem.date : match.foundItem.date}
                </span>
              </div>
              <div className="flex items-center mb-1">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                <span className="text-sm truncate">
                  {match.userRole === "finder" ? match.lostItem.location : match.foundItem.location}
                </span>
              </div>
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-slate-400" />
                <span className="text-sm capitalize">
                  {match.userRole === "finder" ? match.lostItem.category : match.foundItem.category}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={match.otherUser?.avatar_url || ""} />
                <AvatarFallback className="bg-slate-700">
                  {match.otherUser?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{match.otherUser?.username || "Unknown User"}</div>
                <div className="text-slate-400">{match.userRole === "finder" ? "Owner" : "Finder"}</div>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  match[match.userRole === "finder" ? "finder_confirmed" : "loser_confirmed"]
                    ? "bg-green-500"
                    : "bg-slate-500"
                }`}
              ></div>
              <div
                className={`w-3 h-3 rounded-full ${
                  match[match.userRole === "finder" ? "loser_confirmed" : "finder_confirmed"]
                    ? "bg-green-500"
                    : "bg-slate-500"
                }`}
              ></div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onView} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button variant="outline" onClick={onMessage} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
          {!userConfirmed && (
            <Button
              onClick={onConfirm}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Match
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Confirmed Match Card Component
function ConfirmedMatchCard({ match, meetupDetails, onView, onArrangeMeetup, onMessage }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="h-full">
      <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className="bg-green-600 text-white">Confirmed Match</Badge>
            <div className="text-xs text-slate-400">
              {match.created_at && format(match.created_at.toDate(), "MMM d")}
            </div>
          </div>
          <CardTitle className="text-lg mt-2">
            {match.userRole === "finder" ? match.lostItem.name : match.foundItem.name}
          </CardTitle>
          <CardDescription>
            {meetupDetails?.status === "scheduled"
              ? "Meetup scheduled"
              : meetupDetails?.status === "completed"
                ? "Item returned successfully"
                : "Arrange a meetup to return the item"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex gap-4 mb-4">
            <div className="relative w-20 h-20">
              <img
                src={
                  match.userRole === "finder"
                    ? match.lostItem.images && match.lostItem.images.length > 0
                      ? match.lostItem.images[0]
                      : "/placeholder.svg?height=80&width=80"
                    : match.foundItem.images && match.foundItem.images.length > 0
                      ? match.foundItem.images[0]
                      : "/placeholder.svg?height=80&width=80"
                }
                alt="Item"
                className="w-full h-full object-cover rounded-md"
              />
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                  match.userRole === "finder" ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {match.userRole === "finder" ? (
                  <AlertTriangle className="h-3 w-3 text-white" />
                ) : (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              {meetupDetails?.date ? (
                <div className="flex items-center mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-sm">{format(meetupDetails.date, "PPP 'at' h:mm a")}</span>
                </div>
              ) : (
                <div className="flex items-center mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-sm text-yellow-500">Not scheduled yet</span>
                </div>
              )}

              {meetupDetails?.location ? (
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-sm truncate">{meetupDetails.location}</span>
                </div>
              ) : (
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-sm text-yellow-500">No location set</span>
                </div>
              )}

              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-slate-400" />
                <span className="text-sm capitalize">
                  {match.userRole === "finder" ? match.lostItem.category : match.foundItem.category}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={match.otherUser?.avatar_url || ""} />
              <AvatarFallback className="bg-slate-700">
                {match.otherUser?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{match.otherUser?.username || "Unknown User"}</div>
              <div className="text-slate-400">{match.userRole === "finder" ? "Owner" : "Finder"}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onView} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button variant="outline" onClick={onMessage} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
          <Button
            onClick={onArrangeMeetup}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            <HandshakeIcon className="h-4 w-4 mr-2" />
            {meetupDetails?.status === "scheduled" ? "View Meetup" : "Arrange Meetup"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Empty State Component
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/50 rounded-lg border border-slate-800">
      <div className="bg-slate-800/50 h-20 w-20 rounded-full flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md">{description}</p>
    </div>
  )
}
