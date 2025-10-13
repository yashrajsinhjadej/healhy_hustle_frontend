// Note: Assuming Card, CardContent, ListOrdered, and Timer are available either
// via internal imports or are defined locally in the main file (as in the last runnable example).

import { Card, CardContent } from "@/components/ui/card"
import { ListOrdered, Timer } from "lucide-react"

interface WorkoutSummaryProps {
  totalWorkouts: number
  totalDuration: string
}

export const WorkoutSummary = ({ totalWorkouts, totalDuration }: WorkoutSummaryProps) => (
  // The 'h-full' class ensures this component stretches to the height of its sibling column 
  // (which contains the Banner and Description) within the parent flex container.
  <div className="w-80 p-6 bg-white border-l border-gray-200 h-full rounded-xl shadow-sm flex-shrink-0">
    <h2 className="text-xl font-bold text-gray-900 mb-6">Workout Summary</h2>
    <div className="space-y-4 mb-8">
      <Card className="shadow-none border border-gray-200">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
            <ListOrdered className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Workouts</p>
            <p className="text-xl font-bold text-gray-900">{totalWorkouts} exercises</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border border-gray-200">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
            <Timer className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Duration</p>
            <p className="text-xl font-bold text-gray-900">{totalDuration}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);