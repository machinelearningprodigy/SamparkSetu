import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
// Import the Chatbot component correctly
import { Chatbot } from "@/components/chatbot/chatbot"
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "SamparkSetu - Lost & Found",
  description: "Next level sci-fi themed lost and found platform",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
            <Chatbot />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
