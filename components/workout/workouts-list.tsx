"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import styles from './workouts-list.module.css'

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
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchWorkouts(page = 1, append = false) {
      try {
        if (append) setLoadingMore(true)
        else setLoading(true)
        setError('')

        const res = await authenticatedFetch(`/api/workout/list?page=${page}`)

        if (res.status === 401) {
          authUtils.clearAuthData()
          return
        }

        const data: WorkoutsResponse = await res.json()
        if (!res.ok) {
          setError((data as any)?.error || 'Failed to fetch workouts')
          return
        }

        const list = data?.data?.workouts ?? []
        const pagination = data?.data?.pagination
        if (mounted) {
          setTotalPages(pagination?.totalPages ?? null)
          setCurrentPage(pagination?.currentPage ?? page)
          setWorkouts((prev) => (append ? [...prev, ...list] : list))
        }
      } catch (err) {
        if (mounted) setError('Something went wrong while fetching workouts.')
      } finally {
        if (mounted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }

    fetchWorkouts(1, false)
    return () => { mounted = false }
  }, [])

  async function loadMore() {
    if (loadingMore) return
    const next = currentPage + 1
    if (totalPages !== null && next > totalPages) return
    try {
      setError('')
      setLoadingMore(true)
      const res = await authenticatedFetch(`/api/workout/list?page=${next}`)

      if (res.status === 401) {
        authUtils.clearAuthData()
        return
      }

      const data: WorkoutsResponse = await res.json()
      if (!res.ok) {
        setError((data as any)?.error || 'Failed to fetch workouts')
        return
      }

      const list = data?.data?.workouts ?? []
      const pagination = data?.data?.pagination
      setWorkouts((prev) => [...prev, ...list])
      setCurrentPage(pagination?.currentPage ?? next)
      setTotalPages(pagination?.totalPages ?? null)
    } catch (err) {
      setError('Something went wrong while fetching workouts.')
    } finally {
      setLoadingMore(false)
    }
  }

  function handleWorkoutClick(workoutId: string) {
    router.push(`/workouts/${workoutId}`)
  }

  if (loading) return <p className="text-center mt-8">Loading workouts...</p>
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workouts.length > 0 ? (
          workouts.map((w) => (
            <div
              key={w._id}
              className="bg-white border border-[#E6E6E6] rounded-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleWorkoutClick(w._id)}
            >
              <img
                src={w.thumbnailUrl || '/placeholder-user.jpg'}
                alt={w.name}
                className="w-full h-48 object-cover object-center"
              />
              <div className="flex-1 flex flex-col p-4">
                <h3 className="text-lg font-semibold mb-1">{w.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Category: {Array.isArray(w.category) ? w.category.join(', ') : String(w.category)}
                </p>
                <p className="text-sm text-gray-600 mb-1">Level: {w.level}</p>
                <p className="text-sm text-gray-600 mb-4">Duration: {w.duration} min</p>
                <div className="mt-auto flex gap-2">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('edit', w._id)
                      router.push(`/workouts/edit?id=${encodeURIComponent(w._id)}`)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-900 text-white font-medium"
                    onClick={async (e) => {
                      e.stopPropagation() // prevent card navigation to /workouts/:id
                      const ok = confirm('Delete this workout? This action cannot be undone.')
                      if (!ok) return
                      try {
                        setDeletingId(w._id)
                        const res = await authenticatedFetch(`/api/workout/admin/delete/${w._id}`, { method: 'DELETE' })
                        if (res.status === 401) {
                          authUtils.clearAuthData()
                          return
                        }
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({ message: 'Failed to delete' }))
                          alert(err?.message || 'Failed to delete workout')
                          return
                        }
                        setWorkouts((prev) => prev.filter(item => item._id !== w._id))
                        toast({ title: 'Workout was deleted' })
                      } catch (err) {
                        console.error('Delete failed', err)
                        alert('Failed to delete workout')
                      } finally {
                        setDeletingId(null)
                      }
                    }}
                    disabled={deletingId === w._id}
                  >
                    {deletingId === w._id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" /> Deleting...
                      </span>
                    ) : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No workouts found.</p>
        )}
      </div>
      <div>
        {totalPages !== null && currentPage < totalPages ? (
          <div className="flex justify-center mt-6">
            <Button onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        ) : (
          <div className="flex justify-center mt-6 text-sm text-gray-500">
            {workouts.length > 0 ? 'End of results' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
