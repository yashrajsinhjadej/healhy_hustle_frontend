'use client'
import { useState, useEffect } from 'react'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from "next/navigation"

export function Category() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 🧭 Fetch user info (same logic)
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

  // 🧩 Fetch categories from API (instead of dummy data)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const response = await authenticatedFetch('/api/Category') // ✅ Calls your Next.js route
        console.log('Category API response:', response)
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        } else {
          console.error('Failed to fetch categories:', response.status)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

 const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      const response = await authenticatedFetch(`/api/Category/delete/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId))
      } else {
        console.error('Failed to delete category:', response.status)
      }
    } catch (err) {
      console.error('Error deleting category:', err)
    }
  }

const handleCreateCategory = () => {
  router.push('/Category/create')
  }

  const handleEditCategory = (categoryId: string) => {
    router.push(`/Category/edit/${categoryId}`)
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
          heading={`Good Morning, ${userProfile?.name || 'Johndeo34253'}`}
          placeholder="Search Categories"
        />

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Training category</h2>
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800" onClick={()=>handleCreateCategory()}>
                Add Category
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No categories found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-gray-600 text-sm">
                      <th className="py-3 px-4">D-ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Total workouts</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{cat.designId}</td>
                        <td className="py-3 px-4">{cat.name}</td>
                        
                        <td className="py-3 px-4">
                          {cat.totalWorkouts || 0}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-gray-500 hover:text-black mr-3" onClick={()=>handleEditCategory(cat._id)}>
                            <Pencil size={16} />
                          </button>
                          <button className="text-gray-500 hover:text-red-600" onClick={() => handleDeleteCategory(cat._id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && (
              <div className="mt-4 text-sm text-gray-500">
                Showing {categories.length} categories
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
