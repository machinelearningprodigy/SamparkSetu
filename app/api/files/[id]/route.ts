  import { type NextRequest, NextResponse } from "next/server"
import { getFileFromMongoDB } from "@/lib/mongodb"
import { Readable } from "stream"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`File request for ID: ${params.id}`)

    // Get file from MongoDB
    const { stream, file } = await getFileFromMongoDB(params.id)

    // Convert stream to buffer
    const chunks: Buffer[] = []
    const readable = Readable.from(stream)

    for await (const chunk of readable) {
      chunks.push(Buffer.from(chunk))
    }

    const buffer = Buffer.concat(chunks)

    // Set content type
    const contentType = file.metadata?.contentType || "application/octet-stream"

    // Return file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 404 })
  }
}
