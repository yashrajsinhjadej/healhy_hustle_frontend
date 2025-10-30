// filename: app/Category/workouts/page.tsx (or wherever this component lives)
"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface Workout {
  _id: string
  name: string
  level: string
  duration: number
  thumbnailUrl?: string
  exerciseCount?: number
  sequence?: number
  categoryWorkoutId?: string
}

interface WorkoutsResponse {
  message: string
  data: Workout[]
  error?: string
}

export default function WorkoutsList() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchWorkouts() {
      try {
        setLoading(true)
        setError('')

        const res = await authenticatedFetch(`/api/workout/get-by-category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ categoryId }),
        })

        if (res.status === 401) {
          authUtils.clearAuthData()
          return
        }

        const response: WorkoutsResponse = await res.json()

        if (!res.ok) {
          setError(response?.error || 'Failed to fetch workouts')
          return
        }

        if (mounted) {
          setWorkouts(response?.data ?? [])
        }
      } catch (err) {
        if (mounted) {
          setError('Something went wrong while fetching workouts.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchWorkouts()
    return () => {
      mounted = false
    }
  }, [categoryId])

  function handleWorkoutClick(workoutId: string) {
    router.push(`/Category/workouts/${workoutId}`)
  }

  async function handleDelete(workoutId: string, e: React.MouseEvent) {
    e.stopPropagation()

    const ok = confirm('Delete this workout? This action cannot be undone.')
    if (!ok) return

    try {
      setDeletingId(workoutId)

      const res = await authenticatedFetch(`/api/workout/admin/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send workoutId in JSON body; change key if your API expects `id`
        body: JSON.stringify({ workoutId }),
      })

      if (res.status === 401) {
        authUtils.clearAuthData()
        return
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ message: 'Failed to delete' }))
        alert(errJson?.message || 'Failed to delete workout')
        return
      }

      setWorkouts((prev) => prev.filter(item => item._id !== workoutId))
      toast({ title: 'Workout was deleted' })
    } catch (err) {
      console.error('Delete failed', err)
      alert('Failed to delete workout')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">{error}</p>
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <div
              key={workout._id}
              className="bg-white border border-[#E6E6E6] rounded-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleWorkoutClick(workout._id)}
            >
              <img
                src={workout.thumbnailUrl || '/placeholder-user.jpg'}
                alt={workout.name}
                className="w-full h-48 object-cover object-center"
              />
              <div className="flex-1 flex flex-col p-4">
                <h3 className="text-lg font-semibold mb-1">{workout.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Level: {workout.level}</p>
                <p className="text-sm text-gray-600 mb-1">Duration: {workout.duration} min</p>
                <p className="text-sm text-gray-600 mb-4">
                  Exercises: {workout.exerciseCount || 0}
                </p>
                <div className="mt-auto flex gap-2">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(
                        `/Category/workouts/edit?id=${encodeURIComponent(workout._id)}&&categoryId=${encodeURIComponent(categoryId)}`
                      )
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-900 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => handleDelete(workout._id, e)}
                    disabled={deletingId === workout._id}
                  >
                    {deletingId === workout._id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" />
                        Deleting...
                      </span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No workouts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
