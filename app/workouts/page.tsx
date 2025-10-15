"use client"
import { SidebarAdmin } from '@/components/sidebar-admin'
import WorkoutsList from '@/components/workout/workouts-list'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { useState, useEffect } from 'react'
import { authenticatedFetch, authUtils, User as UserType } from '@/lib/auth'


export default function WorkoutsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userProfile, setUserProfile] = useState<UserType | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = authUtils.getUser()
        if (storedUser) {
          setUserProfile(storedUser)
          return
        }
        const response = await authenticatedFetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data.user)
        }
      } catch (error) {
        // ignore
      }
    }
    fetchUserProfile()
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <Navbar
          userProfile={userProfile ?? undefined}
          searchTerm={searchTerm}
          onSearch={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          heading={`Good Morning, ${userProfile?.name || 'Johndeo34253'}`}
        />
  <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#000000]">Training Session Management</h1>
            <Button asChild className="bg-[#000000] text-white hover:bg-[#212121]">
              <a href="/workouts/create">Add Workout</a>
            </Button>
          </div>
          <WorkoutsList />
        </div>
      </div>
    </div>
  )
}
