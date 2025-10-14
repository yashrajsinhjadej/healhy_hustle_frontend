// src/components/edit-workout-standalone.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { authenticatedFetch, authUtils } from "@/lib/auth";

type WorkoutDTO = {
  _id: string;
  name: string;
  category: string[];
  level: "beginner" | "intermediate" | "advanced" | string;
  duration: number;
  introduction?: string;
  sequence?: number;
  bannerUrl?: string;
  thumbnailUrl?: string;
};

export default function EditWorkoutStandalone() {
  const search = useSearchParams();
  const workoutId = search.get("id") || "";

  const [name, setName] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [duration, setDuration] = useState<string>("");
  const [introduction, setIntroduction] = useState("");
  const [sequence, setSequence] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([""]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!workoutId) {
          setError("Invalid workout id.");
          return;
        }

        // Use the correct proxy route path
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

        // Expect { success: true, data: workout }
        const w: WorkoutDTO = (data?.data as WorkoutDTO) ?? (data as WorkoutDTO);
        if (!w || !w._id) {
          setError("Workout not found.");
          return;
        }

        if (!mounted) return;

        // Prefill
        setName(w.name || "");
        const lvl = ["beginner", "intermediate", "advanced"].includes(w.level)
          ? (w.level as "beginner" | "intermediate" | "advanced")
          : "beginner";
        setLevel(lvl);
        setDuration(String(w.duration ?? ""));
        setIntroduction(w.introduction ?? "");
        setSequence(w.sequence !== undefined ? String(w.sequence) : "");
        setCategories(Array.isArray(w.category) && w.category.length ? w.category : [""]);
        setBannerPreview(w.bannerUrl ?? null);
        setThumbnailPreview(w.thumbnailUrl ?? null);
      } catch (e: any) {
        setError(e?.message || "Unable to load workout.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [workoutId]);

  const updateCategory = (index: number, value: string) => {
    setCategories(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const addCategory = () => setCategories(prev => [...prev, ""]);
  const removeCategory = (index: number) =>
    setCategories(prev => prev.filter((_, i) => i !== index));

  const validate = (): string | null => {
    if (!name.trim()) return "Name is required";
    if (!duration || isNaN(Number(duration))) return "Duration must be a number";
    if (!level) return "Level is required";
    if (!introduction.trim()) return "Introduction is required";
    if (categories.length === 0 || categories.every(c => !c.trim())) return "At least one category is required";
    return null;
  };

  const handleSave = async () => {
    setError(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    if (!workoutId) {
      setError("Invalid workout id.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("level", level);
      fd.append("duration", String(Number(duration)));
      fd.append("introduction", introduction);
      if (sequence) fd.append("sequence", String(Number(sequence)));
      categories.forEach(c => {
        if (c && c.trim()) fd.append("category[]", c.trim());
      });

      if (bannerFile) fd.append("banner", bannerFile, bannerFile.name);
      if (thumbnailFile) fd.append("thumbnail", thumbnailFile, thumbnailFile.name);

      const headers: Record<string, string> = {
        ...(authUtils.getAuthHeader() as Record<string, string>),
      };

      const res = await fetch(`/api/workout/admin/update?id=${encodeURIComponent(workoutId)}`, {
        method: "POST",
        headers,
        body: fd,
      });

      const ct = res.headers.get("content-type") || "";
      const resp = ct.includes("application/json") ? await res.json() : { message: await res.text() };

      if (!res.ok) {
        setError((resp as any)?.error || (resp as any)?.message || "Failed to update workout");
        return;
      }

      window.location.href = "/workouts";
    } catch (e: any) {
      setError(e?.message || "Failed to update workout");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading workout…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {workoutId && (
        <div className="mb-4 text-sm text-gray-600">
          Editing workout ID: <span className="font-mono">{workoutId}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workout name" />
        </div>

        <div>
          <Label>Category (add multiple)</Label>
          {categories.map((c, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input value={c} onChange={(e) => updateCategory(i, e.target.value)} />
              <Button variant="outline" onClick={() => removeCategory(i)}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addCategory}>Add category</Button>
        </div>

        <div>
          <Label>Level</Label>
          <select
            className="w-full border rounded px-3 py-2"
            value={level}
            onChange={e => setLevel(e.target.value as "beginner" | "intermediate" | "advanced")}
          >
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </div>

        <div>
          <Label>Duration (minutes)</Label>
          <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>

        <div>
          <Label>Introduction</Label>
          <Input value={introduction} onChange={(e) => setIntroduction(e.target.value)} />
        </div>

        <div>
          <Label>Sequence</Label>
          <Input value={sequence} onChange={(e) => setSequence(e.target.value)} />
        </div>

        <div>
          <Label>Banner Image</Label>
          {bannerPreview && !bannerFile && (
            <div className="mb-2">
              <img src={bannerPreview} alt="Current banner" className="h-24 rounded object-cover" />
              <p className="text-xs text-gray-500">Current banner shown. Upload a new file to replace.</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setBannerFile(f);
              if (f) setBannerPreview(URL.createObjectURL(f));
            }}
          />
        </div>

        <div>
          <Label>Thumbnail Image</Label>
          {thumbnailPreview && !thumbnailFile && (
            <div className="mb-2">
              <img src={thumbnailPreview} alt="Current thumbnail" className="h-24 rounded object-cover" />
              <p className="text-xs text-gray-500">Current thumbnail shown. Upload a new file to replace.</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setThumbnailFile(f);
              if (f) setThumbnailPreview(URL.createObjectURL(f));
            }}
          />
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
