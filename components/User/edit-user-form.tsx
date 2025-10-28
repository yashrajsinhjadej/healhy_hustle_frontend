// app/Category/[id]/EditCategory.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authenticatedFetch } from '@/lib/auth'

type CategoryDetail = {
  _id: string
  name: string
  designId: number | string
  categorySequence: number | string
}

export function EditCategory() {
  const { id } = useParams() as { id?: string }
  const router = useRouter()

  const [category, setCategory] = useState<CategoryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state mirrors server fields (same as EditUserForm approach)
  const [formData, setFormData] = useState({
    name: '',
    designId: '',
    categorySequence: '',
  })

  // Prevent race conditions between rapid navigations/refetches
  const activeFetch = useRef(0)

  const fetchCategory = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError('')
    const fetchId = ++activeFetch.current

    try {
      const res = await authenticatedFetch(`/api/Category/details/${id}?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      const result = await res.json()
      if (fetchId !== activeFetch.current) return

      if (!res.ok || !result?.data) {
        throw new Error(result.error || result.message || 'Failed to load category data')
      }

      const data: CategoryDetail = result.data
      setCategory(data)

      // Reset form strictly to server values (same pattern as EditUserForm)
      setFormData({
        name: data.name ? String(data.name) : '',
        designId: data.designId !== undefined && data.designId !== null ? String(data.designId) : '',
        categorySequence: data.categorySequence !== undefined && data.categorySequence !== null ? String(data.categorySequence) : '',
      })
    } catch (err) {
      console.error('Error fetching category:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch category data')
    } finally {
      if (fetchId === activeFetch.current) setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCategory()
  }, [fetchCategory])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      // Build payload like EditUserForm does (send what backend accepts)
      const payload = {
        name: formData.name.trim(),
        designId: formData.designId ? Number(formData.designId) : null,
        categorySequence: formData.categorySequence ? Number(formData.categorySequence) : null,
      }

      const res = await authenticatedFetch(`/api/Category/update/${id}`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (!res.ok) {
        const msg = result.error || result.message || 'Failed to update category'
        setError(msg)
        return
      }

      // Use updated doc when available; otherwise refetch (same as EditUserForm pattern)
      if (result?.data) {
        const updated: CategoryDetail = result.data
        setCategory(updated)
        setFormData({
          name: updated.name ? String(updated.name) : '',
          designId: updated.designId !== undefined && updated.designId !== null ? String(updated.designId) : '',
          categorySequence: updated.categorySequence !== undefined && updated.categorySequence !== null ? String(updated.categorySequence) : '',
        })
      } else {
        await fetchCategory()
      }

      // Success UX consistent with your user form
      alert('Category updated successfully!')
      router.push('/Category')
    } catch (err) {
      console.error('Error updating category:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => router.push('/Category')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700">
        Loading category details...
      </div>
    )
  }

  if (error && !category) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Edit Category
        </h2>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter category name"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Design ID */}
          <div>
            <label htmlFor="designId" className="block text-sm font-medium text-gray-700 mb-1">
              Design ID
            </label>
            <input
              id="designId"
              name="designId"
              type="number"
              value={formData.designId}
              onChange={handleInputChange}
              placeholder="Enter design ID"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Category Sequence */}
          <div>
            <label htmlFor="categorySequence" className="block text-sm font-medium text-gray-700 mb-1">
              Category Sequence
            </label>
            <input
              id="categorySequence"
              name="categorySequence"
              type="number"
              value={formData.categorySequence}
              onChange={handleInputChange}
              placeholder="Enter category sequence"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full bg-black text-white py-2 rounded-lg transition ${
                isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          {error && (
            <p className="text-center text-sm mt-2 text-red-600">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
