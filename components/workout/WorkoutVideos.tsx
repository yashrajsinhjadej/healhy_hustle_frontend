// components/workout/WorkoutVideos.tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, Pencil, Trash, Plus } from "lucide-react"

interface VideoData {
  _id: string
  title: string
  description: string
  youtubeUrl: string
  duration: number
  sequence: number
}

interface WorkoutVideosProps {
  videos: VideoData[]
  onClickVideo: (url: string) => void
  formatDuration: (seconds: number) => string
  workoutId?: string
  onVideosUpdated?: (videos: VideoData[]) => void
}

const getYouTubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url)
    if (u.searchParams.has("v")) return u.searchParams.get("v")
    if (u.hostname === "youtu.be") return u.pathname.slice(1)
    return null
  } catch {
    return null
  }
}

export const WorkoutVideos = ({
  videos,
  onClickVideo,
  formatDuration,
  workoutId,
  onVideosUpdated,
}: WorkoutVideosProps) => {
  const router = useRouter()

  const handleDelete = async (video: VideoData, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!workoutId) {
      alert("Missing workoutId to delete video.")
      return
    }

    try {
      let token: string | null = null
      try {
        const { authUtils } = await import("@/lib/auth")
        token = authUtils.getToken?.() ?? null
      } catch {
        token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      }

      const res = await fetch("/api/workout/videos/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ videoId: video._id, workoutId }),
      })

      const isJson = (res.headers.get("content-type") || "").includes("application/json")
      const payload = isJson ? await res.json() : null

      if (!res.ok) {
        const msg = isJson ? payload?.error || payload?.message || "Failed to delete video" : "Failed to delete video"
        throw new Error(msg)
      }

      const updatedVideos: VideoData[] | undefined = payload?.data?.videos
      if (updatedVideos && onVideosUpdated) {
        onVideosUpdated(updatedVideos)
      } else {
        alert("Deleted, but no updated videos returned.")
      }
    } catch (err: any) {
      console.error("Delete video error:", err)
      alert(err?.message || "Unable to delete video. Please try again.")
    }
  }

  return (
    <div className="px-6 pb-6 pt-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Exercise Videos</h2>
        <Button
          variant="default"
          className="bg-black text-white hover:bg-gray-900"
          onClick={() => {
            if (!workoutId) {
              alert("Missing workoutId to create video.")
              return
            }
            router.push(`/workouts/${workoutId}/video/create`)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Video
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => {
          const id = getYouTubeVideoId(v.youtubeUrl)
          return (
            <div
              key={v._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onClickVideo(v.youtubeUrl)}
            >
              <div className="relative w-full h-40 bg-gray-200 overflow-hidden group">
                {id ? (
                  <img
                    src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Play className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                {v.duration > 0 && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs font-semibold rounded">
                    {formatDuration(v.duration)}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" fill="white" />
                </div>
              </div>

              <div className="flex-1 flex flex-col p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                  {v.sequence}. {v.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-3">{v.description}</p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Edit button is already handled elsewhere in your project
                    }}
                    className="w-full gap-1 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => handleDelete(v, e)}
                    className="w-full gap-1"
                  >
                    <Trash className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
