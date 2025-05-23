import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentsLoading() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 mt-4 md:mt-0" />
      </div>

      <div className="mb-4">
        <Skeleton className="h-10 w-96 rounded-md" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 transition-colors">
                      <th className="h-12 px-4 text-left align-middle">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="h-12 px-4 text-left align-middle">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="h-12 px-4 text-left align-middle">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="h-12 px-4 text-left align-middle">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="h-12 px-4 text-left align-middle">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="h-12 px-4 text-left align-middle">
                        <Skeleton className="h-4 w-16" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b transition-colors">
                        <td className="p-4 align-middle">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="p-4 align-middle">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="p-4 align-middle">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="p-4 align-middle">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="p-4 align-middle">
                          <Skeleton className="h-6 w-20" />
                        </td>
                        <td className="p-4 align-middle">
                          <Skeleton className="h-8 w-24" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
