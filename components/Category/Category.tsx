// app/(admin)/Category/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from "next/navigation"

// 🎯 DND-KIT IMPORTS
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

// 🎯 SORTABLE ROW COMPONENT
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
          // Prevent drag when clicking on the cell content
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

// 🎯 MAIN COMPONENT
export function Category() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [updating, setUpdating] = useState(false)

  // 🎯 CONFIGURE SENSORS WITH DELAY
  // This is the magic! 250ms delay before drag starts
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,      // Wait 250ms before starting drag
        tolerance: 5,    // Allow 5px movement during delay
      },
    })
  )

  const handleCategoryClick = (categoryId: string) => {
    // Only navigate if not dragging
    if (!isDragging) {
      console.log('Category clicked:', categoryId)
      router.push(`/Category/${categoryId}`)
    }
  }

  // Fetch user info
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

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/Category')
      console.log('Category API response:', response)
      if (response.ok) {
        const data = await response.json()
        // Sort by categorySequence to ensure correct order
        const sortedCategories = (data.data || []).sort(
          (a: any, b: any) => a.categorySequence - b.categorySequence
        )
        setCategories(sortedCategories)
      } else {
        console.error('Failed to fetch categories:', response.status)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // 🎯 DRAG START HANDLER
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    console.log('Drag started:', event.active.id)
  }

  // 🎯 DRAG END HANDLER - THE MAIN LOGIC
  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event

    // If dropped outside or in same position, do nothing
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = categories.findIndex((cat) => cat._id === active.id)
    const newIndex = categories.findIndex((cat) => cat._id === over.id)

    console.log(`Moving category from index ${oldIndex} to ${newIndex}`)

    // 1️⃣ OPTIMISTIC UPDATE: Reorder local state immediately
    const reorderedCategories = arrayMove(categories, oldIndex, newIndex)
    setCategories(reorderedCategories)

    // 2️⃣ CALCULATE NEW SEQUENCE (array index starts at 0, sequence starts at 1)
    const newSequence = newIndex + 1
    const categoryId = active.id as string

    console.log(`Updating category ${categoryId} to sequence ${newSequence}`)

    // 3️⃣ CALL API TO UPDATE SEQUENCE
    setUpdating(true)
    try {
      const response = await authenticatedFetch(`/api/Category/update/${categoryId}`, {
        method: 'POST',
        body: JSON.stringify({
          categorySequence: newSequence,
        }),
      })

      if (response.ok) {
        console.log('✅ Category sequence updated successfully')
        
        // 4️⃣ REFETCH TO ENSURE SYNC WITH BACKEND
        // This is important because backend might have adjusted other sequences
        await fetchCategories()
      } else {
        console.error('❌ Failed to update category sequence')
        
        // 5️⃣ REVERT ON ERROR: Restore original order
        setCategories(categories)
        alert('Failed to update category order. Please try again.')
      }
    } catch (err) {
      console.error('❌ Error updating category:', err)
      
      // REVERT ON ERROR
      setCategories(categories)
      alert('An error occurred while updating category order.')
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

            {/* Show updating indicator */}
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
                {/* 🎯 DND CONTEXT WRAPS THE TABLE */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  autoScroll={{
                    enabled: true,
                    threshold: {
                      x: 0,      // Disable horizontal auto-scroll
                      y: 0.1,    // Vertical scroll only near edges (10% threshold)
                    },
                    acceleration: 3,  // Slower, more controlled scrolling
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
                    
                    {/* 🎯 SORTABLE CONTEXT WRAPS TBODY */}
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