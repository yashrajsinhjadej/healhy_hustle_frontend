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
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4 p-0 text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to workouts
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>

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
