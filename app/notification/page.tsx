// app/(admin)/notification/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// NEW: import split components
import ScheduleTable from '@/components/notification/ScheduleTable'
import HistoryTable from '@/components/notification/HistoryTable'

type TabType = 'history' | 'schedule'

export default function NotificationPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('history')

  // history data
  const [notifications, setNotifications] = useState<any[]>([])
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'firedAt',
    order: 'desc',
  })

  // schedule data
  const [schedules, setSchedules] = useState<any[]>([])
  const [scheduleFilters, setScheduleFilters] = useState({
    status: 'all',
    scheduleType: 'all',
    sortBy: 'createdAt',
    order: 'desc',
  })

  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = authUtils.getUser()
        if (storedUser) {
          setUserProfile(storedUser)
          return
        }
        const response = await authenticatedFetch('/api/users/profile')
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data.user)
        }
      } catch {
        // ignore
      }
    }
    fetchUserProfile()
  }, [])

  const fetchNotifications = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy: filters.sortBy,
        order: filters.order,
        ...(filters.status !== 'all' && { status: filters.status }),
      })
      const response = await authenticatedFetch(`/api/notifications/history?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data.notifications)
        setPagination(data.data.pagination)
      } else {
        let msg = `Failed to fetch notifications (status ${response.status})`
        try {
          const errorData = await response.json()
          msg = errorData?.error || errorData?.message || msg
        } catch {}
        console.error(msg)
        toast.error(msg)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      toast.error('Network error while fetching notifications.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy: scheduleFilters.sortBy,
        order: scheduleFilters.order,
        ...(scheduleFilters.status !== 'all' && { status: scheduleFilters.status }),
        ...(scheduleFilters.scheduleType !== 'all' && { scheduleType: scheduleFilters.scheduleType }),
      })
      const response = await authenticatedFetch(`/api/notifications/scheduled?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.data.schedules)
        setPagination(data.data.pagination)
      } else {
        let msg = `Failed to fetch schedules (status ${response.status})`
        try {
          const errorData = await response.json()
          msg = errorData?.error || errorData?.message || msg
        } catch {}
        console.error(msg)
        toast.error(msg)
      }
    } catch (err) {
      console.error('Error fetching schedules:', err)
      toast.error('Network error while fetching schedules.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      fetchNotifications(1)
    } else {
      fetchSchedules(1)
    }
  }, [activeTab, filters, scheduleFilters])

  const handlePageChange = (newPage: number) => {
    if (activeTab === 'history') {
      fetchNotifications(newPage)
    } else {
      fetchSchedules(newPage)
    }
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleScheduleFilterChange = (filterType: string, value: string) => {
    setScheduleFilters(prev => ({ ...prev, [filterType]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <Navbar
          userProfile={userProfile ?? undefined}
          searchTerm={searchTerm}
          onSearch={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          heading={`Good Morning, ${userProfile?.name || 'User'}`}
          placeholder="Search Notifications"
        />

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Recent Notifications</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {activeTab === 'history'
                    ? 'View all sent notifications and their delivery status'
                    : 'Manage scheduled and recurring notifications'}
                </p>
              </div>
              <button
                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                onClick={() => router.push('/notification/create')}
              >
                Add notification
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => handleTabChange('history')}
                className={`px-6 py-2 font-medium transition-colors ${
                  activeTab === 'history' ? 'bg-black text-white rounded-t-lg' : 'text-gray-600 hover:text-black'
                }`}
              >
                History
              </button>
              <button
                onClick={() => handleTabChange('schedule')}
                className={`px-6 py-2 font-medium transition-colors ${
                  activeTab === 'schedule' ? 'bg-black text-white rounded-t-lg' : 'text-gray-600 hover:text-black'
                }`}
              >
                Schedule
              </button>
            </div>

            {/* Body */}
            {activeTab === 'history' ? (
              <HistoryTable
                notifications={notifications}
                loading={loading}
                pagination={pagination}
                filters={filters}
                onFilterChange={handleFilterChange}
                onPageChange={handlePageChange}
              />
            ) : (
              <ScheduleTable
                schedules={schedules}
                loading={loading}
                pagination={pagination}
                filters={scheduleFilters}
                onFilterChange={handleScheduleFilterChange}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
