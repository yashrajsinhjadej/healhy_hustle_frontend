import { SidebarAdmin } from '@/components/sidebar-admin'
import WorkoutForm from '@/components/workout-form'

export default function CreateWorkoutPage() {
  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-semibold mb-4">About us</h1>
          <WorkoutForm redirectTo="/dashboard" />
        </div>
      </div>
    </div>
  )
}
