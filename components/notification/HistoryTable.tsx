// components/notification/HistoryTable.tsx
import React from 'react'

type NotificationItem = {
  id: string | number
  title: string
  content: string
  type: string
  date: string
  time: string
  status: string
  successRate?: string
  successCount?: number
  totalTargeted?: number
}

type Pagination = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type HistoryFilters = {
  status: string
  sortBy: string
  order: string
}

type Props = {
  notifications: NotificationItem[]
  loading: boolean
  pagination: Pagination
  filters: HistoryFilters
  onFilterChange: (filterType: keyof HistoryFilters, value: string) => void
  onPageChange: (newPage: number) => void
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'sent':
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'partial_success':
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'sent':
      return 'Sent'
    case 'partial_success':
      return 'Partial Success'
    case 'failed':
      return 'Failed'
    case 'active':
      return 'Active'
    case 'paused':
      return 'Paused'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

export default function HistoryTable({
  notifications,
  loading,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
}: Props) {
  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All</option>
            <option value="sent">Sent</option>
            <option value="partial_success">Partial Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort:</label>
          <select
            value={filters.order}
            onChange={(e) => onFilterChange('order', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No notifications found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Content</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr
                  key={notification.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{notification.title}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {notification.content}
                  </td>
                  <td className="py-3 px-4 capitalize">{notification.type}</td>
                  <td className="py-3 px-4">{notification.date}</td>
                  <td className="py-3 px-4">{notification.time}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        notification.status
                      )}`}
                    >
                      {getStatusText(notification.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm">
                      <div className="font-medium">{notification.successRate}</div>
                      <div className="text-xs text-gray-500">
                        {(notification.successCount ?? 0)}/{(notification.totalTargeted ?? 0)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && notifications.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {notifications.length} of {pagination.totalItems} notifications
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
