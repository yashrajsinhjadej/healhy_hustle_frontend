"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import { authUtils } from '@/lib/auth'

export default function WorkoutForm({ onSuccess, redirectTo }: { onSuccess?: () => void, redirectTo?: string }) {
  const [form, setForm] = useState({ name: '', level: 'beginner', duration: '', introduction: '', sequence: '' })
  const [categories, setCategories] = useState<string[]>([''])
  const [banner, setBanner] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const updateArrayField = (setter: any, index: number, value: string) => setter((prev: string[]) => { const c = [...prev]; c[index] = value; return c })
  const addArrayField = (setter: any) => setter((prev: string[]) => [...prev, ''])
  const removeArrayField = (setter: any, index: number) => setter((prev: string[]) => prev.filter((_, i) => i !== index))

  const handleSave = async () => {
    setErrorMsg(null)
    if (!form.name.trim()) { setErrorMsg('Name is required'); return }
    if (!form.duration || isNaN(Number(form.duration))) { setErrorMsg('Duration must be a number'); return }
    if (!form.level) { setErrorMsg('Level is required'); return }

    setIsSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('level', form.level)
      fd.append('duration', String(Number(form.duration)))
      fd.append('introduction', form.introduction)
    if (form.sequence) fd.append('sequence', String(Number(form.sequence)))
    categories.forEach(c => c && fd.append('category[]', c))
    if (banner) fd.append('banner', banner, banner.name)
    if (thumbnail) fd.append('thumbnail', thumbnail, thumbnail.name)

      const headers: Record<string,string> = { ...(authUtils.getAuthHeader() as Record<string,string>) }

      const res = await fetch('/api/workout/admin/create', { method: 'POST', headers, body: fd })
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : { message: await res.text() }
      if (!res.ok) { setErrorMsg(data?.message || 'Failed to create workout'); return }
      // If a redirectTo path is provided (serializable), navigate there.
      if (redirectTo) {
        window.location.href = redirectTo
        return
      }
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create workout')
    } finally { setIsSaving(false) }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Workout name" />
        </div>
        <div>
          <Label>Category (add multiple)</Label>
          {categories.map((c,i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input value={c} onChange={(e) => updateArrayField(setCategories, i, e.target.value)} />
              <Button variant="outline" onClick={() => removeArrayField(setCategories, i)}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addArrayField(setCategories)}>Add category</Button>
        </div>
        <div>
          <Label>Level</Label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.level}
            onChange={e => handleChange('level', e.target.value)}
          >
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </div>
        <div>
          <Label>Duration (minutes)</Label>
          <Input value={form.duration} onChange={(e) => handleChange('duration', e.target.value)} />
        </div>
        <div>
          <Label>Introduction</Label>
          <Input value={form.introduction} onChange={(e) => handleChange('introduction', e.target.value)} />
        </div>
        <div>
          <Label>Sequence</Label>
          <Input value={form.sequence} onChange={(e) => handleChange('sequence', e.target.value)} />
        </div>
        <div>
          <Label>Banner Image (field name: banner)</Label>
          <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] || null)} />
        </div>
        <div>
          <Label>Thumbnail Image (field name: thumbnail)</Label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
        </div>
        {/* Removed old image fields, now handled above as Banner and Thumbnail */}
        {errorMsg && <div className="text-red-600">{errorMsg}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : (<><Save className="w-4 h-4 mr-2"/>Save</>)}</Button>
        </div>
      </div>
    </div>
  )
}
