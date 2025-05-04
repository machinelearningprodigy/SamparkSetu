"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Send, AlertTriangle, CheckCircle } from "lucide-react"
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
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function ChatPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const itemId = searchParams.get("item")
  const { toast } = useToast()

  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [itemDetails, setItemDetails] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Fetch all conversations where the user is either sender or receiver
        const sentMessagesQuery = query(
          collection(db, "messages"),
          where("sender_id", "==", user.uid),
          orderBy("created_at", "desc"),
        )

        const receivedMessagesQuery = query(
          collection(db, "messages"),
          where("receiver_id", "==", user.uid),
          orderBy("created_at", "desc"),
        )

        const [sentMessagesSnapshot, receivedMessagesSnapshot] = await Promise.all([
          getDocs(sentMessagesQuery),
          getDocs(receivedMessagesQuery),
        ])

        const sentMessages = sentMessagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        const receivedMessages = receivedMessagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Combine all messages
        const allMessages = [...sentMessages, ...receivedMessages]

        // Group messages by conversation (unique combination of sender, receiver, and item)
        const conversationMap = new Map()

        for (const message of allMessages) {
          const otherUserId = message.sender_id === user.uid ? message.receiver_id : message.sender_id
          const conversationKey = `${otherUserId}-${message.item_id}`

          if (!conversationMap.has(conversationKey)) {
            // Fetch other user profile
            const otherUserRef = doc(db, "profiles", otherUserId)
            const otherUserSnapshot = await getDoc(otherUserRef)
            const otherUserData = otherUserSnapshot.exists() ? otherUserSnapshot.data() : null

            // Fetch item details
            const itemRef = doc(db, "items", message.item_id)
            const itemSnapshot = await getDoc(itemRef)
            const itemData = itemSnapshot.exists() ? { id: itemSnapshot.id, ...itemSnapshot.data() } : null

            conversationMap.set(conversationKey, {
              id: conversationKey,
              otherUserId,
              itemId: message.item_id,
              lastMessage: message,
              otherUser: otherUserData,
              item: itemData,
            })
          }
        }

        const conversationList = Array.from(conversationMap.values())
        setConversations(conversationList)

        // If itemId is provided in URL, open that conversation
        if (itemId) {
          const conversation = conversationList.find((conv) => conv.itemId === itemId)
          if (conversation) {
            setActiveConversation(conversation)
            fetchMessages(conversation.otherUserId, itemId)
          } else {
            // Fetch item details to start a new conversation
            const itemRef = doc(db, "items", itemId)
            const itemSnapshot = await getDoc(itemRef)

            if (itemSnapshot.exists()) {
              const itemData = { id: itemSnapshot.id, ...itemSnapshot.data() }

              // Fetch item owner profile
              const ownerRef = doc(db, "profiles", itemData.user_id)
              const ownerSnapshot = await getDoc(ownerRef)
              const ownerData = ownerSnapshot.exists() ? ownerSnapshot.data() : null

              setItemDetails(itemData)
              const newConversation = {
                id: `${itemData.user_id}-${itemId}`,
                otherUserId: itemData.user_id,
                itemId,
                otherUser: ownerData,
                item: itemData,
              }
              setActiveConversation(newConversation)
            }
          }
        } else if (conversationList.length > 0) {
          // Open first conversation by default
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

    fetchConversations()

    // Set up real-time subscription for new messages
    let unsubscribe: () => void = () => {}

    if (user) {
      const messagesQuery = query(
        collection(db, "messages"),
        where("receiver_id", "==", user.uid),
        orderBy("created_at", "desc"),
      )

      unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newMessage = { id: change.doc.id, ...change.doc.data() }

            // Update messages if in the active conversation
            if (
              activeConversation &&
              newMessage.sender_id === activeConversation.otherUserId &&
              newMessage.item_id === activeConversation.itemId
            ) {
              setMessages((prev) => [...prev, newMessage])
            }

            // Update conversations list
            fetchConversations()
          }
        })
      })
    }

    return () => {
      unsubscribe()
    }
  }, [user, itemId, toast])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async (otherUserId: string, itemId: string) => {
    if (!user) return

    try {
      // Query for messages between the two users about this item
      const messagesQuery = query(
        collection(db, "messages"),
        where("item_id", "==", itemId),
        orderBy("created_at", "asc"),
      )

      const messagesSnapshot = await getDocs(messagesQuery)
      const messagesData = messagesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (msg) =>
            (msg.sender_id === user.uid && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === user.uid),
        )

      setMessages(messagesData)

      // Mark messages as read
      const unreadMessages = messagesData.filter(
        (msg) => msg.receiver_id === user.uid && msg.sender_id === otherUserId && !msg.read,
      )

      for (const msg of unreadMessages) {
        await updateDoc(doc(db, "messages", msg.id), {
          read: true,
        })
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !activeConversation || !newMessage.trim()) return

    try {
      const messageData = {
        sender_id: user.uid,
        receiver_id: activeConversation.otherUserId,
        content: newMessage.trim(),
        item_id: activeConversation.itemId,
        read: false,
        created_at: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "messages"), messageData)

      // Optimistically add message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...messageData,
          created_at: new Date(), // Use current date for UI until the server timestamp comes back
        },
      ])

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const selectConversation = (conversation: any) => {
    setActiveConversation(conversation)
    fetchMessages(conversation.otherUserId, conversation.itemId)
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
      <h1 className="text-2xl font-bold">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-13rem)]">
        {/* Conversations List */}
        <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 md:col-span-1">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {conversations.length > 0 ? (
                <div>
                  {conversations.map((conversation) => (
                    <div key={conversation.id}>
                      <button
                        onClick={() => selectConversation(conversation)}
                        className={`w-full text-left p-4 hover:bg-slate-800/50 transition-colors ${
                          activeConversation?.id === conversation.id ? "bg-slate-800/70" : ""
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="relative mr-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                              {conversation.otherUser?.avatar_url ? (
                                <img
                                  src={conversation.otherUser.avatar_url || "/placeholder.svg"}
                                  alt={conversation.otherUser.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-medium">
                                  {conversation.otherUser?.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {conversation.item?.type === "lost" ? (
                              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                                <AlertTriangle className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{conversation.otherUser?.username}</div>
                            <div className="text-sm text-slate-400 truncate">{conversation.item?.name}</div>
                            {conversation.lastMessage && (
                              <div className="text-xs text-slate-500 truncate mt-1">
                                {conversation.lastMessage.sender_id === user?.uid ? "You: " : ""}
                                {conversation.lastMessage.content}
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
                  <p>No conversations yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 md:col-span-2 flex flex-col">
          {activeConversation ? (
            <>
              <CardHeader className="p-4 border-b border-slate-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                    {activeConversation.otherUser?.avatar_url ? (
                      <img
                        src={activeConversation.otherUser.avatar_url || "/placeholder.svg"}
                        alt={activeConversation.otherUser.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {activeConversation.otherUser?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{activeConversation.otherUser?.username}</CardTitle>
                    <CardDescription>{activeConversation.item?.name}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-28rem)]">
                  <div className="p-4 space-y-4">
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
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender_id === user?.uid ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            <p>{message.content}</p>
                            <div
                              className={`text-xs mt-1 ${
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
                          </motion.div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 py-8">
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation by sending a message</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-4 border-t border-slate-800">
                <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-slate-400">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
