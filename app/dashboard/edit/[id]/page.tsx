"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parse } from "date-fns"
import { CalendarIcon, Upload, X, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "wallets", label: "Wallets & Purses" },
  { value: "keys", label: "Keys" },
  { value: "documents", label: "Documents" },
  { value: "jewelry", label: "Jewelry" },
  { value: "clothing", label: "Clothing" },
  { value: "bags", label: "Bags & Luggage" },
  { value: "pets", label: "Pets" },
  { value: "other", label: "Other" },
]

const conditions = [
  { value: "new", label: "New / Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "damaged", label: "Damaged" },
]

export default function EditItemPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [item, setItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    condition: "",
  })

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      if (!id || !user) return

      try {
        setIsLoading(true)

        const itemRef = doc(db, "items", id as string)
        const itemSnapshot = await getDoc(itemRef)

        if (!itemSnapshot.exists()) {
          throw new Error("Item not found")
        }

        const itemData = {
          id: itemSnapshot.id,
          ...itemSnapshot.data(),
        }

        // Check if the item belongs to the current user
        if (itemData.user_id !== user.uid) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to edit this item",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setItem(itemData)
        setFormData({
          name: itemData.name || "",
          category: itemData.category || "",
          location: itemData.location || "",
          description: itemData.description || "",
          condition: itemData.condition || "",
        })

        if (itemData.date) {
          setDate(parse(itemData.date, "yyyy-MM-dd", new Date()))
        }

        if (itemData.images && itemData.images.length > 0) {
          setExistingImages(itemData.images)
        }
      } catch (error) {
        console.error("Error fetching item:", error)
        toast({
          title: "Error",
          description: "Failed to load item details",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  }, [id, user, router, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      if (selectedFiles.length + images.length + existingImages.length > 3) {
        toast({
          title: "Too many images",
          description: "You can have a maximum of 3 images",
          variant: "destructive",
        })
        return
      }

      const newImages = [...images, ...selectedFiles]
      setImages(newImages)

      // Create preview URLs
      const newImageUrls = selectedFiles.map((file) => URL.createObjectURL(file))
      setImageUrls([...imageUrls, ...newImageUrls])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)

    const newImageUrls = [...imageUrls]
    URL.revokeObjectURL(newImageUrls[index])
    newImageUrls.splice(index, 1)
    setImageUrls(newImageUrls)
  }

  const removeExistingImage = (index: number) => {
    const newExistingImages = [...existingImages]
    newExistingImages.splice(index, 1)
    setExistingImages(newExistingImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !item) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update an item",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!formData.name || !formData.category || !formData.location || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Upload new images if any
      const uploadedImageUrls: string[] = []

      if (images.length > 0) {
        for (const image of images) {
          try {
            const fileExt = image.name.split(".").pop()
            const fileName = `${item.type}-${uuidv4()}.${fileExt}`
            const filePath = `item-images/${fileName}`

            // Create a reference to the file location in Firebase Storage
            const storageRef = ref(storage, filePath)

            // Upload the file
            await uploadBytes(storageRef, image)

            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef)

            uploadedImageUrls.push(downloadURL)
          } catch (imageError) {
            console.error("Error processing image:", imageError)
            // Continue with other images
          }
        }
      }

      // Combine existing and new images
      const updatedImages = [...existingImages, ...uploadedImageUrls]

      // Update item record in Firestore
      const itemRef = doc(db, "items", id as string)
      await updateDoc(itemRef, {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        date: date ? format(date, "yyyy-MM-dd") : "",
        images: updatedImages,
        condition: formData.condition,
        updated_at: serverTimestamp(),
      })

      toast({
        title: "Success",
        description: "Item updated successfully!",
      })

      router.push(item.type === "lost" ? "/dashboard/lost" : "/dashboard/found")
    } catch (error: any) {
      console.error("Error in form submission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
        <p className="text-slate-400 mb-6">The item you're trying to edit doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit {item.type === "lost" ? "Lost" : "Found"} Item</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            {item.type === "lost" ? (
              <AlertTriangle className="h-6 w-6 text-red-500" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            <CardTitle>Edit {item.type === "lost" ? "Lost" : "Found"} Item</CardTitle>
          </div>
          <CardDescription>Update the details of your {item.type === "lost" ? "lost" : "found"} item.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Black Leather Wallet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {item.type === "found" && (
              <div className="space-y-2">
                <Label htmlFor="condition">
                  Condition <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  required={item.type === "found"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., Central Park, New York"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Date {item.type === "lost" ? "Lost" : "Found"} <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={`Provide a detailed description of your ${item.type === "lost" ? "lost" : "found"} item...`}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Images (Max 3)</Label>
              <div className="grid grid-cols-3 gap-4">
                {/* Existing Images */}
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* New Images */}
                {imageUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {existingImages.length + images.length < 3 && (
                  <label className="border-2 border-dashed border-slate-700 rounded-md flex flex-col items-center justify-center h-24 cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="h-6 w-6 mb-1 text-slate-400" />
                    <span className="text-xs text-slate-400">Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-xs text-slate-400">Supported formats: JPG, PNG, GIF (Max 5MB each)</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`bg-gradient-to-r ${
                item.type === "lost"
                  ? "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Item"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
