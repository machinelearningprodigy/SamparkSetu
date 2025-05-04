import { type NextRequest, NextResponse } from "next/server"
import { uploadFileToMongoDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API route called")
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided in the request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", file.name, "Size:", file.size, "Type:", file.type)

    // Get metadata if provided
    const metadata = formData.get("metadata") ? JSON.parse(formData.get("metadata") as string) : {}

    console.log("Metadata:", metadata)

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log("File converted to buffer, size:", buffer.length)

    // Add content type to metadata
    metadata.contentType = file.type

    // Upload to MongoDB
    console.log("Uploading to MongoDB...")
    const fileId = await uploadFileToMongoDB(buffer, file.name, metadata)
    console.log("File uploaded successfully, ID:", fileId)

    // Return the file ID and URL
    return NextResponse.json({
      fileId,
      url: `/api/files/${fileId}`,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
