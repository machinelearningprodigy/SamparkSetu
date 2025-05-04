"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Clock, CheckCheck, Search, Trash2, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore"
import { ref, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

export default function FoundItemsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchFoundItems = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        const itemsQuery = query(
          collection(db, "items"),
          where("user_id", "==", user.uid),
          where("type", "==", "found"),
          orderBy("created_at", "desc"),
        )

        const querySnapshot = await getDocs(itemsQuery)
        const itemsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setItems(itemsData)
      } catch (error) {
        console.error("Error fetching found items:", error)
        toast({
          title: "Error",
          description: "Failed to load your found items",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFoundItems()
  }, [user, toast])

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      setIsDeleting(true)

      // Get the item to delete (for image cleanup)
      const itemToDeleteData = items.find((item) => item.id === itemToDelete)

      // Delete the item from Firestore
      await deleteDoc(doc(db, "items", itemToDelete))

      // Delete associated images if they exist
      if (itemToDeleteData?.images && itemToDeleteData.images.length > 0) {
        for (const imageUrl of itemToDeleteData.images) {
          try {
            // Extract file path from URL
            const imageRef = ref(storage, imageUrl)
            await deleteObject(imageRef)
          } catch (imageError) {
            console.error("Error deleting image:", imageError)
            // Continue with other images even if one fails
          }
        }
      }

      // Update the UI
      setItems(items.filter((item) => item.id !== itemToDelete))

      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "matched":
        return <Search className="h-5 w-5 text-blue-500" />
      case "claimed":
        return <CheckCheck className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "matched":
        return "Potential Match"
      case "claimed":
        return "Claimed"
      case "closed":
        return "Closed"
      default:
        return status
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Found Items</h1>
        <Button asChild variant="default" size="sm">
          <Link href="/report/found">
            <CheckCircle className="mr-2 h-4 w-4" />
            Report New Found Item
          </Link>
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-48 relative">
                    <img
                      src={
                        item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg?height=200&width=200"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-green-600 text-white text-xs font-medium">
                      Found
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="text-sm text-slate-400">
                            <span className="font-medium text-slate-300">Category:</span> {item.category}
                          </div>
                          <div className="text-sm text-slate-400">
                            <span className="font-medium text-slate-300">Date:</span> {item.date}
                          </div>
                          <div className="text-sm text-slate-400">
                            <span className="font-medium text-slate-300">Location:</span> {item.location}
                          </div>
                          <div className="text-sm text-slate-400 flex items-center">
                            <span className="font-medium text-slate-300 mr-1">Status:</span>
                            <span className="flex items-center">
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{getStatusText(item.status)}</span>
                            </span>
                          </div>
                          {item.condition && (
                            <div className="text-sm text-slate-400">
                              <span className="font-medium text-slate-300">Condition:</span> {item.condition}
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-sm text-slate-400 mb-4">
                            <span className="font-medium text-slate-300">Description:</span>
                            <p className="mt-1">{item.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/items/${item.id}`}>
                            View Details
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/edit/${item.id}`}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setItemToDelete(item.id)}>
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Item</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this item? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setItemToDelete(null)}>
                                Cancel
                              </Button>
                              <Button variant="destructive" onClick={handleDeleteItem} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
          <CardHeader>
            <CardTitle>No Found Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">You haven't reported any found items yet.</p>
            <Button asChild>
              <Link href="/report/found">
                <CheckCircle className="mr-2 h-4 w-4" />
                Report a Found Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
