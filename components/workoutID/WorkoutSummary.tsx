// components/workout/WorkoutSummary.tsx

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ListOrdered, Timer } from "lucide-react"

interface WorkoutSummaryProps {
  totalWorkouts: number
  totalDuration: string
  className?: string
}

export const WorkoutSummary = ({ totalWorkouts, totalDuration, className = "" }: WorkoutSummaryProps) => (
  // Flex column card so it can fill the right column height via className="flex-1"
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col p-6 ${className}`}>
    <h2 className="text-xl font-bold text-gray-900 mb-6">Workout Summary</h2>

    <div className="space-y-4">
      <Card className="shadow-none border border-gray-200 bg-white">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
            <ListOrdered className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Workouts</p>
            <p className="text-xl font-bold text-gray-900">
              {totalWorkouts} {totalWorkouts === 1 ? "exercise" : "exercises"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border border-gray-200 bg-white">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
            <Timer className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Duration</p>
            <p className="text-xl font-bold text-gray-900">{totalDuration}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Spacer keeps the card able to fill height when parent sets minHeight */}
    <div className="mt-auto" />
  </div>
)
