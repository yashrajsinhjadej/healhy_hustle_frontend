// Loading skeleton for Terms page
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
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Skeleton className="h-8 w-48 mb-6 bg-gray-200" />
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <Skeleton className="h-10 w-full mb-4 bg-gray-200" />
              <Skeleton className="h-64 w-full bg-gray-200" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Skeleton className="h-10 w-24 bg-gray-200" />
              <Skeleton className="h-10 w-24 bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
