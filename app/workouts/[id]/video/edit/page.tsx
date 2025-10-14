// app/workouts/[id]/video/edit/page.tsx

import React from "react";
import EditWorkoutVideos from "@/components/edit-workout-videos";

export default function EditWorkoutVideosRoute() {
  return (
    <div className="min-h-screen bg-[#f4f5f6] p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Edit workout video</h1>
        <EditWorkoutVideos />
      </div>
    </div>
  );
}
