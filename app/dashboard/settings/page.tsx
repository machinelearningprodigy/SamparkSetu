"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { User, Mail, Key, Upload, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: "",
    full_name: "",
    email: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        const profileRef = doc(db, "profiles", user.uid)
        const profileSnapshot = await getDoc(profileRef)

        if (!profileSnapshot.exists()) {
          throw new Error("Profile not found")
        }

        const profileData = {
          id: profileSnapshot.id,
          ...profileSnapshot.data(),
        }

        setProfile(profileData)
        setProfileForm({
          username: profileData.username || "",
          full_name: profileData.full_name || "",
          email: user.email || "",
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, toast])

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
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null

    try {
      setIsUploading(true)

      // Upload to Firebase Storage
      const fileExt = avatarFile.name.split(".").pop()
      const fileName = `avatar-${uuidv4()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Create a reference to the file location in Firebase Storage
      const storageRef = ref(storage, filePath)

      // Upload the file
      await uploadBytes(storageRef, avatarFile)

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef)

      return downloadURL
    } catch (error) {
      console.error("Error uploading avatar:", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setIsSaving(true)

      // Upload avatar if changed
      let avatarUrl = profile.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
        if (!avatarUrl) {
          toast({
            title: "Warning",
            description: "Profile updated but avatar upload failed",
          })
          // Continue with profile update even if avatar upload failed
        }
      }

      // Update profile in Firestore
      const profileRef = doc(db, "profiles", user.uid)
      await updateDoc(profileRef, {
        username: profileForm.username,
        full_name: profileForm.full_name,
        avatar_url: avatarUrl || profile.avatar_url,
        updated_at: serverTimestamp(),
      })

      // Update email if changed
      if (profileForm.email !== user.email) {
        await updateEmail(user, profileForm.email)
      }

      toast({
        title: "Success",
        description: "Your profile has been updated",
      })

      // Update local state
      setProfile({
        ...profile,
        username: profileForm.username,
        full_name: profileForm.full_name,
        email: profileForm.email,
        avatar_url: avatarUrl || profile.avatar_url,
      })

      // Clear avatar file state
      setAvatarFile(null)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      setIsChangingPassword(true)

      // Re-authenticate user before changing password
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword)
        await reauthenticateWithCredential(user, credential)
      }

      // Update password
      if (user) {
        await updatePassword(user, passwordForm.newPassword)
      }

      toast({
        title: "Success",
        description: "Your password has been updated",
      })

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
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
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
            <form onSubmit={handleProfileSubmit}>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information and email address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview || profile.avatar_url || ""} alt={profile.username} />
                    <AvatarFallback className="text-2xl">
                      {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center">
                    <Label
                      htmlFor="avatar"
                      className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-md flex items-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Avatar
                    </Label>
                    <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="pl-10"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="pl-10"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto" disabled={isSaving || isUploading}>
                  {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
            <form onSubmit={handlePasswordSubmit}>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="pl-10"
                      required
                    />
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="pl-10"
                      required
                    />
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="pl-10"
                      required
                    />
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto" disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
