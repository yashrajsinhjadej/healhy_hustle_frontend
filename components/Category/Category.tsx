'use client'
import { useState, useEffect } from 'react'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { Pencil, Trash2 } from 'lucide-react'

export function Category() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [categories, setCategories] = useState<any[]>([])

  // 🧭 Fetch user info
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = authUtils.getUser()
        if (storedUser) {
          setUserProfile(storedUser)
          return
        }
        const response = await authenticatedFetch("/api/users/profile")
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

  // 🧩 Fetch dummy category data
  useEffect(() => {
    const dummyData = [
      { id: 28, name: 'PICK FOR YOU', totalWorkout: 7 },
      { id: 35, name: 'FOR BEGINNER', totalWorkout: 5 },
      { id: 41, name: 'STRETCH', totalWorkout: 5 },
      { id: 24, name: 'Emma White', totalWorkout: 5 },
      { id: 28, name: 'PICK FOR YOU', totalWorkout: 7 },
      { id: 35, name: 'FOR BEGINNER', totalWorkout: 5 },
      { id: 41, name: 'STRETCH', totalWorkout: 5 },
      { id: 24, name: 'Emma White', totalWorkout: 5 },
    ]
    setCategories(dummyData)
  }, [])

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
          placeholder='Search Categories'
        />

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Training category</h2>
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                Add Category
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-600 text-sm">
                    <th className="py-3 px-4">D-ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Total workout</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">{cat.id}</td>
                      <td className="py-3 px-4">{cat.name}</td>
                      <td className="py-3 px-4">{cat.totalWorkout}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-gray-500 hover:text-black mr-3">
                          <Pencil size={16} />
                        </button>
                        <button className="text-gray-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Showing 1 to {categories.length} of {categories.length} entries
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
