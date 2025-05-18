import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI with the provided API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    // Create chat history from previous messages
    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }))

    // Get the latest user message
    const latestMessage = messages[messages.length - 1]

    // Create a chat session
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    })

    // Send the message and get the response
    const result = await chat.sendMessage(latestMessage.content)
    const response = await result.response
    const text = response.text()

    return new Response(
      JSON.stringify({
        role: "assistant",
        content: text,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process chat request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
