// app/workouts/edit/page.tsx

import React from "react";
import EditWorkoutStandalone from "@/components/edit-workout-standalone";

export default function EditWorkoutRoutePage() {
  return (
    <div className="min-h-screen bg-[#f4f5f6] p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Edit workout session</h1>
        <EditWorkoutStandalone />
      </div>
    </div>
  );
}
