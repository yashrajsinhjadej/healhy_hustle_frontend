// components/workout/WorkoutVideos.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, Pencil, Trash, Plus } from "lucide-react"

// 🎯 DND-KIT IMPORTS
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

// 🎯 SORTABLE ROW COMPONENT
function SortableVideoRow({
  video,
  onEdit,
  onDelete,
  onClick,
  formatDuration,
  workoutId,
}: {
  video: VideoData
  onEdit: (e: React.MouseEvent, id: string) => void
  onDelete: (e: React.MouseEvent, id: string) => void
  onClick: (url: string) => void
  formatDuration: (seconds: number) => string
  workoutId?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f3f4f6' : 'transparent',
  }

  const videoId = getYouTubeVideoId(video.youtubeUrl)

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {/* Thumbnail */}
      <td 
        className="py-3 px-4"
        onClick={(e) => {
          e.stopPropagation()
          onClick(video.youtubeUrl)
        }}
      >
        <div className="relative w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
          {videoId ? (
            <img
              src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <Play className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        </div>
      </td>

      {/* Sequence */}
      <td 
        className="py-3 px-4 font-medium text-gray-700"
        onClick={(e) => {
          e.stopPropagation()
          onClick(video.youtubeUrl)
        }}
      >
        {video.sequence}
      </td>

      {/* Title */}
      <td 
        className="py-3 px-4"
        onClick={(e) => {
          e.stopPropagation()
          onClick(video.youtubeUrl)
        }}
      >
        <div className="font-medium text-gray-900">{video.title}</div>
      </td>

      {/* Description */}
      <td 
        className="py-3 px-4 max-w-xs"
        onClick={(e) => {
          e.stopPropagation()
          onClick(video.youtubeUrl)
        }}
      >
        <div className="text-sm text-gray-600 truncate">{video.description}</div>
      </td>

      {/* Duration */}
      <td 
        className="py-3 px-4 text-gray-700"
        onClick={(e) => {
          e.stopPropagation()
          onClick(video.youtubeUrl)
        }}
      >
        {formatDuration(video.duration)}
      </td>

      {/* Actions */}
      <td 
        className="py-3 px-4 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="inline-flex items-center gap-1 text-gray-600 hover:text-black mr-3 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
          onClick={(e) => onEdit(e, video._id)}
        >
          <Pencil size={16} />
          <span className="text-sm">Edit</span>
        </button>
        <button
          className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
          onClick={(e) => onDelete(e, video._id)}
        >
          <Trash size={16} />
          <span className="text-sm">Delete</span>
        </button>
      </td>
    </tr>
  )
}

// 🎯 MAIN COMPONENT
export const WorkoutVideos = ({
  videos,
  onClickVideo,
  formatDuration,
  workoutId,
  onVideosUpdated,
}: WorkoutVideosProps) => {
  const router = useRouter()
  const [sortedVideos, setSortedVideos] = useState<VideoData[]>(
    [...videos].sort((a, b) => a.sequence - b.sequence)
  )
  const [isDragging, setIsDragging] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Update local state when videos prop changes
  useState(() => {
    setSortedVideos([...videos].sort((a, b) => a.sequence - b.sequence))
  })

  // 🎯 CONFIGURE SENSORS WITH DELAY (same as categories)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  // 🎯 DRAG START HANDLER
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    console.log('Drag started:', event.active.id)
  }

  // 🎯 DRAG END HANDLER
  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedVideos.findIndex((v) => v._id === active.id)
    const newIndex = sortedVideos.findIndex((v) => v._id === over.id)

    console.log(`Moving video from index ${oldIndex} to ${newIndex}`)

    // 1️⃣ OPTIMISTIC UPDATE
    const reorderedVideos = arrayMove(sortedVideos, oldIndex, newIndex)
    setSortedVideos(reorderedVideos)

    // 2️⃣ CALCULATE NEW SEQUENCE
    const newSequence = newIndex + 1
    const videoId = active.id as string

    console.log(`Updating video ${videoId} to sequence ${newSequence}`)

    // 3️⃣ CALL API
    setUpdating(true)
    try {
      let token: string | null = null
      try {
        const { authUtils } = await import("@/lib/auth")
        token = authUtils.getToken?.() ?? null
      } catch {
        token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      }

      const response = await fetch("/api/workout/videos/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          videoId,
          workoutId,
          sequence: newSequence,
        }),
      })

      const isJson = (response.headers.get("content-type") || "").includes("application/json")
      const result = isJson ? await response.json() : null

      if (response.ok) {
        console.log('✅ Video sequence updated successfully')
        
        // 4️⃣ REFETCH WORKOUT TO SYNC
        await refetchWorkout()
      } else {
        console.error('❌ Failed to update video sequence')
        
        // 5️⃣ REVERT ON ERROR
        setSortedVideos(sortedVideos)
        alert('Failed to update video order. Please try again.')
      }
    } catch (err) {
      console.error('❌ Error updating video:', err)
      
      // REVERT ON ERROR
      setSortedVideos(sortedVideos)
      alert('An error occurred while updating video order.')
    } finally {
      setUpdating(false)
    }
  }

  // Refetch workout to get updated video list
  const refetchWorkout = async () => {
    if (!workoutId) return

    try {
      let token: string | null = null
      try {
        const { authUtils } = await import("@/lib/auth")
        token = authUtils.getToken?.() ?? null
      } catch {
        token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      }

      const res = await fetch("/api/workout/get-by-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ workoutId }),
      })

      if (res.ok) {
        const data = await res.json()
        const workout = data?.data || data
        const updatedVideos = workout?.videos || []
        
        if (onVideosUpdated) {
          onVideosUpdated(updatedVideos)
        }
        
        setSortedVideos([...updatedVideos].sort((a, b) => a.sequence - b.sequence))
      }
    } catch (err) {
      console.error('Error refetching workout:', err)
    }
  }

  const handleDelete = async (video: VideoData, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!workoutId) {
      alert("Missing workoutId to delete video.")
      return
    }

    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) {
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
        setSortedVideos([...updatedVideos].sort((a, b) => a.sequence - b.sequence))
      } else {
        // Remove from local state
        setSortedVideos(prev => prev.filter(v => v._id !== video._id))
      }
    } catch (err: any) {
      console.error("Delete video error:", err)
      alert(err?.message || "Unable to delete video. Please try again.")
    }
  }

  const handleEdit = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation()
    if (!workoutId) {
      alert("Missing workoutId to edit video.")
      return
    }
    router.push(`/Category/workouts/${workoutId}/video/edit?videoId=${encodeURIComponent(videoId)}`)
  }

  return (
    <div className="px-6 pb-6 pt-0">
      <div className="flex items-center justify-between mb-4 mt-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Exercise Videos</h2>
          <p className="text-xs text-gray-500 mt-1">
            💡 Press and hold any row for 250ms to reorder videos
          </p>
        </div>
        <Button
          variant="default"
          className="bg-black text-white hover:bg-gray-900"
          onClick={() => {
            if (!workoutId) {
              alert("Missing workoutId to create video.")
              return
            }
            router.push(`/Category/workouts/${workoutId}/video/create`)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Show updating indicator */}
      {updating && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          🔄 Updating video order...
        </div>
      )}

      {sortedVideos.length === 0 ? (
        <div className="py-10 text-center text-gray-500 bg-white rounded-lg border">
          No videos found. Click "Add Video" to create one.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            {/* 🎯 DND CONTEXT WRAPS THE TABLE */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              autoScroll={{
                enabled: true,
                threshold: {
                  x: 0,
                  y: 0.1,
                },
                acceleration: 3,
              }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                    <th className="py-3 px-4">Thumbnail</th>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                {/* 🎯 SORTABLE CONTEXT WRAPS TBODY */}
                <SortableContext
                  items={sortedVideos.map((v) => v._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody>
                    {sortedVideos.map((video) => (
                      <SortableVideoRow
                        key={video._id}
                        video={video}
                        onEdit={handleEdit}
                        onDelete={(e) => handleDelete(video, e)}
                        onClick={onClickVideo}
                        formatDuration={formatDuration}
                        workoutId={workoutId}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
            Showing {sortedVideos.length} video{sortedVideos.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}