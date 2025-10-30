// app/workout/[id]/page.tsx

"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarAdmin } from "@/components/sidebar-admin"
import { Navbar } from "@/components/navbar"
import { authenticatedFetch, authUtils, User as UserType } from "@/lib/auth"
import { WorkoutHeader, WorkoutVideos } from "@/components/workoutID"
import { WorkoutBanner } from "@/components/workoutID/WorkoutBanner"
import { WorkoutDescription } from "@/components/workoutID/WorkoutDescription"
import { WorkoutSummary } from "@/components/workoutID/WorkoutSummary"

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
    const totalDurationSeconds = workout.videos.reduce(
      (sum: number, v: { duration?: number }) => sum + (v.duration || 0),
      0
    )
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

  // Dynamic equal-height: measure left column (banner + description)
  const leftRef = useRef<HTMLDivElement | null>(null)
  const [leftHeight, setLeftHeight] = useState<number | null>(null)

  useEffect(() => {
    const measure = () => {
      if (leftRef.current) {
        const rect = leftRef.current.getBoundingClientRect()
        setLeftHeight(rect.height)
      }
    }
    // Initial measure
    measure()

    // Observe size changes of the left column (e.g., Read more toggles)
    const ro = new ResizeObserver(measure)
    if (leftRef.current) ro.observe(leftRef.current)

    // Also re-measure on window resize
    window.addEventListener("resize", measure)

    return () => {
      window.removeEventListener("resize", measure)
      ro.disconnect()
    }
  }, [workout?.introduction, totalDurationSeconds])

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>

  // Derived display values for summary
  const equipmentText = workout?.equipment?.length ? workout.equipment.join(", ") : "Dumbbells, Barbell, Bench"
  const sessionDate = workout?.date ? new Date(workout.date).toLocaleDateString() : "Mar 15, 2023"
  const levelText = workout?.level || "Beginner"
  const typeText = workout?.category?.join(", ") || workout?.type || "For beginners"

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />

      <div className="flex-1">
        <Navbar
          userProfile={userProfile ?? undefined}
          heading={`Good Morning, ${userProfile?.name || "User"}`}
          searchTerm=""
          onSearch={() => { } } placeholder={""}        />

        <div className="flex w-full">
          <div className="flex-1 p-6 pb-0">
            <WorkoutHeader
              name={workout.name}
              durationText={formatTotalDuration(totalDurationSeconds)}
              level={levelText}
              
              onBack={() => router.back()}
            />

            {/* Two-column layout; right summary uses measured height to align with description end */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
              {/* Left column controls height: Banner + Description stacked; spacing via gap */}
              <div ref={leftRef} className="flex flex-col gap-6">
                <WorkoutBanner bannerUrl={workout.bannerUrl} title="Journey to Explore" />
                <WorkoutDescription text={workout.introduction} />
              </div>

              {/* Right column: set minHeight to match left column; Summary fills it */}
              <div style={leftHeight ? { minHeight: leftHeight } : undefined} className="flex">
                <WorkoutSummary
                  totalWorkouts={totalWorkouts}
                  totalDuration={formatTotalDuration(totalDurationSeconds)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
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
