"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Save, X } from 'lucide-react'

export default function CreateWorkoutModal() {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({ name: '', level: '', duration: '' })

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Placeholder: currently we just log the form data.
      // Later we will POST to the real API endpoint when fields are finalized.
      console.log('CreateWorkout: saving', form)
      // Simulate network delay
      await new Promise(res => setTimeout(res, 600))
      setOpen(false)
    } catch (err) {
      console.error('Failed to create workout', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-4 bg-[#000000] text-white hover:bg-[#212121]">Create workoutsession</Button>
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
                <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Workout name" />
              </div>

              <div>
                <Label>Level</Label>
                <Input value={form.level} onChange={(e) => handleChange('level', e.target.value)} placeholder="e.g. beginner" />
              </div>

              <div>
                <Label>Duration (minutes)</Label>
                <Input value={form.duration} onChange={(e) => handleChange('duration', e.target.value)} placeholder="Duration" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : (
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
  )
}
