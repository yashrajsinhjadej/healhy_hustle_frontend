"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { authenticatedFetch, authUtils, User as UserType } from '@/lib/auth'
import { ChevronLeft, Clock, Dumbbell, Target, Plus, Eye, Play } from 'lucide-react'

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
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  console.log("Params:", params, "WorkoutId:", workoutId);

  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
        });
        console.log("[API] Response status:", response.status, "ok:", response.ok);
        const data: WorkoutResponse = await response.json();
        console.log("[API] Response JSON:", data);
        if (response.ok) {
          setWorkout(data.data);
          console.log("[setWorkout] Setting workout to:", data.data);
        } else {
          setError('Failed to fetch workout details');
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

  const formatVideoDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null
    try {
      const urlObj = new URL(url)
      if (urlObj.searchParams.has('v')) {
        return urlObj.searchParams.get('v')
      }
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1)
      }
      return null
    } catch {
      return null
    }
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
          heading={`Good Morning, ${userProfile?.name || 'User'}`} 
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

            {/* Videos Section */}
            {Array.isArray(workout.videos) && workout.videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Exercise Videos</h2>
                <div className="space-y-4">
                  {workout.videos.map((video, idx) => {
                    if (!video || !video.youtubeUrl) return null
                    
                    const videoId = getYouTubeVideoId(video.youtubeUrl)
                    
                    return (
                      <div key={video._id || idx} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Video Thumbnail */}
                          <div className="flex-shrink-0">
                            <div className="relative w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer">
                              {videoId ? (
                                <img 
                                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                  <Play className="w-12 h-12 text-gray-500" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                <Play className="w-12 h-12 text-white" fill="white" />
                              </div>
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                              {video.duration && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                                  {formatVideoDuration(video.duration)}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{video.description}</p>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(video.youtubeUrl, '_blank')}
                              className="gap-2"
                            >
                              <Play className="w-4 h-4" />
                              Watch on YouTube
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}