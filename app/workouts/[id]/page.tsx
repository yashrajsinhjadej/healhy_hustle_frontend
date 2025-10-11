"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { authenticatedFetch, authUtils, User as UserType } from '@/lib/auth'
import { ChevronLeft, Clock, Dumbbell, Target, Plus, Eye } from 'lucide-react'

interface WorkoutData {
  name: string;
  category: string[];
  bannerUrl: string;
  level: string;
  duration: number;
  introduction: string;
  videos: any[];
}

interface WorkoutResponse {
  message: string
  data: WorkoutData
}

export default function WorkoutDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string
  
  const [workout, setWorkout] = useState<WorkoutData | null>(null)
  const [userProfile, setUserProfile] = useState<UserType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch workout details
  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) return

      try {
        setIsLoading(true)
        setError("")

        const response = await authenticatedFetch('/api/workout/get-by-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workoutId }),
        })

        if (response.ok) {
          const data: WorkoutResponse = await response.json()
          setWorkout(data.data)
        } else {
          setError('Failed to fetch workout details')
        }
      } catch (error) {
        setError('Error loading workout')
        console.error('Error fetching workout:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkout()
  }, [workoutId])

  // Fetch user profile
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
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  console.log('Workout state:', workout);
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#f4f5f6]">
        <SidebarAdmin />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workout details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="flex min-h-screen bg-[#f4f5f6]">
        <SidebarAdmin />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Workout not found'}</p>
            <Button onClick={() => router.back()}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      
      {/* Main Content */}
      <div className="flex-1">
        <Navbar 
          userProfile={userProfile ?? undefined} 
          searchTerm={searchTerm} 
          onSearch={(e) => setSearchTerm(e.target.value)} 
          heading={`Good Morning, ${userProfile?.name || 'Johndeo34253'}`} 
        />
        
        <div className="flex">
          {/* Left Content Area */}
          <div className="flex-1 p-6">
            {/* Workout Header */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="mb-4 p-0 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to workouts
              </Button>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{workout.name}</h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(workout.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="capitalize">{workout.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  <span>{Array.isArray(workout.category) ? workout.category.join(', ') : (workout.category || 'N/A')}</span>
                </div>
                {/* createdAt removed as per new requirements */}
              </div>
            </div>

            {/* Banner Image */}
            <div className="mb-8">
              <img 
                src={workout.bannerUrl} 
                alt={workout.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {workout.introduction}
                </p>
              </div>
            </div>

            {/* Videos Section (if needed) */}
            {/* You can add a section here to display workout.videos if required */}
          </div>

          {/* Right Sidebar removed as per new requirements */}
        </div>
      </div>
    </div>
  )
}
