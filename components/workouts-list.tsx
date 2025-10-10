"use client"

import { useEffect, useState } from 'react'
import { authenticatedFetch, authUtils } from '@/lib/auth'

interface Workout {
  _id: string
  name: string
  category: string[]
  level: string
  duration: number
  thumbnailUrl?: string
  exerciseCount?: number
  sequence?: number
}

interface WorkoutsResponse {
  message: string
  data: {
    workouts: Workout[]
    pagination: {
      totalDocuments: number
      totalPages: number
      currentPage: number
      pageSize: number
    }
  }
}

export default function WorkoutsList() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function fetchWorkouts() {
      try {
        setError('')
        const res = await authenticatedFetch('/api/workout/list')

        if (res.status === 401) {
          authUtils.clearAuthData()
          // Let caller handle redirect if needed
          return
        }

        const data: WorkoutsResponse = await res.json()
        if (!res.ok) {
          setError((data as any)?.error || 'Failed to fetch workouts')
          return
        }

        const list = data?.data?.workouts ?? []
        if (mounted) setWorkouts(list)
      } catch (err) {
        if (mounted) setError('Something went wrong while fetching workouts.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchWorkouts()
    return () => { mounted = false }
  }, [])

  if (loading) return <p className="text-center mt-8">Loading workouts...</p>
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Workouts</h1>
      <div className="grid gap-4">
        {workouts.length > 0 ? (
          workouts.map((w) => (
            <div key={w._id} className="p-4 border rounded shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3">
                {w.thumbnailUrl ? (
                  <img src={w.thumbnailUrl} alt={w.name} className="w-20 h-20 object-cover rounded" />
                ) : null}
                <div>
                  <h2 className="text-lg font-semibold">{w.name}</h2>
                  <p className="text-sm text-gray-600">Category: {Array.isArray(w.category) ? w.category.join(', ') : String(w.category)}</p>
                  <p className="text-sm text-gray-600">Level: {w.level}</p>
                  <p className="text-sm text-gray-600">Duration: {w.duration} min</p>
                  {typeof w.exerciseCount === 'number' && (
                    <p className="text-sm text-gray-600">Exercises: {w.exerciseCount}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No workouts found.</p>
        )}
      </div>
    </div>
  )
}
