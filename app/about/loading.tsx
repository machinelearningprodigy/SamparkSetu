import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="w-full max-w-3xl mx-auto">
            {/* Hero section loading */}
            <div className="h-20 w-3/4 mx-auto bg-slate-800/50 animate-pulse rounded-lg mb-4"></div>
            <div className="h-6 w-1/2 mx-auto bg-slate-800/50 animate-pulse rounded-lg"></div>

            {/* Mission section loading */}
            <div className="mt-20">
              <div className="h-10 w-1/3 mx-auto bg-slate-800/50 animate-pulse rounded-lg mb-10"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64 bg-slate-800/50 animate-pulse rounded-xl"></div>
                <div className="h-64 bg-slate-800/50 animate-pulse rounded-xl"></div>
              </div>
            </div>

            {/* Team section loading */}
            <div className="mt-20">
              <div className="h-10 w-1/3 mx-auto bg-slate-800/50 animate-pulse rounded-lg mb-10"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-96 bg-slate-800/50 animate-pulse rounded-xl"></div>
                <div className="h-96 bg-slate-800/50 animate-pulse rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
