import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react"

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <h2 className="text-2xl font-semibold text-white">Loading Contact Page...</h2>
          <p className="text-slate-400 mt-2">Please wait while we prepare the contact form for you.</p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
