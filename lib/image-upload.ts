import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { v4 as uuidv4 } from "uuid"

// Function to upload an image to MongoDB
export async function uploadImageToMongoDB(file: File, folder = "items"): Promise<string> {
  try {
    console.log(`Uploading image to MongoDB: ${file.name}, folder: ${folder}`)

    // Create form data
    const formData = new FormData()
    formData.append("file", file)
    formData.append("metadata", JSON.stringify({ folder }))

    // Upload to our API endpoint
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("MongoDB upload failed:", response.status, errorData)
      throw new Error(`Failed to upload image: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log("MongoDB upload successful:", data)

    // Return the URL to access the file
    return data.url
  } catch (error) {
    console.error("Error uploading image to MongoDB:", error)
    throw error
  }
}

// Function to upload an image to Firebase Storage
export async function uploadImageToFirebase(file: File, folder = "items"): Promise<string> {
  try {
    console.log(`Uploading image to Firebase: ${file.name}, folder: ${folder}`)

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}-${uuidv4()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, filePath)

    // Upload the file with metadata including CORS settings
    const metadata = {
      contentType: file.type,
      customMetadata: {
        "Access-Control-Allow-Origin": "*",
      },
    }

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, metadata)
    console.log("Firebase upload successful:", snapshot)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log("Firebase download URL:", downloadURL)

    return downloadURL
  } catch (error) {
    console.error("Error uploading image to Firebase:", error)
    throw error
  }
}

// Function to upload multiple images
export async function uploadMultipleImages(files: File[], useFirebase = false, folder = "items"): Promise<string[]> {
  try {
    console.log(`Uploading ${files.length} images, useFirebase: ${useFirebase}, folder: ${folder}`)

    const uploadPromises = files.map((file) => {
      return useFirebase ? uploadImageToFirebase(file, folder) : uploadImageToMongoDB(file, folder)
    })

    const urls = await Promise.all(uploadPromises)
    console.log("All uploads completed successfully:", urls)

    return urls
  } catch (error) {
    console.error("Error uploading multiple images:", error)
    throw error
  }
}

// Profile image upload function - this was missing and causing the error
export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  console.log(`Uploading profile image for user: ${userId}`)
  // Use MongoDB for profile images to avoid CORS issues
  return uploadImageToMongoDB(file, `profiles/${userId}`)
}

// Item image upload functions
export async function uploadItemImage(file: File, itemType: string): Promise<string> {
  console.log(`Uploading item image for type: ${itemType}`)
  return uploadImageToMongoDB(file, `items/${itemType}`)
}

// Legacy function for backward compatibility
export async function uploadImage(file: File, folder = "general"): Promise<string> {
  console.log(`Legacy uploadImage called for folder: ${folder}`)
  return uploadImageToMongoDB(file, folder)
}
