import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"

export default function TermsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-5xl mx-auto">
          {/* Header skeleton */}
          <div className="flex flex-col items-center mb-16">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-1 w-40 mb-6" />
            <Skeleton className="h-20 w-full max-w-2xl" />
          </div>

          {/* Card skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[300px] w-full rounded-lg col-span-1 md:col-span-2" />
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
              ))}
            <Skeleton className="h-[300px] w-full rounded-lg col-span-1 md:col-span-2" />
          </div>

          <div className="mt-16 flex justify-center">
            <Skeleton className="h-6 w-80" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
