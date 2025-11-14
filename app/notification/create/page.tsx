'use client'

import { useState, useEffect } from 'react'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from 'lucide-react'

type ScheduleType = 'instant' | 'daily' | 'scheduled_once'
type TargetAudience = 'all' | 'filtered'

export default function CreateNotificationPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    scheduleType: 'instant' as ScheduleType,
    targetAudience: 'all' as TargetAudience,
    scheduledTime: '',
    scheduledDate: '',
    filters: {
      gender: [] as string[],
      platform: [] as string[],
      ageRange: { min: '', max: '' }
    }
  })

  useEffect(() => {
    const storedUser = authUtils.getUser()
    if (storedUser) setUserProfile(storedUser)
  }, [])

  // ============================================================
  // HANDLE INPUT
  // ============================================================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name.startsWith("filters.")) {
      const [, key, subkey] = name.split(".") // filters.ageRange.min

      setFormData(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          [key]: subkey
            ? { ...prev.filters[key], [subkey]: value }
            : value
        }
      }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // ============================================================
  // TOGGLE BUTTON ARRAYS (gender/platform)
  // ============================================================
  const toggleFilterArray = (field: 'gender' | 'platform', value: string) => {
    setFormData(prev => {
      const exists = prev.filters[field].includes(value)
      return {
        ...prev,
        filters: {
          ...prev.filters,
          [field]: exists
            ? prev.filters[field].filter(v => v !== value)
            : [...prev.filters[field], value]
        }
      }
    })
  }

  // ============================================================
  // SUBMIT HANDLER
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // BASIC VALIDATIONS
    if (!formData.title.trim()) return toast.error("Title is required")
    if (!formData.body.trim()) return toast.error("Message is required")

    if (formData.scheduleType === "daily" && !formData.scheduledTime)
      return toast.error("Scheduled time is required")

    if (formData.scheduleType === "scheduled_once" && !formData.scheduledDate)
      return toast.error("Scheduled date is required")

    // AGE VALIDATION (Frontend)
    const minAge = Number(formData.filters.ageRange.min)
    const maxAge = Number(formData.filters.ageRange.max)

    if (formData.targetAudience === "filtered") {
      if (minAge && (minAge < 13 || minAge > 100))
        return toast.error("Minimum age must be between 13 and 100")

      if (maxAge && (maxAge < 13 || maxAge > 100))
        return toast.error("Maximum age must be between 13 and 100")

      if (minAge && maxAge && minAge > maxAge)
        return toast.error("Minimum age cannot be greater than maximum age")
    }

    // BUILD PAYLOAD
    const payload: any = {
      title: formData.title.trim(),
      body: formData.body.trim(),
      scheduleType: formData.scheduleType,
      targetAudience: formData.targetAudience
    }

    if (formData.scheduleType === "daily") payload.scheduledTime = formData.scheduledTime
    if (formData.scheduleType === "scheduled_once")
      payload.scheduledDate = new Date(formData.scheduledDate).toISOString()

    if (formData.targetAudience === "filtered") {
      payload.filters = {}

      if (formData.filters.gender.length > 0)
        payload.filters.gender = formData.filters.gender

      if (formData.filters.platform.length > 0)
        payload.filters.platform = formData.filters.platform

      if (formData.filters.ageRange.min || formData.filters.ageRange.max)
        payload.filters.ageRange = {
          ...(formData.filters.ageRange.min ? { min: Number(formData.filters.ageRange.min) } : {}),
          ...(formData.filters.ageRange.max ? { max: Number(formData.filters.ageRange.max) } : {})
        }
    }

    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/notifications/create', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log(data)
      console.log(data.error)
      /** 🔥 FIXED ERROR HANDLING */
      if (!response.ok) {
        const backendMessage =
          data?.message ||
          data?.error.status||                     // main backend message
          data?.errors?.[0]?.message ||        // express-validator format
          data?.error?.message ||              // nested error
          "Failed to create notification"

        toast.error(backendMessage)
        return
      }

      toast.success("Notification created successfully!")

      setTimeout(() => {
        router.push(
          `/notification?tab=${
            formData.scheduleType === "instant" ? "history" : "schedule"
          }`
        )
      }, 800)
    } catch (err) {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <Navbar
          userProfile={userProfile ?? undefined}
          searchTerm={searchTerm}
          onSearch={(e: any) => setSearchTerm(e.target.value)}
          heading={`Good Morning, ${userProfile?.name || 'User'}`}
          placeholder="Search"
        />

        <div className="p-6">
          <div className="max-w-3xl mx-auto">

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-semibold mb-6">Create Notification</h2>

              <form className="space-y-6" onSubmit={handleSubmit}>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="text-sm font-medium">Message *</label>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 resize-none"
                    rows={4}
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="text-sm font-medium">Target Audience *</label>
                  <select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="all">All Users</option>
                    <option value="filtered">Filtered Users</option>
                  </select>
                </div>

                {/* FILTERS */}
                {formData.targetAudience === "filtered" && (
                  <div className="bg-gray-50 p-4 rounded-xl border space-y-4">

                    {/* Gender */}
                    <div>
                      <label className="text-sm font-medium">Gender</label>
                      <div className="flex gap-3 mt-2">
                        {["male", "female", "other"].map((g) => (
                          <button
                            type="button"
                            key={g}
                            onClick={() => toggleFilterArray("gender", g)}
                            className={`px-4 py-2 rounded-lg border ${
                              formData.filters.gender.includes(g)
                                ? "bg-black text-white"
                                : "bg-white"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Platform */}
                    <div>
                      <label className="text-sm font-medium">Platform</label>
                      <div className="flex gap-3 mt-2">
                        {["android", "ios"].map((p) => (
                          <button
                            type="button"
                            key={p}
                            onClick={() => toggleFilterArray("platform", p)}
                            className={`px-4 py-2 rounded-lg border ${
                              formData.filters.platform.includes(p)
                                ? "bg-black text-white"
                                : "bg-white"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Age Range */}
                    <div>
                      <label className="text-sm font-medium">Age Range</label>
                      <div className="flex gap-3 mt-2">
                        <input
                          type="number"
                          placeholder="Min"
                          name="filters.ageRange.min"
                          value={formData.filters.ageRange.min}
                          onChange={handleInputChange}
                          className="border rounded-lg px-3 py-2 w-24"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          name="filters.ageRange.max"
                          value={formData.filters.ageRange.max}
                          onChange={handleInputChange}
                          className="border rounded-lg px-3 py-2 w-24"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* Schedule Type */}
                <div>
                  <label className="text-sm font-medium">Schedule Type *</label>
                  <select
                    name="scheduleType"
                    value={formData.scheduleType}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily</option>
                    <option value="scheduled_once">Scheduled Once</option>
                  </select>
                </div>

                {/* Daily */}
                {formData.scheduleType === "daily" && (
                  <div>
                    <label className="text-sm font-medium">Time *</label>
                    <input
                      type="time"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                )}

                {/* Scheduled Once */}
                {formData.scheduleType === "scheduled_once" && (
                  <div>
                    <label className="text-sm font-medium">Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    disabled={loading}
                    className="flex-1 bg-black text-white py-3 rounded-lg"
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-6 py-3 border rounded-lg"
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
