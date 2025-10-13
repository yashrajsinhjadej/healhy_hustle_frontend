"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarAdmin } from "@/components/sidebar-admin"
import { Navbar } from "@/components/navbar"
import { authenticatedFetch, authUtils, User as UserType } from "@/lib/auth"
import { WorkoutHeader, WorkoutBanner, WorkoutDescription, WorkoutSummary, WorkoutVideos } from "@/components/workout"

export default function WorkoutDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string

  const [workout, setWorkout] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const { totalWorkouts, totalDurationSeconds } = useMemo(() => {
    if (!workout?.videos) return { totalWorkouts: 0, totalDurationSeconds: 0 }
    const totalWorkouts = workout.videos.length
    const totalDurationSeconds = workout.videos.reduce((sum: any, v: { duration: any }) => sum + (v.duration || 0), 0)
    return { totalWorkouts, totalDurationSeconds }
  }, [workout?.videos])

  const formatTotalDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 1) return `${seconds}s`
    const hours = Math.floor(minutes / 60)
    const rem = minutes % 60
    return hours ? `${hours}h ${rem}m` : `${minutes}m`
  }

  useEffect(() => {
    const fetchWorkout = async () => {
    
      try {
        setIsLoading(true)
        const res = await authenticatedFetch("/api/workout/get-by-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workoutId }),
        })
        const data = await res.json()
        if (res.ok) setWorkout(data.data)
        else setError("Failed to fetch workout")
      } catch (e) {
        setError("Error loading workout")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkout()
  }, [workoutId])


  useEffect(() => {
    const stored = authUtils.getUser()
    if (stored) setUserProfile(stored)
  }, [])

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />

      <div className="flex-1">
        <Navbar
          userProfile={userProfile ?? undefined}
          heading={`Good Morning, ${userProfile?.name || "User"}`}
          searchTerm=""
          onSearch={() => {}}
        />

        <div className="flex w-full">
          <div className="flex-1 p-6 pb-0">
            <WorkoutHeader
              name={workout.name}
              durationText={formatTotalDuration(totalDurationSeconds)}
              level={workout.level}
              category={workout.category?.join(", ") || "N/A"}
              onBack={() => router.back()}
            />
            <WorkoutBanner bannerUrl={workout.bannerUrl} title="Journey to Explore" />
            <WorkoutDescription text={workout.introduction} />
          </div>

          <WorkoutSummary totalWorkouts={totalWorkouts} totalDuration={formatTotalDuration(totalDurationSeconds)} />
        </div>

       {workout.videos?.length >= 0 && (
  <WorkoutVideos
    videos={workout.videos}
    onClickVideo={(url) => window.open(url, "_blank")}
    formatDuration={formatTotalDuration}
    workoutId={workoutId}
    onVideosUpdated={(updatedVideos) =>
      setWorkout((prev: any) => (prev ? { ...prev, videos: updatedVideos } : prev))
    }
  />
)}
      </div>
    </div>
  )
}
