import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
 
// Initialize the Google Generative AI with the provided API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Get the generative model - using gemini-2.0-flash
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
 
// System prompt to ensure proper formatting and concise responses
const SYSTEM_PROMPT = `You are SamparkSetu AI, a helpful assistant for a lost and found platform. 
Help users with finding lost items, reporting found items, and navigating the platform.

IMPORTANT INSTRUCTIONS:
1. Keep responses VERY CONCISE - no more than 2-3 short paragraphs maximum.
2. Use proper markdown formatting:
   - Use **bold** for important terms and highlights
   - Use bullet points (*) for lists when appropriate
3. Be direct and to the point - users need quick, actionable information.
4. Avoid unnecessary explanations or verbose language.
5. Focus on providing immediate, practical guidance.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    console.log("Received messages:", JSON.stringify(messages))

    // Create chat history from previous messages
    const chatHistory = messages
      .slice(0, -1)
      .filter((msg: any) => msg.role !== "system")
      .map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))

    // Get the latest user message
    const latestMessage = messages[messages.length - 1]

    try {
      // Create a chat session
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 400, // Limit token count for concise responses
        },
      })

      // Prepare the message with system context if it's the first message
      const messageToSend = `${SYSTEM_PROMPT}\n\nUser query: ${latestMessage.content}`

      console.log("Sending to Gemini:", messageToSend)

      // Send the message and get the response
      const result = await chat.sendMessage(messageToSend)
      const response = await result.response
      const text = response.text()

      console.log("Gemini response text:", text)

      // Format the response to ensure proper markdown
      const formattedText = formatResponseText(text)

      // Return with consistent format
      return NextResponse.json({
        role: "assistant",
        content: formattedText,
      })
    } catch (error: any) {
      console.error("Error with Gemini API:", error)

      // Try direct API call as fallback
      try {
        console.log("Trying direct API call as fallback")
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${SYSTEM_PROMPT}
                      
                      User message: ${latestMessage.content}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 400, // Limit token count for concise responses
              },
            }),
          },
        )

        if (!response.ok) {
          throw new Error(`API call failed with status ${response.status}`)
        }

        const data = await response.json()
        console.log("Direct API response:", JSON.stringify(data))

        const responseText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."

        // Format the response to ensure proper markdown
        const formattedText = formatResponseText(responseText)

        return NextResponse.json({
          role: "assistant",
          content: formattedText,
        })
      } catch (fallbackError) {
        console.error("Fallback API call failed:", fallbackError)
        throw error // Throw the original error
      }
    }
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
      },
      { status: 200 }, // Return 200 even for errors to handle them gracefully in the UI
    )
  }
}

// Helper function to format response text
function formatResponseText(text: string): string {
  const formatted = text
    // Fix asterisks that aren't part of markdown
    .replace(/\*\s\*\*/g, "* **")
    .replace(/\*\*\s\*/g, "** *")

    // Ensure proper spacing for lists
    .replace(/\n\*/g, "\n\n*")
    .replace(/\n\d+\./g, "\n\n1.")

    // Ensure proper spacing for headers
    .replace(/\n#+/g, "\n\n#")

    // Fix any double spaces
    .replace(/\s{2,}/g, " ")

    // Ensure proper paragraph spacing
    .replace(/\n{3,}/g, "\n\n")

    // Remove any trailing whitespace
    .trim()

  return formatted
}
