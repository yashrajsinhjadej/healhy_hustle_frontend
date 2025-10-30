// app/(admin)/workout/edit/EditWorkoutForm.tsx

"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, X, Loader2 } from 'lucide-react'
import { authUtils, authenticatedFetch } from '@/lib/auth'

interface Category {
  _id: string
  name: string
}

type WorkoutDTO = {
  _id: string
  name: string
  category: { _id: string; name: string }[]
  level: "Beginner" | "Intermediate" | "Advanced" | string
  introduction?: string
  caloriesBurned?: number
  bannerUrl?: string
  thumbnailUrl?: string
}

type GetWorkoutResponse = {
  workout: WorkoutDTO
  allCategories: Category[]
}

export default function EditWorkoutForm({ redirectTo }: { redirectTo?: string }) {
  const search = useSearchParams()
  const workoutId = search.get("id") || ""

  const [form, setForm] = useState({
    name: '',
    level: 'beginner',
    introduction: '',
    categoryIds: [] as string[],
    caloriesBurned: ''
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [banner, setBanner] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleAddCategoryId = (categoryId: string) => {
    if (!categoryId) return
    setForm(prev => {
      if (prev.categoryIds.includes(categoryId)) return prev
      return { ...prev, categoryIds: [...prev.categoryIds, categoryId] }
    })
  }

  const handleRemoveCategoryId = (categoryId: string) => {
    setForm(prev => ({ ...prev, categoryIds: prev.categoryIds.filter(id => id !== categoryId) }))
  }

  useEffect(() => {
    let mounted = true

    async function loadWorkout() {
      try {
        setLoading(true)
        setErrorMsg(null)

        if (!workoutId) {
          setErrorMsg("Invalid workout id.")
          return
        }

        const res = await authenticatedFetch("/api/workout/get-by-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workoutId }),
        })

        if (res.status === 401) {
          authUtils.clearAuthData()
          setErrorMsg("Unauthorized. Please login again.")
          return
        }

        const responseData = await res.json().catch(() => null)
        if (!res.ok) {
          setErrorMsg(
            (responseData as any)?.error ||
              (responseData as any)?.message ||
              "Failed to load workout"
          )
          return
        }

        const data: GetWorkoutResponse = responseData?.data || responseData
        const workout: WorkoutDTO = data.workout || data

        if (!workout || !workout._id) {
          setErrorMsg("Workout not found.")
          return
        }

        if (!mounted) return

        // Normalize level
        const rawLevel = workout.level ?? "Beginner"
        const normalizedLevel =
          typeof rawLevel === "string"
            ? rawLevel.toLowerCase()
            : "beginner"

        // Set form data
        setForm({
          name: workout.name || '',
          level: normalizedLevel,
          introduction: workout.introduction || '',
          categoryIds: Array.isArray(workout.category)
            ? workout.category.map((c: any) => c._id).filter(Boolean)
            : [],
          caloriesBurned: workout.caloriesBurned ? String(workout.caloriesBurned) : ''
        })

        setCategories(data.allCategories || [])
        setBannerPreview(workout.bannerUrl || null)
        setThumbnailPreview(workout.thumbnailUrl || null)

      } catch (e: any) {
        if (mounted) {
          setErrorMsg(e?.message || "Unable to load workout.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadWorkout()
    return () => { mounted = false }
  }, [workoutId])

  const capitalizeFirstLetter = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s

  const handleSave = async () => {
    setErrorMsg(null)

    if (!form.name.trim()) return setErrorMsg('Name is required')
    if (!form.level) return setErrorMsg('Level is required')
    if (!form.introduction.trim()) return setErrorMsg('Introduction is required')
    if (!form.categoryIds.length) return setErrorMsg('Select at least one category')
    if (form.caloriesBurned && isNaN(Number(form.caloriesBurned))) {
      return setErrorMsg('Calories burned must be a number')
    }

    if (!workoutId) {
      setErrorMsg("Invalid workout id.")
      return
    }

    setIsSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())

      const levelCapitalized = capitalizeFirstLetter(form.level)
      fd.append('level', levelCapitalized)

      fd.append('introduction', form.introduction.trim())

      if (form.caloriesBurned) {
        fd.append('caloriesBurned', String(Number(form.caloriesBurned)))
      }

      // Send as JSON string for update
      fd.append('categoryIds', JSON.stringify(form.categoryIds))

      if (banner) fd.append('banner', banner, banner.name)
      if (thumbnail) fd.append('thumbnail', thumbnail, thumbnail.name)

      const headers: Record<string, string> = { ...(authUtils.getAuthHeader() as Record<string, string>) }

      const res = await fetch(
        `/api/workout/admin/update/${encodeURIComponent(workoutId)}`,
        { method: 'POST', headers, body: fd }
      )
      
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : { message: await res.text() }

      if (!res.ok) return setErrorMsg((data as any)?.message || 'Failed to update workout')

      if (redirectTo) {
        window.location.href = redirectTo
        return
      }
      
      alert('Workout updated successfully!')
      window.history.back()
      
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update workout')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading workout…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Workout</h1>
      
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Workout name" />
        </div>

        <div>
          <Label>Categories</Label>
          <div className="flex gap-2 mb-2">
            <select
              className="flex-1 border rounded px-3 py-2"
              onChange={(e) => handleAddCategoryId(e.target.value)}
              disabled={categories.length === 0}
              value=""
            >
              <option value="" disabled>
                {categories.length === 0 ? 'No categories available' : 'Add a category…'}
              </option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setForm(prev => ({ ...prev, categoryIds: [] }))}
              disabled={form.categoryIds.length === 0}
            >
              Clear
            </Button>
          </div>

          {form.categoryIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.categoryIds.map(id => {
                const cat = categories.find(c => c._id === id)
                const label = cat ? cat.name : id
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 border text-sm"
                  >
                    {label}
                    <button
                      type="button"
                      className="ml-1 text-gray-600 hover:text-gray-900"
                      onClick={() => handleRemoveCategoryId(id)}
                      aria-label={`Remove ${label}`}
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <Label>Level</Label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.level}
            onChange={e => handleChange('level', e.target.value)}
          >
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </div>

        <div>
          <Label>Introduction</Label>
          <Input
            value={form.introduction}
            onChange={(e) => handleChange('introduction', e.target.value)}
            placeholder="Short intro for this workout"
          />
        </div>

        <div>
          <Label>Calories Burned (estimate)</Label>
          <Input
            value={form.caloriesBurned}
            onChange={(e) => handleChange('caloriesBurned', e.target.value)}
            placeholder="e.g., 350"
          />
        </div>

        <div>
          <Label>Banner Image</Label>
          {bannerPreview && !banner && (
            <div className="mb-2">
              <img src={bannerPreview} alt="Current banner" className="w-full h-32 object-cover rounded border" />
              <p className="text-xs text-gray-500 mt-1">Current banner (upload new to replace)</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] || null)} />
        </div>

        <div>
          <Label>Thumbnail Image</Label>
          {thumbnailPreview && !thumbnail && (
            <div className="mb-2">
              <img src={thumbnailPreview} alt="Current thumbnail" className="w-32 h-32 object-cover rounded border" />
              <p className="text-xs text-gray-500 mt-1">Current thumbnail (upload new to replace)</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
        </div>

        {errorMsg && <div className="text-red-600">{errorMsg}</div>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || categories.length === 0}>
            {isSaving ? 'Saving...' : (<><Save className="w-4 h-4 mr-2"/>Update</>)}
          </Button>
        </div>
      </div>
    </div>
  )
}