// src/components/edit-workout-videos.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { authenticatedFetch, authUtils } from "@/lib/auth";

type WorkoutVideo = {
  _id: string;
  title?: string;
  description?: string;
  youtubeUrl?: string;
  duration?: number;
  sequence?: number;
};

type WorkoutDTO = {
  _id: string;
  name: string;
  videos?: WorkoutVideo[];
};

function isValidUrl(str: string) {
  try { new URL(str); return true } catch { return false }
}

export default function EditWorkoutVideos() {
  const params = useParams();
  const search = useSearchParams();
  const workoutId = typeof params?.id === "string" ? params.id : "";
  const videoId = search.get("videoId") || "";

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [sequence, setSequence] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setInfo(null);

        if (!workoutId) { setError("Invalid workout id."); return }

        const res = await authenticatedFetch("/api/workout/get-by-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workoutId }),
        });

        if (res.status === 401) {
          authUtils.clearAuthData();
          setError("Unauthorized. Please login again.");
          return;
        }

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError((data as any)?.error || (data as any)?.message || "Failed to load workout");
          return;
        }

        const workout: WorkoutDTO = (data?.data as WorkoutDTO) ?? (data as WorkoutDTO);
        if (!workout || !workout._id) {
          setError("Workout not found.");
          return;
        }

        const list = Array.isArray(workout.videos) ? workout.videos : [];
        const target = videoId ? list.find(v => v._id === videoId) : list[0];
        if (!target) {
          setError("Target video not found.");
          return;
        }

        if (!mounted) return;
        setTitle(target.title ?? "");
        setDescription(target.description ?? "");
        setYoutubeUrl(target.youtubeUrl ?? "");
        setDuration(target.duration !== undefined ? String(target.duration) : "");
        setSequence(target.sequence !== undefined ? String(target.sequence) : "");
      } catch (e: any) {
        setError(e?.message || "Unable to load workout/video.");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [workoutId, videoId]);

  function validate(): string | null {
    if (!title.trim()) return "Title cannot be empty";
    if (youtubeUrl.trim() && !isValidUrl(youtubeUrl.trim())) return "YouTube URL must be a valid URL";
    if (duration.trim()) {
      const d = Number(duration);
      if (isNaN(d)) return "Duration must be a number";
      if (d <= 0) return "Duration must be greater than 0 seconds";
    }
    if (sequence.trim()) {
      const s = Number(sequence);
      if (isNaN(s)) return "Sequence must be a number";
      if (s <= 0) return "Sequence must be greater than 0";
    }
    return null;
  }

  async function handleSave() {
    setError(null);
    setInfo(null);

    if (!workoutId || !videoId) {
      setError("Missing workoutId or videoId.");
      return;
    }
    const vErr = validate();
    if (vErr) { setError(vErr); return }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        workoutId,
        videoId,
      };
      if (title.trim()) payload.title = title.trim();
      if (description.trim()) payload.description = description.trim();
      if (youtubeUrl.trim()) payload.youtubeUrl = youtubeUrl.trim();
      if (duration.trim()) payload.duration = Number(duration);
      if (sequence.trim()) payload.sequence = Number(sequence);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(authUtils.getAuthHeader() as Record<string, string>),
      };

      const res = await fetch("/api/workout/videos/update", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { message: await res.text() };

      if (!res.ok) {
        setError((data as any)?.error || (data as any)?.message || "Failed to update video");
        return;
      }

  setInfo("Video updated successfully.");
  // Redirect to the workout page after successful save
  window.location.href = `/Category/workouts/${encodeURIComponent(workoutId)}`;
    } catch (e: any) {
      setError(e?.message || "Failed to update video");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading video…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4 text-sm text-gray-600">
        Editing video for workout: <span className="font-mono">{workoutId || "-"}</span>
        {videoId && <> — videoId: <span className="font-mono">{videoId}</span></>}
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {info && <div className="mb-4 text-green-700">{info}</div>}

      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" />
        </div>

        <div>
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        </div>

        <div>
          <Label>YouTube URL</Label>
          <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." />
        </div>

        <div>
          <Label>Duration (seconds)</Label>
          <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 180" />
        </div>

        <div>
          <Label>Sequence</Label>
          <Input value={sequence} onChange={(e) => setSequence(e.target.value)} placeholder="e.g., 1" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
