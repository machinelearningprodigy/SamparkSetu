import { MongoClient, GridFSBucket, ObjectId } from "mongodb"

// MongoDB connection string
const uri = process.env.MONGODB_URI || ""
const dbName = "lost-found"

// Connection cache
let client: MongoClient | null = null
let bucket: GridFSBucket | null = null

// Connect to MongoDB
async function connectToMongoDB() {
  if (!uri) {
    throw new Error("MongoDB URI is not defined")
  }

  if (client) {
    return { client, db: client.db(dbName) }
  }

  try {
    console.log("Connecting to MongoDB...")
    client = new MongoClient(uri)
    await client.connect()
    console.log("Connected to MongoDB successfully")

    const db = client.db(dbName)
    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

// Get GridFS bucket
async function getGridFSBucket() {
  if (bucket) {
    return bucket
  }

  try {
    console.log("Getting GridFS bucket: images")
    const { db } = await connectToMongoDB()
    bucket = new GridFSBucket(db, { bucketName: "images" })
    console.log("GridFS bucket obtained")
    return bucket
  } catch (error) {
    console.error("Failed to get GridFS bucket:", error)
    throw error
  }
}

// Upload file to MongoDB GridFS
export async function uploadFileToMongoDB(buffer: Buffer, filename: string, metadata: any = {}) {
  try {
    console.log(`Starting file upload to MongoDB GridFS: ${filename}`)
    const bucket = await getGridFSBucket()

    return new Promise<string>((resolve, reject) => {
      // Create upload stream
      const uploadStream = bucket.openUploadStream(filename, {
        metadata,
      })

      console.log(`Writing buffer to upload stream, size: ${buffer.length}`)

      // Write buffer to stream
      uploadStream.write(buffer, (err) => {
        if (err) {
          console.error("Error writing to upload stream:", err)
          reject(err)
          return
        }

        console.log("Buffer written successfully, ending stream")

        // End the stream
        uploadStream.end((endErr) => {
          if (endErr) {
            console.error("Error ending upload stream:", endErr)
            reject(endErr)
            return
          }

          console.log("Upload finished successfully, file ID:", uploadStream.id.toString())
          resolve(uploadStream.id.toString())
        })
      })
    })
  } catch (error) {
    console.error("Error in uploadFileToMongoDB:", error)
    throw error
  }
}

// Get file from MongoDB GridFS
export async function getFileFromMongoDB(fileId: string) {
  try {
    console.log(`Getting file from MongoDB GridFS: ${fileId}`)
    const bucket = await getGridFSBucket()

    // Validate ObjectId
    let objectId: ObjectId
    try {
      objectId = new ObjectId(fileId)
    } catch (error) {
      console.error("Invalid ObjectId:", error)
      throw new Error("Invalid file ID")
    }

    // Find file info
    const { db } = await connectToMongoDB()
    const file = await db.collection("images.files").findOne({ _id: objectId })

    if (!file) {
      console.error("File not found:", fileId)
      throw new Error("File not found")
    }

    // Create download stream
    const downloadStream = bucket.openDownloadStream(objectId)

    return {
      stream: downloadStream,
      file,
    }
  } catch (error) {
    console.error("Error in getFileFromMongoDB:", error)
    throw error
  }
}

export default { connectToMongoDB, getGridFSBucket, uploadFileToMongoDB, getFileFromMongoDB }
