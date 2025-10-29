// app/(admin)/workout/edit/EditWorkoutStandalone.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, X, Upload, CheckCircle2, AlertCircle, Image } from "lucide-react";
import { authenticatedFetch, authUtils } from "@/lib/auth";

type CategoryOption = {
  _id: string;
  name: string;
};

type WorkoutDTO = {
  _id: string;
  name: string;
  category: { _id: string; name: string }[];
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  duration: number;
  introduction?: string;
  caloriesBurned?: number;
  bannerUrl?: string;
  thumbnailUrl?: string;
};

type GetWorkoutResponse = {
  workout: WorkoutDTO;
  allCategories: CategoryOption[];
};

export default function EditWorkoutStandalone() {
  const search = useSearchParams();
  const workoutId = search.get("id") || "";

  const [name, setName] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [duration, setDuration] = useState<string>("");
  const [introduction, setintroduction] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState<string>("");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);
  const [caloriesError, setCaloriesError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

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

        const responseData = await res.json().catch(() => null);
        if (!res.ok) {
          setError(
            (responseData as any)?.error ||
              (responseData as any)?.message ||
              "Failed to load workout"
          );
          return;
        }

        const data: GetWorkoutResponse = responseData?.data || responseData;
        const workout: WorkoutDTO = data.workout || data;

        if (!workout || !workout._id) {
          setError("Workout not found.");
          return;
        }

        if (!mounted) return;

        setName(workout.name || "");

        // Normalize level safely
        const rawLevel = workout.level ?? "Beginner";
        const normalizedLevel =
          typeof rawLevel === "string"
            ? rawLevel.charAt(0).toUpperCase() + rawLevel.slice(1).toLowerCase()
            : "Beginner";
        if (["Beginner", "Intermediate", "Advanced"].includes(normalizedLevel)) {
          setLevel(normalizedLevel as "Beginner" | "Intermediate" | "Advanced");
        } else {
          setLevel("Beginner");
        }

        setDuration(String(workout.duration ?? ""));
        setintroduction(workout.introduction ?? "");
        setCaloriesBurned(String(workout.caloriesBurned ?? ""));

        const categoryIds = Array.isArray(workout.category)
          ? workout.category.map((c: any) => c._id).filter(Boolean)
          : [];
        setSelectedCategoryIds(categoryIds);

        setAllCategories(data.allCategories || []);

        setBannerPreview(workout.bannerUrl ?? null);
        setThumbnailPreview(workout.thumbnailUrl ?? null);
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || "Unable to load workout.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [workoutId]);

  useEffect(() => {
    setNameError(!name.trim() ? "Name is required" : null);
  }, [name]);

  useEffect(() => {
    const n = Number(duration);
    if (!duration.trim()) {
      setDurationError("Duration is required");
    } else if (isNaN(n)) {
      setDurationError("Duration must be a number");
    } else if (n <= 0) {
      setDurationError("Duration must be greater than 0");
    } else {
      setDurationError(null);
    }
  }, [duration]);

  useEffect(() => {
    if (caloriesBurned.trim()) {
      const n = Number(caloriesBurned);
      if (isNaN(n) || n < 0) {
        setCaloriesError("Calories must be a non-negative number");
      } else {
        setCaloriesError(null);
      }
    } else {
      setCaloriesError(null);
    }
  }, [caloriesBurned]);

  useEffect(() => {
    if (selectedCategoryIds.length === 0) {
      setCategoriesError("At least one category is required");
    } else {
      setCategoriesError(null);
    }
  }, [selectedCategoryIds]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const validateForm = (): string | null => {
    if (nameError) return nameError;
    if (durationError) return durationError;
    if (caloriesError) return caloriesError;
    if (categoriesError) return categoriesError;
    if (!level) return "Level is required";
    return null;
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    const blockingError = validateForm();
    if (blockingError) {
      setError(blockingError);
      return;
    }

    if (!workoutId) {
      setError("Invalid workout id.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();

      // Send level and introduction as requested
      fd.append("name", name.trim());
      fd.append("level", level);
      fd.append("duration", String(Number(duration)));

      if (introduction.trim()) {
        fd.append("introduction", introduction.trim());
      }

      if (caloriesBurned.trim()) {
        fd.append("caloriesBurned", String(Number(caloriesBurned)));
      }

      // Category IDs for update
      fd.append("categoryIds", JSON.stringify(selectedCategoryIds));

      // Images (optional)
      if (bannerFile) {
        fd.append("banner", bannerFile, bannerFile.name);
      }
      if (thumbnailFile) {
        fd.append("thumbnail", thumbnailFile, thumbnailFile.name);
      }

      const headers: Record<string, string> = {
        ...(authUtils.getAuthHeader() as Record<string, string>),
      };

      const res = await fetch(
        `/api/workout/admin/update/${encodeURIComponent(workoutId)}`,
        {
          method: "POST", // Route handler can convert to PUT
          headers,
          body: fd,
        }
      );

      const ct = res.headers.get("content-type") || "";
      const resp = ct.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok) {
        setError(
          (resp as any)?.error || (resp as any)?.message || "Failed to update workout"
        );
        return;
      }

      setSuccessMessage("Workout updated successfully!");
      setTimeout(() => {
        window.location.href = "/Category";
      }, 1500);
    } catch (e: any) {
      setError(e?.message || "Failed to update workout");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading workout…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Workout
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-4">
            ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{workoutId}</span>
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Workout Name *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Full Body HIIT Workout"
                    className={`h-11 ${nameError ? "border-red-300" : ""}`}
                  />
                  {nameError && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {nameError}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="level" className="text-sm font-medium text-gray-700 mb-2 block">
                    Difficulty Level *
                  </Label>
                  <select
                    id="level"
                    className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={level}
                    onChange={(e) =>
                      setLevel(e.target.value as "Beginner" | "Intermediate" | "Advanced")
                    }
                  >
                    <option value="Beginner">🟢 Beginner</option>
                    <option value="Intermediate">🟡 Intermediate</option>
                    <option value="Advanced">🔴 Advanced</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700 mb-2 block">
                    Duration (minutes) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                    min="1"
                    className={`h-11 ${durationError ? "border-red-300" : ""}`}
                  />
                  {durationError && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {durationError}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="calories" className="text-sm font-medium text-gray-700 mb-2 block">
                    Calories Burned (estimate)
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value)}
                    placeholder="150"
                    min="0"
                    className={`h-11 ${caloriesError ? "border-red-300" : ""}`}
                  />
                  {caloriesError && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {caloriesError}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="introduction" className="text-sm font-medium text-gray-700 mb-2 block">
                    introduction
                  </Label>
                  <textarea
                    id="introduction"
                    value={introduction}
                    onChange={(e) => setintroduction(e.target.value)}
                    placeholder="short intro"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Categories */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                Categories *
              </h2>

              <div className="pl-10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allCategories.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-full">No categories available</p>
                  ) : (
                    allCategories.map((cat) => {
                      const isSelected = selectedCategoryIds.includes(cat._id);
                      return (
                        <label
                          key={cat._id}
                          className={`
                            relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCategory(cat._id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                            {cat.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto" />
                          )}
                        </label>
                      );
                    })
                  )}
                </div>

                {selectedCategoryIds.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-gray-600 mb-2">Selected ({selectedCategoryIds.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategoryIds.map((id) => {
                        const cat = allCategories.find((c) => c._id === id);
                        return cat ? (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-medium shadow-sm"
                          >
                            {cat.name}
                            <button
                              type="button"
                              onClick={() => toggleCategory(id)}
                              className="hover:bg-white/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {categoriesError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {categoriesError}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                Images
              </h2>

              <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Banner Image</Label>
                  <div className="space-y-3">
                    {(bannerPreview || bannerFile) && (
                      <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={bannerFile ? URL.createObjectURL(bannerFile) : bannerPreview!}
                          alt="Banner"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-medium">
                            {bannerFile ? "New upload" : "Current banner"}
                          </p>
                        </div>
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-600 font-medium">Click to upload banner</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Thumbnail Image</Label>
                  <div className="space-y-3">
                    {(thumbnailPreview || thumbnailFile) && (
                      <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnailPreview!}
                          alt="Thumbnail"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-medium">
                            {thumbnailFile ? "New upload" : "Current thumbnail"}
                          </p>
                        </div>
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-600 font-medium">Click to upload thumbnail</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              disabled={saving}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !!nameError || !!durationError || !!caloriesError || !!categoriesError}
              className="h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Workout
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Fields marked with * are required
        </p>
      </div>
    </div>
  );
}
