"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Save, X } from "lucide-react"
import { authUtils } from "@/lib/auth"

export default function CreateWorkoutVideoPage() {
  const { id: workoutId } = useParams<{ id: string }>()
  const router = useRouter()

  const [form, setForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    duration: "",
    sequence: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!form.title.trim()) return "Title is required"
    if (!form.description.trim()) return "Description is required"
    if (!form.youtubeUrl.trim()) return "YouTube URL is required"
    if (!form.duration || isNaN(Number(form.duration))) return "Duration must be a number (seconds)"
    if (!form.sequence || isNaN(Number(form.sequence))) return "Sequence must be a number"
    return null
  }

  const handleSave = async () => {
    const err = validate()
    if (err) {
      setErrorMsg(err)
      return
    }
    setErrorMsg(null)
    setIsSaving(true)
    try {
      const headers: Record<string, string> = {
        ...(authUtils.getAuthHeader() as Record<string, string>),
        "Content-Type": "application/json",
      }

      const res = await fetch("/api/workout/videos/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          workoutId,
          title: form.title.trim(),
          description: form.description.trim(),
          youtubeUrl: form.youtubeUrl.trim(),
          duration: Number(form.duration),
          sequence: Number(form.sequence),
        }),
      })

      const contentType = res.headers.get("content-type") || ""
      const isJson = contentType.includes("application/json")
      const payload = isJson ? await res.json() : null

      if (!res.ok) {
        const msg = (payload?.error || payload?.message || "Failed to create workout video") as string
        setErrorMsg(msg)
        return
      }

      // Backend returns full updated workout at payload.data; we only care about videos later
      // Redirect back to workout details; the page can update videos from payload if you pass it via state or refetch
      router.push(`/workouts/${workoutId}`)
    } catch (err: any) {
      console.error("Failed to create workout video", err)
      setErrorMsg(err?.message || "Failed to create workout video")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create Workout Video</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <X className="w-4 h-4 mr-2" /> Close
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Video title"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Short description"
            />
          </div>

          <div>
            <Label>YouTube URL</Label>
            <Input
              value={form.youtubeUrl}
              onChange={(e) => handleChange("youtubeUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration (seconds)</Label>
              <Input
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="e.g. 180"
              />
            </div>
            <div>
              <Label>Sequence</Label>
              <Input
                value={form.sequence}
                onChange={(e) => handleChange("sequence", e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
          </div>

          {errorMsg && <div className="text-red-600">{errorMsg}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
