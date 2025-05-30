/**
 * Direct API client for Gemini 2.0 Flash
 * This provides an alternative way to call the Gemini API directly
 * when we need more control over the request parameters
 */



const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export interface GeminiDirectRequest {
  contents: {
    parts: {
      text?: string
      [key: string]: any
    }[]
  }[]
  generationConfig?: {
    temperature?: number
    topP?: number
    topK?: number
    maxOutputTokens?: number
    stopSequences?: string[]
  }
  safetySettings?: {
    category: string
    threshold: string
  }[]
}

export interface GeminiDirectResponse {
  candidates: {
    content: {
      parts: {
        text?: string
        [key: string]: any
      }[]
    }
    finishReason: string
    safetyRatings: {
      category: string
      probability: string
    }[]
  }[]
  promptFeedback?: {
    safetyRatings: {
      category: string
      probability: string
    }[]
  }
}

/**
 * Makes a direct API call to Gemini 2.0 Flash
 * @param request The request payload
 * @returns The response from Gemini API
 */
export async function callGeminiDirectApi(request: GeminiDirectRequest): Promise<GeminiDirectResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error calling Gemini API directly:", error)
    throw error
  }
}

/**
 * Simplified function to generate text using Gemini 2.0 Flash
 * @param prompt The text prompt
 * @param options Optional configuration
 * @returns The generated text
 */
export async function generateTextWithGemini(
  prompt: string,
  options: {
    temperature?: number
    maxTokens?: number
  } = {},
): Promise<string> {
  try {
    const request: GeminiDirectRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024,
      },
    }

    const response = await callGeminiDirectApi(request)

    if (
      response.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts.length > 0
    ) {
      return response.candidates[0].content.parts[0].text || ""
    }

    return ""
  } catch (error) {
    console.error("Error generating text with Gemini:", error)
    return ""
  }
}
