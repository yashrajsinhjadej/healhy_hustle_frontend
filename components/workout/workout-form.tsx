"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, X } from 'lucide-react'
import { authUtils, authenticatedFetch } from '@/lib/auth'

interface Category {
  _id: string
  name: string
}

export default function WorkoutForm({ onSuccess, redirectTo }: { onSuccess?: () => void, redirectTo?: string }) {
  const searchParams = useSearchParams()
  const categoryIdFromUrl = searchParams.get('categoryId')

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)

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
    async function loadCategories() {
      try {
        setLoadingCategories(true)
        setErrorMsg(null)

        const res = await authenticatedFetch('/api/Category', { method: 'GET' })

        if (res.status === 401) {
          authUtils.clearAuthData()
          return
        }

        const ct = res.headers.get('content-type') || ''
        const data = ct.includes('application/json') ? await res.json() : { data: [], message: await res.text() }

        if (!res.ok) {
          setErrorMsg((data as any)?.message || 'Failed to load categories')
          return
        }

        const cats: Category[] = Array.isArray((data as any)?.data) ? (data as any).data : []
        if (mounted) {
          setCategories(cats)
          
          // Preselect category based on URL param or fallback to first category
          if (cats.length > 0 && form.categoryIds.length === 0) {
            if (categoryIdFromUrl && cats.some(cat => cat._id === categoryIdFromUrl)) {
              // If valid categoryId in URL, preselect it
              setForm(prev => ({ ...prev, categoryIds: [categoryIdFromUrl] }))
            } else {
              // Fallback to first category
              setForm(prev => ({ ...prev, categoryIds: [cats[0]._id] }))
            }
          }
        }
      } catch (err: any) {
        if (mounted) setErrorMsg(err?.message || 'Failed to load categories')
      } finally {
        if (mounted) setLoadingCategories(false)
      }
    }
    loadCategories()
    return () => { mounted = false }
  }, [categoryIdFromUrl]) // Added categoryIdFromUrl as dependency

  const capitalizeFirstLetter = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s

  const handleSave = async () => {
    setErrorMsg(null)

    if (!form.name.trim()) return setErrorMsg('Name is required')
    if (!form.level) return setErrorMsg('Level is required')
    if (!form.introduction.trim()) return setErrorMsg('Introduction is required')
    if (!form.categoryIds.length) return setErrorMsg('Select at least one category')
    if (!banner) return setErrorMsg('Banner image is required')
    if (!thumbnail) return setErrorMsg('Thumbnail image is required')
    if (form.caloriesBurned && isNaN(Number(form.caloriesBurned))) {
      return setErrorMsg('Calories burned must be a number')
    }

    setIsSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)

      const levelCapitalized = capitalizeFirstLetter(form.level)
      fd.append('level', levelCapitalized)

      fd.append('introduction', form.introduction)

      if (form.caloriesBurned) {
        fd.append('caloriesBurned', String(Number(form.caloriesBurned)))
      }

      form.categoryIds.forEach((id, index) => {
        fd.append(`categoryIds[${index}]`, id)
      })

      if (banner) fd.append('banner', banner, banner.name)
      if (thumbnail) fd.append('thumbnail', thumbnail, thumbnail.name)

      const headers: Record<string, string> = { ...(authUtils.getAuthHeader() as Record<string, string>) }

      const res = await fetch('/api/workout/admin/create', { method: 'POST', headers, body: fd })
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : { message: await res.text() }

      if (!res.ok) return setErrorMsg((data as any)?.message || 'Failed to create workout')

      if (redirectTo) {
        window.location.href = redirectTo
        return
      }
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create workout')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
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
              disabled={loadingCategories || categories.length === 0}
              value=""
            >
              <option value="" disabled>
                {loadingCategories ? 'Loading categories...' : (categories.length === 0 ? 'No categories available' : 'Add a category…')}
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
          <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] || null)} />
        </div>

        <div>
          <Label>Thumbnail Image</Label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
        </div>

        {errorMsg && <div className="text-red-600">{errorMsg}</div>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || loadingCategories || categories.length === 0}>
            {isSaving ? 'Saving...' : (<><Save className="w-4 h-4 mr-2"/>Save</>)}
          </Button>
        </div>
      </div>
    </div>
  )
}