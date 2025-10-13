"use client"

interface WorkoutDescriptionProps {
  text: string
}

export const WorkoutDescription = ({ text }: WorkoutDescriptionProps) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <p className="text-gray-700 leading-relaxed">
        {text || "No introduction provided for this workout session."}
      </p>
    </div>
  </div>
)
