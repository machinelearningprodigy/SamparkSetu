import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate the data
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    // In a real application, you would send an email here
    // For demonstration, we'll simulate a successful email send

    // You could use a service like SendGrid, Mailgun, or EmailJS
    // Example with EmailJS (would require client-side implementation):
    // const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     service_id: 'your_service_id',
    //     template_id: 'your_template_id',
    //     user_id: 'your_user_id',
    //     template_params: { name, email, subject, message }
    //   })
    // });

    // For now, we'll simulate a successful response
    // In production, replace this with actual email sending logic

    console.log("Contact form submission:", { name, email, subject, message })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully! We will get back to you soon.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 })
  }
}
