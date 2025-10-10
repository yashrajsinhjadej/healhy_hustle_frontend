"use client"

import { useEffect, useState } from 'react'
import { authenticatedFetch, authUtils } from '@/lib/auth'
import { Button } from '@/components/ui/button'
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
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

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
          // Let caller handle redirect if needed
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

  if (loading) return <p className="text-center mt-8">Loading workouts...</p>
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>

  return (
    <div className={`${styles.workoutsWrapper} w-full`}>
      <div className={styles.container}>
        <div className={`${styles.cardGrid}`}>
        {workouts.length > 0 ? (
          workouts.map((w) => (
            <div key={w._id} className={`${styles.card}`}>
              <img
                src={w.thumbnailUrl || '/placeholder-user.jpg'}
                alt={w.name}
                className={styles.cardImage}
              />

              <div className={styles.cardBody}>
                <h3 className={styles.title}>{w.name}</h3>
                <p className={styles.subtitle}>Category: {Array.isArray(w.category) ? w.category.join(', ') : String(w.category)}</p>
                <p className={styles.subtitle}>Level: {w.level}</p>
                <p className={styles.subtitle}>Duration: {w.duration} min</p>

                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => console.log('edit', w._id)}>Edit</button>
                  <button className={styles.btnDelete} onClick={() => console.log('delete', w._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No workouts found.</p>
        )}
        </div>
      </div>

      <div className={`${styles.container}`}>
        {totalPages !== null && currentPage < totalPages ? (
          <div className="flex justify-center mt-6">
            <Button onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        ) : (
          <div className="flex justify-center mt-6 text-sm text-gray-500">{workouts.length > 0 ? 'End of results' : ''}</div>
        )}
      </div>
    </div>
  )
}
