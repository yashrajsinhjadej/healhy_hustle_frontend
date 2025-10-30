// filename: app/Category/[id]/page.tsx
"use client"

import { SidebarAdmin } from '@/components/sidebar-admin'
import WorkoutsList from '@/components/workout/workout-list-categories' // If you want to use app/Category/workouts/page.tsx directly, you can also import from that path
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { useState, useEffect } from 'react'
import { authenticatedFetch, authUtils, User as UserType } from '@/lib/auth'
import { useRouter, useParams } from 'next/navigation'

export default function CategoryWorkoutsPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  
  const [searchTerm, setSearchTerm] = useState("")
  const [userProfile, setUserProfile] = useState<UserType | null>(null)
  const [categoryName, setCategoryName] = useState("")

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

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return
      try {
        const response = await authenticatedFetch(`/api/Category/${categoryId}`)
        if (response.ok) {
          const data = await response.json()
          setCategoryName(data.data?.name || "")
        }
      } catch {
        // ignore
      }
    }
    fetchCategory()
  }, [categoryId])

  const handleAddWorkout = () => {
    router.push(`/Category/workouts/create?categoryId=${categoryId}`)
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <Navbar
          userProfile={userProfile ?? undefined}
          searchTerm={searchTerm}
          onSearch={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          heading={`Good Morning, ${userProfile?.name || 'Johndeo34253'}`}
          placeholder="search workouts"
        />

        <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#000000]">
              {categoryName ? `${categoryName} - Training Sessions` : 'Training Session Management'}
            </h1>
            <Button
              className="bg-[#000000] text-white hover:bg-[#212121]"
              onClick={handleAddWorkout}
            >
              Add Workout
            </Button>
          </div>

          {/* Workouts table (no internal Add button) */}
          <WorkoutsList />
        </div>
      </div>
    </div>
  )
}
