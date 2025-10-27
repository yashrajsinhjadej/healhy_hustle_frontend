'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authenticatedFetch } from '@/lib/auth'

export function EditCategory() {
  const { id } = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    designId: '',
    categorySequence: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // 🧠 Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await authenticatedFetch(`/api/Category/details/${id}`)
        const result = await res.json()
        console.log('📦 Category Details:', result)

        if (res.ok && result?.data) {
          setFormData({
            name: result.data.name || '',
            designId: result.data.designId?.toString() || '',
            categorySequence: result.data.categorySequence?.toString() || '',
          })
        } else {
          throw new Error(result.error || result.message || 'Failed to load category data')
        }
      } catch (err) {
        console.error('❌ Failed to load category data:', err)
        setMessage('❌ Failed to load category data')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchCategory()
  }, [id])

  // 🧩 Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 🚀 Handle save (update API will be added next)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSaving(true)

    try {
      const response = await authenticatedFetch(`/api/Category/update/${id}`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          designId: Number(formData.designId),
          categorySequence: Number(formData.categorySequence),
        }),
      })

      const result = await response.json()
      console.log('📤 Update result:', result)

      if (response.ok) {
        setMessage('✅ Category updated successfully!')
        setTimeout(() => router.push('/Category'), 1000)
      } else {
        setMessage(`❌ ${result.error || 'Failed to update category'}`)
      }
    } catch (err) {
      console.error('❌ Error updating category:', err)
      setMessage('❌ Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700">
        Loading category details...
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
          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              type="number"
              id="designId"
              name="designId"
              value={formData.designId}
              onChange={handleChange}
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
              type="number"
              id="categorySequence"
              name="categorySequence"
              value={formData.categorySequence}
              onChange={handleChange}
              placeholder="Enter category sequence"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full bg-black text-white py-2 rounded-lg transition ${
              saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Message */}
          {message && (
            <p
              className={`text-center text-sm mt-2 ${
                message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
