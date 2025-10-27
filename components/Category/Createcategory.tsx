'use client'

import { useState } from 'react'
import { authenticatedFetch } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export function CreateCategory() {
  const [formData, setFormData] = useState({
    name: '',
    designId: '',
    categorySequence: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      // ✅ use authenticatedFetch instead of plain fetch
      const response = await authenticatedFetch('/api/Category/create', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          designId: Number(formData.designId),
          categorySequence: Number(formData.categorySequence),
        }),
      })

      const result = await response.json()
      console.log('🔍 Category create result:', result)

      if (response.ok) {
        setMessage('✅ Category created successfully!')
        setFormData({ name: '', designId: '', categorySequence: '' })
         setTimeout(() => {
            router.push('/Category') // ✅ redirect to /Category
        }, 500)
      } else {
        setMessage(`❌ ${result.error || 'Failed to create category.'}`)
      }
    } catch (err) {
      console.error('❌ Error creating category:', err)
      setMessage('❌ Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Create New Category
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label
              htmlFor="categorySequence"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black text-white py-2 rounded-lg transition ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
          >
            {loading ? 'Creating...' : 'Create Category'}
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
