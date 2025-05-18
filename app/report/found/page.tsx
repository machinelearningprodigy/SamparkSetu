"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Upload, X, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadMultipleImages } from "@/lib/image-upload"
import { Progress } from "@/components/ui/progress"

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

export default function ReportFoundItemPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    condition: "",
  })

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      if (selectedFiles.length + images.length > 3) {
        toast({
          title: "Too many images",
          description: "You can upload a maximum of 3 images",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to report an item",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!formData.name || !formData.category || !formData.location || !date || !formData.condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setUploadStatus("Preparing submission...")
      setUploadProgress(10)

      // Upload images if any
      let uploadedImageUrls: string[] = []

      if (images.length > 0) {
        setUploadStatus("Uploading images...")
        setUploadProgress(20)

        try {
          // Use MongoDB for image storage
          uploadedImageUrls = await uploadMultipleImages(images, false, "items")
          setUploadProgress(70)
          setUploadStatus("Images uploaded successfully!")
        } catch (imageError) {
          console.error("Error uploading images:", imageError)
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload images. Please try again.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      setUploadStatus("Creating item record...")
      setUploadProgress(80)

      // Create item record in Firestore
      await addDoc(collection(db, "items"), {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        date: date ? format(date, "yyyy-MM-dd") : "",
        type: "found",
        status: "pending",
        user_id: user.uid,
        images: uploadedImageUrls,
        condition: formData.condition,
        created_at: serverTimestamp(),
      })


      setUploadProgress(100)
      setUploadStatus("Success!")

      toast({
        title: "Success",
        description: "Your found item has been reported successfully!",
      })

      
      router.push("/dashboard/found")
    } catch (error: any) {
      console.error("Error in form submission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to report found item",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-teal-500/5 pointer-events-none"></div>
            <CardHeader className="relative">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <CardTitle>Report a Found Item</CardTitle>
              </div>
              <CardDescription>
                Provide details about the item you found to help reunite it with its owner.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 relative">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Black Leather Wallet"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-800/50 border-slate-700 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-200">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 focus:border-green-500 focus:ring-green-500/20">
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

                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-slate-200">
                    Condition <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    required
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 focus:border-green-500 focus:ring-green-500/20">
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

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-200">
                    Location Found <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Central Park, New York"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="bg-slate-800/50 border-slate-700 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Date Found <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-slate-800/50 border-slate-700 hover:bg-slate-700/50",
                          !date && "text-muted-foreground",
                        )}
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
                  <Label htmlFor="description" className="text-slate-200">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the found item..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="bg-slate-800/50 border-slate-700 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Upload Images (Max 3)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500 rounded-full p-1 transform transition-transform hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {images.length < 3 && (
                      <label className="border-2 border-dashed border-slate-700 rounded-md flex flex-col items-center justify-center h-24 cursor-pointer hover:border-green-500 transition-colors bg-slate-800/30">
                        <Upload className="h-6 w-6 mb-1 text-slate-400" />
                        <span className="text-xs text-slate-400">Upload</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Supported formats: JPG, PNG, GIF (Max 5MB each)</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                {isSubmitting && (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{uploadStatus}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1" />
                  </div>
                )}
                <div className="flex justify-between w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
