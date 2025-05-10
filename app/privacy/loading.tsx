import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"

export default function PrivacyPolicyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="flex flex-col items-center mb-12">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-1 w-40 mb-6" />
            <Skeleton className="h-20 w-full max-w-2xl" />
          </div>

          {/* Card skeletons */}
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="mb-8">
                <Skeleton className="h-[200px] w-full rounded-lg mb-8" />
              </div>
            ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
