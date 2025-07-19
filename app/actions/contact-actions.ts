"use server"

type ContactFormData = {
  name: string
  email: string
  subject: string
  message: string
}


export async function sendContactEmail(formData: ContactFormData) {
  try {
    // Validate the data
    if (!formData.name || !formData.email || !formData.message) {
      return {
        success: false,
        message: "Name, email, and message are required",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        message: "Please provide a valid email address",
      }
    }

    // Send the data to our API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to send message")
    }

    return {
      success: true,
      message: "Your message has been sent successfully! We will get back to you soon.",
    }
  } catch (error) {
    console.error("Error sending contact email:", error)
    return {
      success: false,
      message: "Failed to send message. Please try again later.",
    }
  }
}
