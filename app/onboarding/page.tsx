"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { User, Phone, MapPin, Loader2, Camera, Mail, Briefcase, AlertCircle } from "lucide-react"
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadProfileImage } from "@/lib/image-upload"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    bio: "",
    gender: "",
    occupation: "",
    interests: "",
  })

  // Add this at the top of the component, right after the useState declarations
  useEffect(() => {
    // Mark that user needs onboarding when they visit this page
    if (user) {
      localStorage.setItem("needsOnboarding", "true")
    }
  }, [user])

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      console.log("No user found, redirecting to login")
      router.push("/login")
      return
    }

    console.log("User found in onboarding page:", user.email)

    // Check if user already completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        console.log("Checking onboarding status for user:", user.uid)
        const profileRef = doc(db, "profiles", user.uid)
        const profileSnap = await getDoc(profileRef)

        console.log("Profile exists:", profileSnap.exists())
        console.log("Profile data:", profileSnap.exists() ? profileSnap.data() : null)

        if (profileSnap.exists() && profileSnap.data().onboarded) {
          // User already completed onboarding, redirect to dashboard
          console.log("User already onboarded, redirecting to dashboard")
          router.push("/dashboard")
          return
        }

        // Pre-fill data if available
        if (profileSnap.exists()) {
          const data = profileSnap.data()
          console.log("Pre-filling form with existing data")
          setFormData({
            username: data.username || "",
            full_name: data.full_name || user.displayName || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            bio: data.bio || "",
            gender: data.gender || "",
            occupation: data.occupation || "",
            interests: data.interests || "",
          })

          if (data.avatar_url) {
            setAvatarPreview(data.avatar_url)
          }
        } else {
          // Create a new profile if it doesn't exist
          console.log("Profile doesn't exist, creating a new one")
          const newProfile = {
            id: user.uid,
            username: user.displayName?.split(" ")[0].toLowerCase() || `user_${user.uid.substring(0, 5)}`,
            full_name: user.displayName || "",
            email: user.email || "",
            avatar_url: user.photoURL || "",
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            is_admin: false,
            onboarded: false,
          }

          await setDoc(profileRef, newProfile)

          // Set display name if available
          if (user.displayName) {
            setFormData((prev) => ({
              ...prev,
              full_name: user.displayName || "",
            }))
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error checking onboarding status:", error)
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [user, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setUploadError(null) // Clear any previous errors
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate first step
      if (!formData.full_name || !formData.username) {
        toast({
          title: "Missing Information",
          description: "Please fill in your full name and username",
          variant: "destructive",
        })
        return
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Modify the handleSubmit function to update localStorage when onboarding is complete
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError(null)

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to complete onboarding",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Validate required fields
    if (!formData.username || !formData.full_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Submitting onboarding form for user:", user.uid)

      // Upload avatar if provided
      let avatarUrl = null
      if (avatarFile) {
        try {
          console.log("Uploading avatar image")
          avatarUrl = await uploadProfileImage(avatarFile, user.uid)
          console.log("Avatar uploaded successfully:", avatarUrl)
        } catch (error) {
          console.error("Error uploading avatar:", error)
          setUploadError(`Failed to upload image: ${error instanceof Error ? error.message : String(error)}`)

          // Continue with profile update even if avatar upload failed
          toast({
            title: "Warning",
            description: "Profile will be updated without the new avatar image",
          })
        }
      }

      // Prepare profile data
      const profileData = {
        ...formData,
        avatar_url: avatarUrl || avatarPreview || "",
        onboarded: true,
        updated_at: serverTimestamp(),
      }

      console.log("Saving profile data to Firestore:", profileData)

      // Update profile in Firestore
      const profileRef = doc(db, "profiles", user.uid)
      await updateDoc(profileRef, profileData)

      console.log("Profile updated successfully")

      // Update localStorage to indicate onboarding is complete
      localStorage.setItem("needsOnboarding", "false")

      toast({
        title: "Success",
        description: "Your profile has been set up successfully!",
      })

      // Redirect to dashboard
      console.log("Redirecting to dashboard")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error in onboarding:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-800">
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Let's set up your profile to help you get the most out of our platform
                </CardDescription>

                {/* Progress Bar */}
                <div className="w-full mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-400">
                      Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-xs text-slate-400">
                      {Math.round((currentStep / totalSteps) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
                      animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="p-6 space-y-6">
                  {uploadError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white">Basic Information</h3>

                      {/* Avatar Upload */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                          <Avatar className="w-32 h-32 border-4 border-slate-700 group-hover:border-blue-500 transition-all duration-300">
                            <AvatarImage src={avatarPreview || ""} alt="Profile" className="object-cover" />
                            <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-600 to-purple-700">
                              {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <Label
                            htmlFor="avatar"
                            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-200"
                          >
                            <Camera className="h-5 w-5" />
                          </Label>
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </div>
                        <p className="text-sm text-slate-400">Upload a profile picture (optional)</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-slate-300">
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="full_name"
                              type="text"
                              value={formData.full_name}
                              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                              className="pl-10 bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
                              placeholder="John Doe"
                              required
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-slate-300">
                            Username <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="username"
                              type="text"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              className="pl-10 bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
                              placeholder="johndoe"
                              required
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-300">
                            Email
                          </Label>
                          <div className="relative">
                            <Input
                              id="email"
                              type="email"
                              value={user?.email || ""}
                              className="pl-10 bg-slate-800 border-slate-700 text-white"
                              disabled
                            />
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                          <p className="text-xs text-slate-500">Email cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-slate-300">
                            Phone Number
                          </Label>
                          <div className="relative">
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="pl-10 bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
                              placeholder="+1 (555) 123-4567"
                            />
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white">Personal Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-slate-300">
                            Gender
                          </Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData({ ...formData, gender: value })}
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="occupation" className="text-slate-300">
                            Occupation
                          </Label>
                          <div className="relative">
                            <Input
                              id="occupation"
                              type="text"
                              value={formData.occupation}
                              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                              className="pl-10 bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
                              placeholder="Software Engineer"
                            />
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-slate-300">
                          About You
                        </Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us a bit about yourself..."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={4}
                          className="bg-slate-800 border-slate-700 focus:border-blue-500 text-white resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interests" className="text-slate-300">
                          Interests
                        </Label>
                        <Textarea
                          id="interests"
                          placeholder="What are your hobbies and interests?"
                          value={formData.interests}
                          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                          rows={3}
                          className="bg-slate-800 border-slate-700 focus:border-blue-500 text-white resize-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white">Location Information</h3>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-300">
                          Address
                        </Label>
                        <div className="relative">
                          <Input
                            id="address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="pl-10 bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
                            placeholder="123 Main St"
                          />
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-300">
                            City
                          </Label>
                          <Input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
                            placeholder="New York"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-slate-300">
                            State
                          </Label>
                          <Input
                            id="state"
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
                            placeholder="NY"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                        <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          Location Privacy
                        </h4>
                        <p className="text-sm text-slate-300">
                          Your location information helps us connect you with lost and found items in your area. This
                          information is only shared with users when you explicitly approve a match.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between border-t border-slate-800 p-6 bg-slate-900/50">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? "Saving..." : "Complete Profile Setup"}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
