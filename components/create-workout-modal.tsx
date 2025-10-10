

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Save, X } from "lucide-react";
import { authUtils } from "@/lib/auth";

export default function CreateWorkoutModal() {
  // Helper functions for dynamic array fields
  const updateArrayField = (
    setter: (v: any) => void,
    index: number,
    value: string
  ) => {
    setter((prev: string[]) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };
  const addArrayField = (setter: (v: any) => void) => {
    setter((prev: string[]) => [...prev, ""]);
  };
  const removeArrayField = (setter: (v: any) => void, index: number) => {
    setter((prev: string[]) => prev.filter((_, i) => i !== index));
  };

  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    level: "Beginner",
    duration: "",
    introduction: "",
    sequence: "",
  });
  const [categories, setCategories] = useState<string[]>([""]);
  const [banner, setBanner] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setErrorMsg(null);
    if (!form.name.trim()) {
      setErrorMsg("Name is required");
      return;
    }
    if (!form.duration || isNaN(Number(form.duration))) {
      setErrorMsg("Duration must be a number");
      return;
    }
    if (!form.level) {
      setErrorMsg("Level is required");
      return;
    }
    if (categories.length === 0 || categories.every((c) => !c.trim())) {
      setErrorMsg("At least one category is required");
      return;
    }
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("level", form.level);
      fd.append("duration", String(Number(form.duration)));
      fd.append("introduction", form.introduction);
      if (form.sequence) fd.append("sequence", String(Number(form.sequence)));
      categories.forEach((c) => c && fd.append("category[]", c));
      if (banner) fd.append("banner", banner, banner.name);
      if (thumbnail) fd.append("thumbnail", thumbnail, thumbnail.name);
      const headers: Record<string, string> = {
        ...(authUtils.getAuthHeader() as Record<string, string>),
      };
      const res = await fetch("/api/workout/admin/create", {
        method: "POST",
        headers,
        body: fd,
      });
      const contentType = res.headers.get("content-type") || "";
      let data: any;
      if (contentType.includes("application/json")) data = await res.json();
      else data = { message: await res.text() };
      if (!res.ok) {
        const msg = data?.message || data?.error || "Failed to create workout";
        setErrorMsg(msg);
        return;
      }
      setOpen(false);
    } catch (err: any) {
      console.error("Failed to create workout", err);
      setErrorMsg(err?.message || "Failed to create workout");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-4 bg-[#000000] text-white hover:bg-[#212121]">
          Create workout session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create workout session</span>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Workout name"
                />
              </div>
              <div>
                <Label>Category (add multiple)</Label>
                {categories.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      value={c}
                      onChange={(e) => updateArrayField(setCategories, i, e.target.value)}
                      placeholder={`category[${i}]`}
                    />
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => removeArrayField(setCategories, i)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => addArrayField(setCategories)}
                >
                  Add category
                </Button>
              </div>
              <div>
                <Label>Level</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  placeholder="Duration"
                />
              </div>
              <div>
                <Label>Introduction</Label>
                <Input
                  value={form.introduction}
                  onChange={(e) => handleChange("introduction", e.target.value)}
                  placeholder="Short intro"
                />
              </div>
              <div>
                <Label>Sequence</Label>
                <Input
                  value={form.sequence}
                  onChange={(e) => handleChange("sequence", e.target.value)}
                  placeholder="Sequence (number)"
                />
              </div>
              <div>
                <Label>Banner Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBanner(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label>Thumbnail Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                />
              </div>
              {errorMsg && <div className="text-red-600">{errorMsg}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isSaving}
                >
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
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
