// components/notification/ScheduleTable.tsx
import React, { useState, useEffect } from 'react'
import { authUtils } from '@/lib/auth'
import { useRouter } from 'next/navigation' // App Router. Use 'next/router' for Pages Router

type ScheduleItem = {
  id: string | number
  title: string
  message: string
  scheduleType: string
  scheduledTime?: string | null
  scheduledDate?: string | null
  status: string
  targetAudience?: string
}

type Pagination = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type ScheduleFilters = {
  status: string
  scheduleType: string
  sortBy: string
  order: string
}

type Props = {
  schedules: ScheduleItem[]
  loading: boolean
  pagination: Pagination
  filters: ScheduleFilters
  onFilterChange: (filterType: keyof ScheduleFilters, value: string) => void
  onPageChange: (newPage: number) => void
  onStatusToggle?: (scheduleId: string | number, nextStatus: 'active' | 'paused') => void
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
    case 'pending':
      return 'bg-blue-100 text-blue-800'
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
    case 'pending':
      return 'Pending'
    default:
      return status
  }
}

const formatLocalDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatLocalTimeFromISO = (dateString?: string | null) => {
  if (!dateString) return 'N/A'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

const renderScheduleDate = (schedule: ScheduleItem) => {
  const type = (schedule.scheduleType || '').toLowerCase()
  if (type === 'daily') return '-'
  if (type === 'scheduled_once') {
    if (schedule.scheduledDate) return formatLocalDate(schedule.scheduledDate)
    return 'N/A'
  }
  return 'N/A'
}

const renderScheduleTime = (schedule: ScheduleItem) => {
  const type = (schedule.scheduleType || '').toLowerCase()
  if (type === 'daily') {
    if (schedule.scheduledTime) {
      const raw = schedule.scheduledTime.trim()
      if (/^\d{2}:\d{2}$/.test(raw)) return raw
    }
    return 'N/A'
  }
  if (type === 'scheduled_once') {
    if (schedule.scheduledDate) return formatLocalTimeFromISO(schedule.scheduledDate)
    return 'N/A'
  }
  return 'N/A'
}

/**
 * Switch mapping rules:
 * - Switch ON for statuses 'active' or 'pending'
 * - Toggle allowed for 'active', 'pending', 'paused'
 * - nextStatus maps to 'active' when turning ON, 'paused' when turning OFF
 */
const isSwitchOnFromStatus = (status: string) => {
  const s = status.toLowerCase()
  return s === 'active' || s === 'pending'
}
const nextStatusFromSwitch = (turnOn: boolean) => (turnOn ? 'active' : 'paused')
const isToggleAllowed = (status: string) => {
  const s = status.toLowerCase()
  return s === 'active' || s === 'pending' || s === 'paused'
}


export default function ScheduleTable({
  schedules,
  loading,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onStatusToggle,
}: Props) {
  const router = useRouter()
  const [busyIds, setBusyIds] = useState<Set<string | number>>(new Set())
  // Track optimistic status updates for immediate UI feedback
  const [statusUpdates, setStatusUpdates] = useState<Map<string | number, string>>(new Map())
  // Track expected statuses after optimistic updates (so we can verify server confirms)
  const [expectedStatuses, setExpectedStatuses] = useState<Map<string | number, string>>(new Map())

  // Sync status updates with schedule props (when data refreshes from server)
  // Only sync if server status matches expected, or if there's no pending update
  useEffect(() => {
    setStatusUpdates((prev) => {
      const next = new Map(prev)
      
      schedules.forEach((schedule) => {
        const expectedStatus = expectedStatuses.get(schedule.id)
        
        if (expectedStatus !== undefined) {
          // We have a pending optimistic update for this schedule
          // Only sync with server if it matches our expected status
          // Otherwise, preserve the optimistic update
          if (schedule.status === expectedStatus) {
            // Server confirmed our update - use server data
            next.set(schedule.id, schedule.status)
          } else {
            // Server hasn't updated yet or has stale data
            // Preserve the optimistic update if it exists
            const optimisticStatus = prev.get(schedule.id)
            if (optimisticStatus) {
              next.set(schedule.id, optimisticStatus)
            } else {
              // Fallback: use expected status (shouldn't happen, but safety)
              next.set(schedule.id, expectedStatus)
            }
          }
        } else {
          // No pending update, safe to sync with server
          next.set(schedule.id, schedule.status)
        }
      })
      return next
    })
  }, [schedules, expectedStatuses])

  // Clean up confirmed updates (when server status matches expected)
  // This removes the expectedStatuses entry once server confirms the update
  useEffect(() => {
    const confirmedIds: (string | number)[] = []
    
    schedules.forEach((schedule) => {
      const expectedStatus = expectedStatuses.get(schedule.id)
      if (expectedStatus && schedule.status === expectedStatus) {
        // Server confirmed our update - clear expected status tracking
        confirmedIds.push(schedule.id)
      }
    })
    
    if (confirmedIds.length > 0) {
      // Clear expected statuses for confirmed updates
      // busyIds is already cleared immediately after API call
      setExpectedStatuses((prev) => {
        const next = new Map(prev)
        confirmedIds.forEach((id) => next.delete(id))
        return next
      })
    }
  }, [schedules, expectedStatuses])

  // Get the current status for a schedule (optimistic update or prop)
  const getScheduleStatus = (schedule: ScheduleItem): string => {
    return statusUpdates.get(schedule.id) ?? schedule.status
  }

  const handleToggleClick = async (schedule: ScheduleItem) => {
    const currentStatus = getScheduleStatus(schedule)
    if (!isToggleAllowed(currentStatus)) return

    const currentOn = isSwitchOnFromStatus(currentStatus)
    const willTurnOn = !currentOn
    const nextStatus = nextStatusFromSwitch(willTurnOn)
    const isActivePayload = willTurnOn

    // Store original status for potential rollback
    const originalStatus = schedule.status

    // Optimistic update: immediately update UI
    setStatusUpdates((prev) => {
      const next = new Map(prev)
      next.set(schedule.id, nextStatus)
      return next
    })
    // Track expected status so we know when server confirms
    setExpectedStatuses((prev) => {
      const next = new Map(prev)
      next.set(schedule.id, nextStatus)
      return next
    })
    setBusyIds((prev) => new Set(prev).add(schedule.id))

    try {
      const response = await fetch(`/api/notifications/status/${schedule.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authUtils.getAuthHeader(),
        },
        body: JSON.stringify({ isActive: isActivePayload }),
      })

      // Try to parse JSON to read { success, message } if present
      let data: any = null
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null)
      }

      if (!response.ok || (data && data.success === false)) {
        const msg =
          (data && data.message) ||
          response.statusText ||
          'Failed to update status'
        throw new Error(msg)
      }

      // API call succeeded - clear loading state immediately
      // The optimistic update will remain until server confirms
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(schedule.id)
        return next
      })

      // Update parent state via callback (if provided)
      if (onStatusToggle) {
        onStatusToggle(schedule.id, nextStatus)
      }
      
      // Force a refresh of the current route (revalidates server components/data)
      // The useEffect will sync with server data when it arrives with the correct status
      router.refresh()
      
    } catch (err) {
      console.error('❌ Error updating status:', err)
      const msg =
        err instanceof Error ? err.message : 'Failed to update status'
      
      // Clear loading state on error
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(schedule.id)
        return next
      })
      
      // Revert optimistic update on error
      setStatusUpdates((prev) => {
        const next = new Map(prev)
        next.set(schedule.id, originalStatus) // Revert to original status
        return next
      })
      // Clear expected status since update failed
      setExpectedStatuses((prev) => {
        const next = new Map(prev)
        next.delete(schedule.id)
        return next
      })
      
      alert(msg)
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Type:</label>
          <select
            value={filters.scheduleType}
            onChange={(e) => onFilterChange('scheduleType', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All</option>
            <option value="daily">Daily</option>
            <option value="scheduled_once">Scheduled Once</option>
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

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading...</div>
      ) : schedules.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No scheduled notifications found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Schedule Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => {
                const currentStatus = getScheduleStatus(schedule)
                const switchOn = isSwitchOnFromStatus(currentStatus)
                const canToggle = isToggleAllowed(currentStatus)
                const isBusy = busyIds.has(schedule.id)

                return (
                  <tr key={schedule.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{schedule.title}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{schedule.message}</td>
                    <td className="py-3 px-4 capitalize">
                      {schedule.scheduleType === 'scheduled_once' ? 'Scheduled Once' : schedule.scheduleType}
                    </td>
                    <td className="py-3 px-4">{renderScheduleDate(schedule)}</td>
                    <td className="py-3 px-4">{renderScheduleTime(schedule)}</td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            currentStatus
                          )}`}
                        >
                          {getStatusText(currentStatus)}
                        </span>

                        <button
                          type="button"
                          aria-label={switchOn ? 'Turn off' : 'Turn on'}
                          onClick={() => handleToggleClick(schedule)}
                          disabled={!canToggle || isBusy}
                          className={[
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black',
                            switchOn ? 'bg-green-500' : 'bg-gray-300',
                            (!canToggle || isBusy) ? 'opacity-50 cursor-not-allowed' : '',
                          ].join(' ')}
                        >
                          {isBusy && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          <span
                            className={[
                              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                              switchOn ? 'translate-x-5' : 'translate-x-0',
                            ].join(' ')}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && schedules.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {schedules.length} of {pagination.totalItems} schedules
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