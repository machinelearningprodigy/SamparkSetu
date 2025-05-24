"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Send,
  AlertTriangle,
  CheckCircle,
  Trash2,
  ImageIcon,
  Paperclip,
  X,
  Search,
  MessageSquare,
  Star,
  StarOff,
  User,
  Loader2,
  Mail,
  MailPlus,
  CircleAlert,
  ArchiveIcon,
  Trash,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  limit,
  startAfter,
  or,
  and,
  deleteDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { MessageSidebar } from "@/components/message-sidebar"

// Message type definition
interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  item_id?: string
  read: boolean
  created_at: Timestamp
  images?: string[]
  category: "inbox" | "sent" | "archived" | "spam" | "trash"
  starred: boolean
}

// Conversation type definition
interface Conversation {
  id: string
  otherUserId: string
  itemId?: string
  lastMessage: Message
  otherUser: any
  item?: any
  unreadCount: number
}

export default function MessagesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const itemId = searchParams.get("item")
  const userId = searchParams.get("user")
  const { toast } = useToast()
  const router = useRouter()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [itemDetails, setItemDetails] = useState<any>(null)
  const [messageImages, setMessageImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [archivedCount, setArchivedCount] = useState(0)
  const [spamCount, setSpamCount] = useState(0)
  const [starredCount, setStarredCount] = useState(0)
  const [trashCount, setTrashCount] = useState(0)
  const [userData, setUserData] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set up real-time listeners for conversations and messages
  useEffect(() => {
    if (!user) return

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "profiles", user.uid)
        const userSnapshot = await getDoc(userRef)
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data())
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()

    // Initial fetch
    fetchConversations()

    // Set up real-time listener for new messages
    const messagesQuery = query(
      collection(db, "messages"),
      or(where("receiver_id", "==", user.uid), where("sender_id", "==", user.uid)),
      orderBy("created_at", "desc"),
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      console.log("Real-time update received, changes:", snapshot.docChanges().length)

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New message added:", change.doc.data())
          // Refresh conversations when a new message is received
          fetchConversations()
        }
      })
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle initial item and user from URL params
  useEffect(() => {
    if (itemId || userId) {
      initializeConversation(itemId, userId)
    }
  }, [itemId, userId, user])

  const initializeConversation = async (itemId?: string | null, userId?: string | null) => {
    if (!user) return

    try {
      if (itemId) {
        // Fetch item details
        const itemRef = doc(db, "items", itemId)
        const itemSnapshot = await getDoc(itemRef)

        if (itemSnapshot.exists()) {
          const itemData = { id: itemSnapshot.id, ...itemSnapshot.data() }
          setItemDetails(itemData)

          // Get the other user ID (item owner)
          const otherUserId = itemData.user_id

          if (otherUserId === user.uid) {
            toast({
              title: "Cannot message yourself",
              description: "This is your own item.",
              variant: "destructive",
            })
            return
          }

          // Fetch user profile
          const userRef = doc(db, "profiles", otherUserId)
          const userSnapshot = await getDoc(userRef)
          const userData = userSnapshot.exists() ? userSnapshot.data() : null

          // Create or find conversation
          const conversation = {
            id: `${otherUserId}-${itemId}`,
            otherUserId,
            itemId,
            otherUser: userData,
            item: itemData,
            unreadCount: 0,
            lastMessage: {} as Message,
          }

          setActiveConversation(conversation)
          fetchMessages(otherUserId, itemId)
        }
      } else if (userId) {
        // Direct conversation with a user
        if (userId === user.uid) {
          toast({
            title: "Cannot message yourself",
            description: "You cannot start a conversation with yourself.",
            variant: "destructive",
          })
          return
        }

        // Fetch user profile
        const userRef = doc(db, "profiles", userId)
        const userSnapshot = await getDoc(userRef)

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data()

          // Create or find conversation
          const conversation = {
            id: `${userId}-direct`,
            otherUserId: userId,
            otherUser: userData,
            unreadCount: 0,
            lastMessage: {} as Message,
          }

          setActiveConversation(conversation)
          fetchMessages(userId)
        }
      }
    } catch (error) {
      console.error("Error initializing conversation:", error)
    }
  }

  const fetchConversations = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      console.log("Fetching conversations for user:", user.uid)

      // Fetch ALL messages where user is either sender or receiver
      const messagesQuery = query(
        collection(db, "messages"),
        or(where("sender_id", "==", user.uid), where("receiver_id", "==", user.uid)),
        orderBy("created_at", "desc"),
      )

      const messagesSnapshot = await getDocs(messagesQuery)
      console.log("Total messages found:", messagesSnapshot.docs.length)

      const allMessages = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      // Group messages by conversation
      const conversationMap = new Map<string, Conversation>()

      // Count messages by category for the current user
      let unread = 0
      let archived = 0
      let spam = 0
      let starred = 0
      let trash = 0

      for (const message of allMessages) {
        console.log("Processing message:", {
          id: message.id,
          sender: message.sender_id,
          receiver: message.receiver_id,
          content: message.content,
          category: message.category,
          read: message.read,
        })

        const otherUserId = message.sender_id === user.uid ? message.receiver_id : message.sender_id
        const conversationKey = message.item_id ? `${otherUserId}-${message.item_id}` : `${otherUserId}-direct`

        // Count categories based on user's perspective
        if (message.receiver_id === user.uid) {
          if (!message.read) unread++
          if (message.category === "archived") archived++
          if (message.category === "spam") spam++
          if (message.category === "trash") trash++
          if (message.starred) starred++
        }

        // Create or update conversation
        if (!conversationMap.has(conversationKey)) {
          console.log("Creating new conversation:", conversationKey)

          // Fetch other user profile
          const otherUserRef = doc(db, "profiles", otherUserId)
          const otherUserSnapshot = await getDoc(otherUserRef)
          const otherUserData = otherUserSnapshot.exists() ? otherUserSnapshot.data() : null

          // Fetch item details if available
          let itemData = null
          if (message.item_id) {
            const itemRef = doc(db, "items", message.item_id)
            const itemSnapshot = await getDoc(itemRef)
            itemData = itemSnapshot.exists() ? { id: itemSnapshot.id, ...itemSnapshot.data() } : null
          }

          conversationMap.set(conversationKey, {
            id: conversationKey,
            otherUserId,
            itemId: message.item_id || undefined,
            lastMessage: message,
            otherUser: otherUserData,
            item: itemData,
            unreadCount: message.receiver_id === user.uid && !message.read ? 1 : 0,
          })
        } else {
          // Update last message if this one is newer
          const existing = conversationMap.get(conversationKey)!
          if (
            !existing.lastMessage.created_at ||
            (message.created_at && message.created_at.seconds > existing.lastMessage.created_at.seconds)
          ) {
            existing.lastMessage = message
          }

          // Update unread count
          if (message.receiver_id === user.uid && !message.read) {
            existing.unreadCount = (existing.unreadCount || 0) + 1
          }
        }
      }

      console.log("Conversations created:", conversationMap.size)

      // Update counts
      setUnreadCount(unread)
      setArchivedCount(archived)
      setSpamCount(spam)
      setStarredCount(starred)
      setTrashCount(trash)

      // Convert to array and sort by last message time
      const conversationList = Array.from(conversationMap.values()).sort((a, b) => {
        if (!a.lastMessage.created_at) return 1
        if (!b.lastMessage.created_at) return -1
        return b.lastMessage.created_at.seconds - a.lastMessage.created_at.seconds
      })

      console.log("Final conversation list:", conversationList.length)
      setConversations(conversationList)

      // Update active conversation or select first one
      if (activeConversation) {
        const updatedConversation = conversationList.find((c) => c.id === activeConversation.id)
        if (updatedConversation) {
          setActiveConversation(updatedConversation)
        }
      } else if (conversationList.length > 0 && !itemId && !userId) {
        // Select first conversation by default if no specific conversation is requested
        setActiveConversation(conversationList[0])
        fetchMessages(conversationList[0].otherUserId, conversationList[0].itemId)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (otherUserId: string, itemId?: string | null) => {
    if (!user) return

    try {
      setIsLoading(true)
      setPage(1)
      setHasMore(true)

      console.log("Fetching messages between:", user.uid, "and", otherUserId, "for item:", itemId)

      // Build the query to get messages between these two users
      let messagesQuery

      if (itemId) {
        messagesQuery = query(
          collection(db, "messages"),
          where("item_id", "==", itemId),
          and(
            or(
              and(where("sender_id", "==", user.uid), where("receiver_id", "==", otherUserId)),
              and(where("sender_id", "==", otherUserId), where("receiver_id", "==", user.uid)),
            ),
          ),
          orderBy("created_at", "desc"),
          limit(20),
        )
      } else {
        messagesQuery = query(
          collection(db, "messages"),
          and(
            or(
              and(where("sender_id", "==", user.uid), where("receiver_id", "==", otherUserId)),
              and(where("sender_id", "==", otherUserId), where("receiver_id", "==", user.uid)),
            ),
          ),
          orderBy("created_at", "desc"),
          limit(20),
        )
      }

      const messagesSnapshot = await getDocs(messagesQuery)
      console.log("Messages found:", messagesSnapshot.docs.length)

      if (messagesSnapshot.empty) {
        setMessages([])
        setHasMore(false)
        setIsLoading(false)
        return
      }

      const messagesData = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      // Sort messages by time (oldest first)
      const sortedMessages = messagesData.sort((a, b) => a.created_at.seconds - b.created_at.seconds)

      setMessages(sortedMessages)
      setHasMore(messagesSnapshot.docs.length >= 20)

      // Mark received messages as read
      const unreadMessages = messagesData.filter((msg) => msg.receiver_id === user.uid && !msg.read)

      for (const msg of unreadMessages) {
        await updateDoc(doc(db, "messages", msg.id), { read: true })
      }

      // Update unread count in the active conversation
      if (activeConversation) {
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                unreadCount: 0,
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreMessages = async () => {
    if (!user || !activeConversation || isLoadingMore || !hasMore) return

    try {
      setIsLoadingMore(true)

      // Get the oldest message as the starting point
      const oldestMessage = messages[0]

      // Build the query
      let messagesQuery

      if (activeConversation.itemId) {
        messagesQuery = query(
          collection(db, "messages"),
          where("item_id", "==", activeConversation.itemId),
          and(
            or(
              and(where("sender_id", "==", user.uid), where("receiver_id", "==", activeConversation.otherUserId)),
              and(where("sender_id", "==", activeConversation.otherUserId), where("receiver_id", "==", user.uid)),
            ),
          ),
          orderBy("created_at", "desc"),
          startAfter(oldestMessage.created_at),
          limit(20),
        )
      } else {
        messagesQuery = query(
          collection(db, "messages"),
          and(
            or(
              and(where("sender_id", "==", user.uid), where("receiver_id", "==", activeConversation.otherUserId)),
              and(where("sender_id", "==", activeConversation.otherUserId), where("receiver_id", "==", user.uid)),
            ),
          ),
          orderBy("created_at", "desc"),
          startAfter(oldestMessage.created_at),
          limit(20),
        )
      }

      const messagesSnapshot = await getDocs(messagesQuery)

      if (messagesSnapshot.empty) {
        setHasMore(false)
        setIsLoadingMore(false)
        return
      }

      const newMessagesData = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      // Add new messages to the existing ones and sort
      const allMessages = [...messages, ...newMessagesData].sort((a, b) => a.created_at.seconds - b.created_at.seconds)

      setMessages(allMessages)
      setHasMore(messagesSnapshot.docs.length >= 20)
      setPage((prev) => prev + 1)
    } catch (error) {
      console.error("Error loading more messages:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      if (selectedFiles.length + messageImages.length > 3) {
        toast({
          title: "Too many images",
          description: "You can attach a maximum of 3 images per message",
          variant: "destructive",
        })
        return
      }

      const newImages = [...messageImages, ...selectedFiles]
      setMessageImages(newImages)

      // Create preview URLs
      const newImageUrls = selectedFiles.map((file) => URL.createObjectURL(file))
      setImageUrls([...imageUrls, ...newImageUrls])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...messageImages]
    newImages.splice(index, 1)
    setMessageImages(newImages)

    const newImageUrls = [...imageUrls]
    URL.revokeObjectURL(newImageUrls[index])
    newImageUrls.splice(index, 1)
    setImageUrls(newImageUrls)
  }

  const uploadMessageImages = async (): Promise<string[]> => {
    if (messageImages.length === 0) return []

    const uploadPromises = messageImages.map(async (image) => {
      const fileExt = image.name.split(".").pop()
      const fileName = `messages/${uuidv4()}.${fileExt}`
      const storageRef = ref(storage, fileName)

      await uploadBytes(storageRef, image)
      return getDownloadURL(storageRef)
    })

    return Promise.all(uploadPromises)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !activeConversation || (!newMessage.trim() && messageImages.length === 0)) return

    try {
      setIsSending(true)

      // Upload images if any
      let uploadedImageUrls: string[] = []
      if (messageImages.length > 0) {
        uploadedImageUrls = await uploadMessageImages()
      }

      console.log("Sending message from", user.uid, "to", activeConversation.otherUserId)

      // Create a single message document
      const messageData = {
        sender_id: user.uid,
        receiver_id: activeConversation.otherUserId,
        content: newMessage.trim(),
        item_id: activeConversation.itemId || null,
        read: false,
        created_at: serverTimestamp(),
        images: uploadedImageUrls,
        category: "inbox", // Default category for receiver
        starred: false,
      }

      const docRef = await addDoc(collection(db, "messages"), messageData)
      console.log("Message sent with ID:", docRef.id)

      // Clear input and images
      setNewMessage("")
      setMessageImages([])
      setImageUrls([])

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: docRef.id,
        ...messageData,
        created_at: Timestamp.now(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      })

      // Refresh conversations to update the list
      setTimeout(() => {
        fetchConversations()
      }, 500)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleMessageAction = async (messageId: string, action: string) => {
    if (!messageId || !user) return

    try {
      const messageRef = doc(db, "messages", messageId)

      switch (action) {
        case "archive":
          await updateDoc(messageRef, { category: "archived" })
          break
        case "unarchive":
          await updateDoc(messageRef, { category: "inbox" })
          break
        case "spam":
          await updateDoc(messageRef, { category: "spam" })
          break
        case "notspam":
          await updateDoc(messageRef, { category: "inbox" })
          break
        case "trash":
          await updateDoc(messageRef, { category: "trash" })
          break
        case "restore":
          await updateDoc(messageRef, { category: "inbox" })
          break
        case "delete":
          await deleteDoc(messageRef)
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
          fetchConversations()
          toast({
            title: "Success",
            description: "Message deleted successfully",
          })
          return
        case "star":
          await updateDoc(messageRef, { starred: true })
          break
        case "unstar":
          await updateDoc(messageRef, { starred: false })
          break
        default:
          return
      }

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const updates: any = {}
            if (action === "star") updates.starred = true
            if (action === "unstar") updates.starred = false
            if (["archive", "spam", "trash"].includes(action)) {
              updates.category = action === "archive" ? "archived" : action === "spam" ? "spam" : "trash"
            }
            if (["unarchive", "notspam", "restore"].includes(action)) {
              updates.category = "inbox"
            }
            return { ...msg, ...updates }
          }
          return msg
        }),
      )

      // Refresh conversations
      fetchConversations()

      toast({
        title: "Success",
        description: `Message ${action === "delete" ? "deleted" : "updated"} successfully`,
      })
    } catch (error) {
      console.error(`Error performing action ${action}:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} message`,
        variant: "destructive",
      })
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
    fetchMessages(conversation.otherUserId, conversation.itemId)
  }

  const filterConversations = () => {
    if (!conversations || !user) return []

    let filtered = conversations
    if (searchQuery) {
      filtered = filtered.filter(
        (conv) =>
          conv.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.item?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    console.log("Filtering conversations for tab:", activeTab, "Total conversations:", filtered.length)

    // Filter by tab - simplified logic
    switch (activeTab) {
      case "inbox":
        // Show conversations where user received messages (regardless of category for now)
        const inboxConversations = filtered.filter((conv) => {
          const msg = conv.lastMessage
          if (!msg) return false

          // Show if user is receiver OR if user is sender but there are received messages in this conversation
          return msg.receiver_id === user.uid || msg.sender_id === user.uid
        })
        console.log("Inbox conversations:", inboxConversations.length)
        return inboxConversations

      case "sent":
        // Show conversations where user sent the last message
        const sentConversations = filtered.filter((conv) => {
          const msg = conv.lastMessage
          return msg && msg.sender_id === user.uid
        })
        console.log("Sent conversations:", sentConversations.length)
        return sentConversations

      case "archived":
        return filtered.filter((conv) => {
          const msg = conv.lastMessage
          return msg && msg.category === "archived"
        })

      case "spam":
        return filtered.filter((conv) => {
          const msg = conv.lastMessage
          return msg && msg.category === "spam"
        })

      case "trash":
        return filtered.filter((conv) => {
          const msg = conv.lastMessage
          return msg && msg.category === "trash"
        })

      case "starred":
        return filtered.filter((conv) => {
          const msg = conv.lastMessage
          return msg && msg.starred
        })

      default:
        return filtered
    }
  }

  const formatMessageTime = (timestamp: Timestamp) => {
    if (!timestamp) return ""

    const date = timestamp.toDate()
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return format(date, "h:mm a")
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return format(date, "EEEE")
    } else {
      return format(date, "MMM d")
    }
  }

  const getMessageCategory = (message: Message) => {
    if (!user) return "Unknown"

    if (message.category === "archived") return "Archived"
    if (message.category === "spam") return "Spam"
    if (message.category === "trash") return "Trash"
    if (message.sender_id === user.uid) return "Sent"
    return "Inbox"
  }

  const handleTabChange = (tab: string) => {
    console.log("Changing tab to:", tab)
    setActiveTab(tab)
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* Message Sidebar */}
      <div className="hidden md:block w-64 shrink-0 h-full">
        <MessageSidebar
          activeTab={activeTab}
          unreadCount={unreadCount}
          archivedCount={archivedCount}
          spamCount={spamCount}
          starredCount={starredCount}
          trashCount={trashCount}
          onTabChange={handleTabChange}
          userData={userData}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Mobile header only */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[150px] bg-slate-900/50 border-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 flex-1 overflow-hidden">
          {/* Conversations List */}
          <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 md:col-span-1 flex flex-col rounded-none md:rounded-lg md:m-2">
            <CardHeader className="p-4 space-y-2">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {filterConversations().length > 0 ? (
                  <div>
                    {filterConversations().map((conversation) => (
                      <div key={conversation.id}>
                        <button
                          onClick={() => selectConversation(conversation)}
                          className={`w-full text-left p-4 hover:bg-slate-800/50 transition-colors ${
                            activeConversation?.id === conversation.id ? "bg-slate-800/70" : ""
                          } ${conversation.unreadCount > 0 ? "border-l-2 border-blue-500" : ""}`}
                        >
                          <div className="flex items-start">
                            <div className="relative mr-3">
                              <Avatar className="h-10 w-10 border border-slate-700">
                                <AvatarImage
                                  src={conversation.otherUser?.avatar_url || ""}
                                  alt={conversation.otherUser?.username}
                                />
                                <AvatarFallback className="bg-slate-700">
                                  {conversation.otherUser?.username?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.item?.type === "lost" ? (
                                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                                  <AlertTriangle className="h-3 w-3 text-white" />
                                </div>
                              ) : conversation.item?.type === "found" ? (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                              ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <span
                                  className={`font-medium ${conversation.unreadCount > 0 ? "text-white font-semibold" : "text-slate-300"}`}
                                >
                                  {conversation.otherUser?.username || "Unknown User"}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {conversation.lastMessage?.created_at
                                    ? formatMessageTime(conversation.lastMessage.created_at)
                                    : ""}
                                </span>
                              </div>
                              {conversation.item && (
                                <div className="text-xs text-slate-400 truncate">Item: {conversation.item?.name}</div>
                              )}
                              <div
                                className={`text-xs ${
                                  conversation.unreadCount > 0 ? "text-white font-medium" : "text-slate-500"
                                } truncate mt-1 flex items-center`}
                              >
                                {conversation.lastMessage?.sender_id === user?.uid ? (
                                  <MailPlus className="h-3 w-3 mr-1 text-slate-400" />
                                ) : (
                                  <Mail className="h-3 w-3 mr-1 text-slate-400" />
                                )}
                                <span className="truncate">
                                  {conversation.lastMessage?.sender_id === user?.uid ? "You: " : ""}
                                  {conversation.lastMessage?.content || "No messages yet"}
                                </span>
                                {conversation.lastMessage?.images?.length > 0 && (
                                  <span className="ml-1 inline-flex items-center whitespace-nowrap">
                                    <Paperclip className="h-3 w-3 mx-1" />
                                    {conversation.lastMessage.images.length}
                                  </span>
                                )}
                                {conversation.lastMessage?.starred && <Star className="h-3 w-3 ml-1 text-yellow-500" />}
                              </div>
                              {conversation.unreadCount > 0 && (
                                <div className="mt-1">
                                  <Badge className="bg-blue-600 text-white text-xs">
                                    {conversation.unreadCount} new
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                        <Separator />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                    <p className="font-medium">No conversations found</p>
                    <p className="text-sm mt-1">
                      {searchQuery
                        ? "Try a different search term"
                        : activeTab === "inbox"
                          ? "Your inbox is empty"
                          : activeTab === "sent"
                            ? "You haven't sent any messages"
                            : activeTab === "archived"
                              ? "No archived messages"
                              : activeTab === "spam"
                                ? "No spam messages"
                                : activeTab === "trash"
                                  ? "Trash is empty"
                                  : "No starred messages"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 md:col-span-2 flex flex-col rounded-none md:rounded-lg md:m-2">
            {activeConversation ? (
              <>
                <CardHeader className="p-4 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage
                          src={activeConversation.otherUser?.avatar_url || ""}
                          alt={activeConversation.otherUser?.username}
                        />
                        <AvatarFallback className="bg-slate-700">
                          {activeConversation.otherUser?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{activeConversation.otherUser?.username}</CardTitle>
                        {activeConversation.item && (
                          <div className="text-sm text-slate-400">
                            {activeConversation.item.type === "lost" ? "Lost" : "Found"} Item:{" "}
                            {activeConversation.item.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/items/${activeConversation.itemId}`)}
                              disabled={!activeConversation.itemId}
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Item Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/profile?user=${activeConversation.otherUserId}`)}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Profile</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-28rem)]">
                    <div className="p-4 space-y-4">
                      {hasMore && (
                        <div className="text-center">
                          <Button variant="outline" size="sm" onClick={loadMoreMessages} disabled={isLoadingMore}>
                            {isLoadingMore ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              "Load older messages"
                            )}
                          </Button>
                        </div>
                      )}

                      {messages.length > 0 ? (
                        messages.map((message, index) => (
                          <div
                            key={message.id || index}
                            className={`flex ${message.sender_id === user?.uid ? "justify-end" : "justify-start"}`}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`max-w-[80%] rounded-lg p-3 relative group ${
                                message.sender_id === user?.uid
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-800 text-slate-200"
                              }`}
                            >
                              {/* Message content */}
                              {message.content && <p>{message.content}</p>}

                              {/* Message images */}
                              {message.images && message.images.length > 0 && (
                                <div
                                  className={`grid ${message.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2 mt-2`}
                                >
                                  {message.images.map((img, i) => (
                                    <Dialog key={i}>
                                      <DialogTrigger asChild>
                                        <img
                                          src={img || "/placeholder.svg"}
                                          alt={`Attachment ${i + 1}`}
                                          className="rounded-md cursor-pointer hover:opacity-90 transition-opacity max-h-40 object-cover w-full"
                                        />
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl">
                                        <img
                                          src={img || "/placeholder.svg"}
                                          alt={`Attachment ${i + 1}`}
                                          className="w-full h-auto max-h-[80vh] object-contain"
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  ))}
                                </div>
                              )}

                              {/* Message metadata */}
                              <div className="flex items-center justify-between mt-1">
                                <div
                                  className={`text-xs ${
                                    message.sender_id === user?.uid ? "text-blue-200" : "text-slate-400"
                                  }`}
                                >
                                  {message.created_at && typeof message.created_at.toDate === "function"
                                    ? message.created_at.toDate().toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : new Date().toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                </div>

                                {/* Message status */}
                                <div className="text-xs ml-2">
                                  {message.sender_id === user?.uid && (
                                    <span className={message.read ? "text-green-300" : "text-blue-200"}>
                                      {message.read ? "Read" : "Sent"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Message actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-slate-800/80 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="19" cy="12" r="1" />
                                      <circle cx="5" cy="12" r="1" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                  {message.starred ? (
                                    <DropdownMenuItem
                                      onClick={() => handleMessageAction(message.id, "unstar")}
                                      className="flex items-center"
                                    >
                                      <StarOff className="h-4 w-4 mr-2" />
                                      <span>Unstar</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleMessageAction(message.id, "star")}
                                      className="flex items-center"
                                    >
                                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                                      <span>Star</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem
                                    onClick={() => handleMessageAction(message.id, "archive")}
                                    className="flex items-center"
                                  >
                                    <ArchiveIcon className="h-4 w-4 mr-2" />
                                    <span>Archive</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleMessageAction(message.id, "spam")}
                                    className="flex items-center"
                                  >
                                    <CircleAlert className="h-4 w-4 mr-2" />
                                    <span>Mark as Spam</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleMessageAction(message.id, "trash")}
                                    className="flex items-center"
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    <span>Move to Trash</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleMessageAction(message.id, "delete")}
                                    className="text-red-500 hover:text-red-600 flex items-center"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    <span>Delete Forever</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </motion.div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-400 py-8">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                          <p>No messages yet</p>
                          <p className="text-sm mt-1">Start the conversation by sending a message</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                <div className="p-4 border-t border-slate-800">
                  {/* Image previews */}
                  {imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative h-16 w-16 rounded-md overflow-hidden group">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500 rounded-full p-1 transform transition-transform hover:scale-110"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="resize-none min-h-[80px] pr-10"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(e)
                          }
                        }}
                      />
                      <div className="absolute bottom-2 right-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={messageImages.length >= 3}
                              >
                                <ImageIcon className="h-5 w-5 text-slate-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Attach images (max 3)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSending || (!newMessage.trim() && messageImages.length === 0)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-700" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-slate-400">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
