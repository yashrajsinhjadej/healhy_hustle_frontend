// components/workout/WorkoutDescription.tsx

"use client"

import { useMemo, useState } from "react"

interface WorkoutDescriptionProps {
  text: string
  clampLines?: number
}

export const WorkoutDescription = ({ text, clampLines = 4 }: WorkoutDescriptionProps) => {
  const [expanded, setExpanded] = useState(false)
  const normalizedText = useMemo(
    () => (text || "No introduction provided for this workout session.").trim(),
    [text]
  )
  const shouldShowToggle = useMemo(() => normalizedText.length > 160, [normalizedText])

  return (
    <div className="mb-0">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div
          className={expanded ? "text-gray-900 leading-relaxed" : "text-gray-900 leading-relaxed overflow-hidden"}
          style={
            expanded
              ? undefined
              : { display: "-webkit-box", WebkitLineClamp: clampLines, WebkitBoxOrient: "vertical" }
          }
        >
          {normalizedText}
        </div>

        {shouldShowToggle && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-sm font-medium text-gray-900 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
