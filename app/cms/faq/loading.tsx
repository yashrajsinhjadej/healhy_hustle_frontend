// Loading skeleton for FAQ page
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <div className="bg-white px-8 py-6 border-b border-[#e1e1e1]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 bg-gray-200" />
            <Skeleton className="h-10 w-80 bg-gray-200" />
          </div>
        </div>
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-blue-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48 bg-gray-200" />
                <Skeleton className="h-10 w-32 bg-gray-200" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-12 bg-gray-200" />
                          <Skeleton className="h-5 w-16 bg-gray-200" />
                        </div>
                        <Skeleton className="h-6 w-3/4 bg-gray-200" />
                        <Skeleton className="h-16 w-full bg-gray-200" />
                        <Skeleton className="h-4 w-32 bg-gray-200" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 bg-gray-200" />
                        <Skeleton className="h-9 w-9 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
