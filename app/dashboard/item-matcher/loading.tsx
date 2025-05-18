import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <Skeleton className="h-5 w-72 mt-2 bg-slate-800" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-10 w-40 bg-slate-800" />
        <Skeleton className="h-10 w-40 bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="aspect-square w-full bg-slate-800" />
            <Skeleton className="h-24 w-full mt-2 bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
