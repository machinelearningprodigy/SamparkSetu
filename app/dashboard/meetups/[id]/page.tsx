"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  CalendarIcon,
  MapPin,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Tag,
  HandshakeIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function MeetupPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [match, setMatch] = useState<any>(null)
  const [meetup, setMeetup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("12:00")
  const [location, setLocation] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [status, setStatus] = useState<string>("scheduled")

  useEffect(() => {
    const fetchMeetupDetails = async () => {
      if (!user || !id) return

      try {
        setIsLoading(true)

        // Fetch match details
        const matchDoc = await getDoc(doc(db, "matches", id as string))

        if (!matchDoc.exists()) {
          toast({
            title: "Error",
            description: "Match not found",
            variant: "destructive",
          })
          router.push("/dashboard/matches")
          return
        }

        const matchData = { id: matchDoc.id, ...matchDoc.data() }

        // Fetch lost and found items
        const [lostItemDoc, foundItemDoc] = await Promise.all([
          getDoc(doc(db, "items", matchData.lost_item_id)),
          getDoc(doc(db, "items", matchData.found_item_id)),
        ])

        if (!lostItemDoc.exists() || !foundItemDoc.exists()) {
          toast({
            title: "Error",
            description: "Item details not found",
            variant: "destructive",
          })
          router.push("/dashboard/matches")
          return
        }

        const lostItem = { id: lostItemDoc.id, ...lostItemDoc.data() }
        const foundItem = { id: foundItemDoc.id, ...foundItemDoc.data() }

        // Get user profiles
        const [lostItemUserDoc, foundItemUserDoc] = await Promise.all([
          getDoc(doc(db, "profiles", lostItem.user_id)),
          getDoc(doc(db, "profiles", foundItem.user_id)),
        ])

        const lostItemUser = lostItemUserDoc.exists() ? { id: lostItemUserDoc.id, ...lostItemUserDoc.data() } : null
        const foundItemUser = foundItemUserDoc.exists() ? { id: foundItemUserDoc.id, ...foundItemUserDoc.data() } : null

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

        setMatch(enrichedMatch)

        // Fetch meetup details if they exist
        const meetupQuery = query(collection(db, "meetups"), where("match_id", "==", id))

        const meetupSnapshot = await getDocs(meetupQuery)

        if (!meetupSnapshot.empty) {
          const meetupData = { id: meetupSnapshot.docs[0].id, ...meetupSnapshot.docs[0].data() }
          setMeetup(meetupData)

          // Set form values from existing meetup
          if (meetupData.scheduled_date) {
            setDate(meetupData.scheduled_date.toDate())
          }

          if (meetupData.scheduled_time) {
            setTime(meetupData.scheduled_time)
          }

          if (meetupData.location) {
            setLocation(meetupData.location)
          }

          if (meetupData.notes) {
            setNotes(meetupData.notes)
          }

          if (meetupData.status) {
            setStatus(meetupData.status)
          }
        } else {
          // Create a new meetup record if it doesn't exist
          const newMeetupRef = await addDoc(collection(db, "meetups"), {
            match_id: id,
            lost_item_id: matchData.lost_item_id,
            found_item_id: matchData.found_item_id,
            loser_id: lostItem.user_id,
            finder_id: foundItem.user_id,
            status: "scheduled",
            created_at: serverTimestamp(),
            scheduled_date: null,
            scheduled_time: null,
            location: null,
            notes: null,
          })

          const newMeetupData = {
            id: newMeetupRef.id,
            match_id: id,
            lost_item_id: matchData.lost_item_id,
            found_item_id: matchData.found_item_id,
            loser_id: lostItem.user_id,
            finder_id: foundItem.user_id,
            status: "scheduled",
            created_at: Timestamp.now(),
          }

          setMeetup(newMeetupData)
        }
      } catch (error) {
        console.error("Error fetching meetup details:", error)
        toast({
          title: "Error",
          description: "Failed to load meetup details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetupDetails()
  }, [id, user, router, toast])

  const handleSaveMeetup = async () => {
    if (!user || !meetup || isSaving) return

    try {
      setIsSaving(true)

      // Combine date and time
      let scheduledDate = null
      if (date) {
        const [hours, minutes] = time.split(":").map(Number)
        const dateWithTime = new Date(date)
        dateWithTime.setHours(hours, minutes)
        scheduledDate = dateWithTime
      }

      // Update meetup details
      await updateDoc(doc(db, "meetups", meetup.id), {
        scheduled_date: scheduledDate,
        scheduled_time: time,
        location,
        notes,
        status,
        updated_at: serverTimestamp(),
        updated_by: user.uid,
      })

      // Create notifications for both users
      await Promise.all([
        addDoc(collection(db, "notifications"), {
          user_id: match.lostItem.user_id,
          type: "meetup_updated",
          title: "Meetup Details Updated",
          message: `Meetup details for ${match.lostItem.name} have been updated.`,
          read: false,
          created_at: serverTimestamp(),
          match_id: match.id,
          meetup_id: meetup.id,
        }),
        addDoc(collection(db, "notifications"), {
          user_id: match.foundItem.user_id,
          type: "meetup_updated",
          title: "Meetup Details Updated",
          message: `Meetup details for ${match.foundItem.name} have been updated.`,
          read: false,
          created_at: serverTimestamp(),
          match_id: match.id,
          meetup_id: meetup.id,
        }),
      ])

      toast({
        title: "Success",
        description: "Meetup details saved successfully",
      })

      // Refresh meetup data
      const updatedMeetupDoc = await getDoc(doc(db, "meetups", meetup.id))
      if (updatedMeetupDoc.exists()) {
        setMeetup({ id: updatedMeetupDoc.id, ...updatedMeetupDoc.data() })
      }
    } catch (error) {
      console.error("Error saving meetup details:", error)
      toast({
        title: "Error",
        description: "Failed to save meetup details",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleMarkCompleted = async () => {
    if (!user || !meetup || isSaving) return

    try {
      setIsSaving(true)

      // Update meetup status
      await updateDoc(doc(db, "meetups", meetup.id), {
        status: "completed",
        completed_at: serverTimestamp(),
        completed_by: user.uid,
        updated_at: serverTimestamp(),
      })

      // Update item status
      await updateDoc(doc(db, "items", match.lostItem.id), {
        status: "claimed",
      })

      await updateDoc(doc(db, "items", match.foundItem.id), {
        status: "claimed",
      })

      // Create notifications for both users
      await Promise.all([
        addDoc(collection(db, "notifications"), {
          user_id: match.lostItem.user_id,
          type: "meetup_completed",
          title: "Meetup Completed",
          message: `The meetup for ${match.lostItem.name} has been marked as completed. The item has been returned.`,
          read: false,
          created_at: serverTimestamp(),
          match_id: match.id,
          meetup_id: meetup.id,
        }),
        addDoc(collection(db, "notifications"), {
          user_id: match.foundItem.user_id,
          type: "meetup_completed",
          title: "Meetup Completed",
          message: `The meetup for ${match.foundItem.name} has been marked as completed. The item has been returned.`,
          read: false,
          created_at: serverTimestamp(),
          match_id: match.id,
          meetup_id: meetup.id,
        }),
      ])

      toast({
        title: "Success",
        description: "Meetup marked as completed. The item has been returned.",
      })

      // Update status in state
      setStatus("completed")
      setMeetup({ ...meetup, status: "completed", completed_at: Timestamp.now(), completed_by: user.uid })
    } catch (error) {
      console.error("Error marking meetup as completed:", error)
      toast({
        title: "Error",
        description: "Failed to mark meetup as completed",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleMessageUser = () => {
    if (!match) return

    // Determine which item to use for the message context
    const itemId = match.userRole === "finder" ? match.foundItem.id : match.lostItem.id
    router.push(`/dashboard/messages?item=${itemId}&user=${match.otherUser.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!match || !meetup) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-slate-800/50 h-20 w-20 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-slate-600" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Meetup Not Found</h3>
        <p className="text-slate-400 max-w-md mb-6">The meetup you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <a href="/dashboard/matches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/matches")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            <HandshakeIcon className="h-8 w-8 text-blue-400" />
            Arrange Meetup
          </h1>
          <p className="text-slate-400 mt-1">
            Coordinate the return of {match.userRole === "finder" ? "a lost item" : "your item"}
          </p>
        </div>
        <Badge
          className={`${
            status === "scheduled"
              ? "bg-blue-600"
              : status === "completed"
                ? "bg-green-600"
                : status === "cancelled"
                  ? "bg-red-600"
                  : "bg-yellow-600"
          } text-white`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Item Details */}
        <div className="md:col-span-1">
          <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Information about the matched item</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={
                    match.userRole === "finder"
                      ? match.lostItem.images && match.lostItem.images.length > 0
                        ? match.lostItem.images[0]
                        : "/placeholder.svg?height=200&width=300"
                      : match.foundItem.images && match.foundItem.images.length > 0
                        ? match.foundItem.images[0]
                        : "/placeholder.svg?height=200&width=300"
                  }
                  alt={match.userRole === "finder" ? match.lostItem.name : match.foundItem.name}
                  className="w-full h-48 object-cover"
                />
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded ${
                    match.userRole === "finder" ? "bg-red-600 text-white" : "bg-green-600 text-white"
                  } text-xs font-medium`}
                >
                  {match.userRole === "finder" ? "Lost" : "Found"}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">
                  {match.userRole === "finder" ? match.lostItem.name : match.foundItem.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="text-sm">
                      {match.userRole === "finder" ? match.lostItem.date : match.foundItem.date}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="text-sm">
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

                <Separator className="my-4" />

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
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleMessageUser} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message {match.otherUser?.username || "User"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - Meetup Form */}
        <div className="md:col-span-2">
          <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
            <CardHeader>
              <CardTitle>Meetup Details</CardTitle>
              <CardDescription>
                {status === "completed"
                  ? "This meetup has been completed and the item has been returned."
                  : "Arrange a time and place to return the item"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        disabled={status === "completed"}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Select value={time} onValueChange={setTime} disabled={status === "completed"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <React.Fragment key={hour}>
                          <SelectItem value={`${hour.toString().padStart(2, "0")}:00`}>
                            {hour.toString().padStart(2, "0")}:00
                          </SelectItem>
                          <SelectItem value={`${hour.toString().padStart(2, "0")}:30`}>
                            {hour.toString().padStart(2, "0")}:30
                          </SelectItem>
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter a meeting location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={status === "completed"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add any additional details or instructions"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={status === "completed"}
                  className="min-h-[100px]"
                />
              </div>

              {status !== "completed" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              {status !== "completed" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleMarkCompleted}
                    disabled={isSaving || !date || !location}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Mark as Completed
                  </Button>
                  <Button
                    onClick={handleSaveMeetup}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <HandshakeIcon className="h-4 w-4 mr-2" />
                    )}
                    Save Meetup Details
                  </Button>
                </>
              ) : (
                <div className="flex items-center justify-center w-full bg-green-600/20 border border-green-600 rounded-md p-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>This meetup has been completed and the item has been returned.</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
