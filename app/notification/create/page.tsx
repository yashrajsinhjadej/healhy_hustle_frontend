'use client'
import { useState, useEffect } from 'react'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from 'lucide-react'

type ScheduleType = 'instant' | 'daily' | 'scheduled_once'

export default function CreateNotificationPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    scheduleType: 'instant' as ScheduleType,
    scheduledTime: '', // HH:mm format for daily
    scheduledDate: '', // ISO string for scheduled_once
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!formData.body.trim()) {
      toast.error('Message is required')
      return
    }

    if (formData.scheduleType === 'daily' && !formData.scheduledTime) {
      toast.error('Scheduled time is required for daily notifications')
      return
    }

    if (formData.scheduleType === 'scheduled_once' && !formData.scheduledDate) {
      toast.error('Scheduled date is required for one-time scheduled notifications')
      return
    }

    // Build request payload
    const payload: any = {
      title: formData.title.trim(),
      body: formData.body.trim(),
      scheduleType: formData.scheduleType,
    }

    if (formData.scheduleType === 'daily') {
      payload.scheduledTime = formData.scheduledTime
    }

    if (formData.scheduleType === 'scheduled_once') {
      // Convert datetime-local to ISO string
      const dateObj = new Date(formData.scheduledDate)
      payload.scheduledDate = dateObj.toISOString()
    }

    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/notifications/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Notification created successfully!')
        
        // Redirect based on type
        setTimeout(() => {
          if (formData.scheduleType === 'instant') {
            router.push('/notification?tab=history')
          } else {
            router.push('/notification?tab=schedule')
          }
        }, 1000)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to create notification')
      }
    } catch (err) {
      console.error('Error creating notification:', err)
      toast.error('Network error while creating notification')
    } finally {
      setLoading(false)
    }
  }

  const getScheduleTypeLabel = () => {
    switch (formData.scheduleType) {
      case 'instant':
        return 'Instant - Send immediately to all users'
      case 'daily':
        return 'Daily - Send every day at a specific time'
      case 'scheduled_once':
        return 'Scheduled Once - Send at a specific date and time'
      default:
        return ''
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <Navbar
          userProfile={userProfile ?? undefined}
          searchTerm={searchTerm}
          onSearch={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          heading={`Good Morning, ${userProfile?.name || 'User'}`}
          placeholder="Search"
        />

        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Notifications</span>
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Create New Notification</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter notification title"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                </div>

                {/* Body/Message */}
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    placeholder="Enter notification message"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.body.length}/500 characters</p>
                </div>

                {/* Schedule Type */}
                <div>
                  <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="scheduleType"
                    name="scheduleType"
                    value={formData.scheduleType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily</option>
                    <option value="scheduled_once">Scheduled Once</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-2 bg-blue-50 p-2 rounded">
                    ℹ️ {getScheduleTypeLabel()}
                  </p>
                </div>

                {/* Conditional Fields based on Schedule Type */}
                {formData.scheduleType === 'daily' && (
                  <div>
                    <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Time (24-hour format) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="scheduledTime"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Notification will be sent every day at this time in the user's timezone
                    </p>
                  </div>
                )}

                {formData.scheduleType === 'scheduled_once' && (
                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Notification will be sent once at this specific date and time
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Notification'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}