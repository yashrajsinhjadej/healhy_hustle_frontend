"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Clock, Dumbbell, Target } from "lucide-react"

interface WorkoutHeaderProps {
  name: string
  durationText: string
  level: string
  category: string
  onBack?: () => void
  backPath?: string // e.g. "/cms/dashboard" or "/workouts"
}

export const WorkoutHeader = ({
  name,
  durationText,
  level,
  category,
  onBack,
  backPath = "/workouts", // default if not provided
}: WorkoutHeaderProps) => {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) return onBack()
    router.push(backPath)
  }

  return (
    <div className="mb-6">
  <div className="font-extrabold text-2xl text-gray-800 mb-1">Training Session Management</div>
  <h1 className="text-xl font-semibold text-gray-900 mb-2 mt-6">{name}</h1>
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{durationText}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-500" />
          <span className="capitalize">{level}</span>
        </div>
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-gray-500" />
          <span>{category}</span>
        </div>
      </div>
    </div>
  )
}
