// app/(admin)/Category/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableRow({ 
  category, 
  onEdit, 
  onDelete, 
  onClick 
}: { 
  category: any
  onEdit: (e: React.MouseEvent, id: string) => void
  onDelete: (e: React.MouseEvent, id: string) => void
  onClick: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f3f4f6' : 'transparent',
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <td 
        className="py-3 px-4"
        onClick={(e) => {
          e.stopPropagation()
          onClick(category._id)
        }}
      >
        {category.designId}
      </td>
      <td 
        className="py-3 px-4"
        onClick={(e) => {
          e.stopPropagation()
          onClick(category._id)
        }}
      >
        {category.name}
      </td>
      <td 
        className="py-3 px-4"
        onClick={(e) => {
          e.stopPropagation()
          onClick(category._id)
        }}
      >
        {category.totalWorkouts || 0}
      </td>
      <td 
        className="py-3 px-4 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="inline-flex items-center gap-1 text-gray-600 hover:text-black mr-3 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
          onClick={(e) => onEdit(e, category._id)}
        >
          <Pencil size={16} />
          <span className="text-sm">Edit</span>
        </button>
        <button
          className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
          onClick={(e) => onDelete(e, category._id)}
        >
          <Trash2 size={16} />
          <span className="text-sm">Delete</span>
        </button>
      </td>
    </tr>
  )
}

export function Category() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [updating, setUpdating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const handleCategoryClick = (categoryId: string) => {
    if (!isDragging) {
      router.push(`/Category/${categoryId}`)
    }
  }

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

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/Category')
      if (response.ok) {
        const data = await response.json()
        const sortedCategories = (data.data || []).sort(
          (a: any, b: any) => a.categorySequence - b.categorySequence
        )
        setCategories(sortedCategories)
      } else {
        let msg = `Failed to fetch categories (status ${response.status})`
        try {
          const data = await response.json()
          msg = data?.error || data?.message || msg
        } catch {}
        console.error(msg)
        toast.error(msg)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      toast.error('Network error while fetching categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = categories.findIndex((cat) => cat._id === active.id)
    const newIndex = categories.findIndex((cat) => cat._id === over.id)

    const reorderedCategories = arrayMove(categories, oldIndex, newIndex)
    setCategories(reorderedCategories)

    const newSequence = newIndex + 1
    const categoryId = active.id as string

    setUpdating(true)
    try {
      const response = await authenticatedFetch(`/api/Category/update/${categoryId}`, {
        method: 'POST',
        body: JSON.stringify({ categorySequence: newSequence }),
      })

      if (response.ok) {
        await fetchCategories()
        toast.success('Category order updated successfully')
      } else {
        // read backend error payload
        let msg = `Failed to update category order (status ${response.status})`
        try {
          const data = await response.json()
          msg = data?.error || data?.message || msg
        } catch {}
        setCategories(categories) // revert
        toast.error(msg)
      }
    } catch (err) {
      setCategories(categories) // revert
      toast.error('Network error while updating category order.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteCategory = async (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      const response = await authenticatedFetch(`/api/Category/delete/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId))
        toast.success('Category deleted successfully')
      } else {
        // Read and surface backend error
        let msg = `Failed to delete category (status ${response.status})`
        try {
          const data = await response.json()
          // ResponseHandler returns { message, error }
          msg = data?.error || data?.message || msg
        } catch {
          // If body is not JSON or already consumed, keep default msg
        }

        // Optionally handle specific codes differently
        if (response.status === 403 || response.status === 409) {
          toast.error(msg) // e.g., "Category cannot be deleted while it has active workouts..."
        } else {
          toast.error(msg)
        }
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      toast.error('Network error while deleting category.')
    }
  }

  const handleCreateCategory = () => {
    router.push('/Category/create')
  }

  const handleEditCategory = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation()
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
              <div>
                <h2 className="text-lg font-semibold">Training category</h2>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Press and hold any row for 250ms to reorder categories
                </p>
              </div>
              <button
                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                onClick={handleCreateCategory}
              >
                Add Category
              </button>
            </div>

            {updating && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                🔄 Updating category order...
              </div>
            )}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No categories found</div>
            ) : (
              <div className="overflow-x-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  autoScroll={{
                    enabled: true,
                    threshold: { x: 0, y: 0.1 },
                    acceleration: 3,
                  }}
                >
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b text-gray-600 text-sm">
                        <th className="py-3 px-4">D-ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Total workouts</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={categories.map((cat) => cat._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody>
                        {categories.map((cat) => (
                          <SortableRow
                            key={cat._id}
                            category={cat}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                            onClick={handleCategoryClick}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </DndContext>
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
