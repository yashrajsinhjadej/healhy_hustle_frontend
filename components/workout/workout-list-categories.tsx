// filename: components/workout/workout-list-categories.tsx
"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Pencil, Trash, Play } from 'lucide-react'

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

import { authenticatedFetch, authUtils } from '@/lib/auth'
import { toast } from 'sonner'

interface Workout {
  _id: string
  name: string
  level: string
  duration: number
  thumbnailUrl?: string
  exerciseCount?: number
  sequence?: number
}

function SortableWorkoutRow({
  workout,
  onEdit,
  onDelete,
  onClick,
}: {
  workout: Workout
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
  } = useSortable({ id: workout._id })

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
        onClick={e => {
          e.stopPropagation()
          onClick(workout._id)
        }}
      >
        <div className="relative w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
          <img
            src={workout.thumbnailUrl || "/placeholder-user.jpg"}
            alt={workout.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        </div>
      </td>
      <td
        className="py-3 px-4"
        onClick={e => {
          e.stopPropagation()
          onClick(workout._id)
        }}
      >
        <div className="font-medium text-gray-900">{workout.name}</div>
      </td>
      <td
        className="py-3 px-4"
        onClick={e => {
          e.stopPropagation()
          onClick(workout._id)
        }}
      >
        {workout.level}
      </td>
      <td
        className="py-3 px-4 text-gray-700"
        onClick={e => {
          e.stopPropagation()
          onClick(workout._id)
        }}
      >
        {workout.duration} min
      </td>
      <td
        className="py-3 px-4 text-gray-700"
        onClick={e => {
          e.stopPropagation()
          onClick(workout._id)
        }}
      >
        {workout.exerciseCount ?? 0}
      </td>
      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
        <button
          className="inline-flex items-center gap-1 text-gray-600 hover:text-black mr-3 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
          onClick={e => onEdit(e, workout._id)}
        >
          <Pencil size={16} />
          <span className="text-sm">Edit</span>
        </button>
        <button
          className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
          onClick={e => onDelete(e, workout._id)}
        >
          <Trash size={16} />
          <span className="text-sm">Delete</span>
        </button>
      </td>
    </tr>
  )
}

export default function WorkoutsList() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  useEffect(() => {
    let mounted = true
    const fetchWorkouts = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await authenticatedFetch(`/api/workout/get-by-category`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId }),
        })
        if (res.status === 401) {
          authUtils.clearAuthData()
          return
        }
        const response = await res.json()
        if (!res.ok) {
          setError(response?.error || 'Failed to fetch workouts')
          return
        }
        if (mounted) {
          const data = response?.data ?? []
          const sorted = [...data].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
          setWorkouts(sorted)
        }
      } catch {
        if (mounted) setError('Something went wrong while fetching workouts.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchWorkouts()
    return () => { mounted = false }
  }, [categoryId])

  const handleWorkoutClick = (id: string) => {
    if (!isDragging) {
      router.push(`/Category/workouts/${id}`)
    }
  }

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    router.push(`/Category/workouts/edit?id=${encodeURIComponent(id)}&&categoryId=${encodeURIComponent(categoryId)}`)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this workout? This action cannot be undone.')) return
    try {
      const res = await authenticatedFetch(`/api/workout/admin/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutId: id }),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ message: 'Failed to delete' }))
        toast.error(errJson?.message || 'Failed to delete workout')
        return
      }
      setWorkouts(prev => prev.filter(item => item._id !== id))
      toast.success('Workout was deleted')
    } catch {
      toast.error('Failed to delete workout')
    }
  }

  const handleDragStart = (event: DragStartEvent) => setIsDragging(true)

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = workouts.findIndex(wk => wk._id === active.id)
    const newIndex = workouts.findIndex(wk => wk._id === over.id)

    const prevState = workouts

    // Optimistic reorder (no global +1 here; mirror video logic)
    const reordered = arrayMove(workouts, oldIndex, newIndex)
    setWorkouts(reordered)

    // Prepare payload for ONLY the dragged item, matching video logic
    const workoutId = String(active.id)
    // If backend is 1-based, use newIndex + 1; if not, use newIndex.
    const newSequence = newIndex + 1 // change to `newIndex` if you decide 0-based

    setUpdating(true)
    try {
      const res = await authenticatedFetch(`/api/workout/admin/updatesequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutId,
          categoryId,
          workoutsequence: Number(newSequence),
        }),
      })
      if (res.status === 401) {
        authUtils.clearAuthData()
        throw new Error('Unauthorized')
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(errText || 'Failed to update sequence')
      }

      // Optional: update local sequence numbers for display consistency
      setWorkouts(curr => curr.map((w, idx) => ({
        ...w,
        sequence: newSequence ? (idx + 1) : idx // keep 1-based if you're using +1
      })))

      toast.success('Workout order updated')
    } catch (err) {
      // Revert on error
      setWorkouts(prevState)
      toast.error(
        err instanceof Error ? err.message : 'Failed to update order. Please try again'
      )
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="py-10 text-center text-gray-500">Loading workouts...</div>
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>

  return (
    <div className="overflow-x-auto">
      {updating && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          🔄 Updating workout order...
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600 text-sm">
              <th className="py-3 px-4">Thumbnail</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Level</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Exercises</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <SortableContext items={workouts.map(wk => wk._id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {workouts.map(wk => (
                <SortableWorkoutRow
                  key={wk._id}
                  workout={wk}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={handleWorkoutClick}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
      <div className="mt-4 text-sm text-gray-500">
        Showing {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
