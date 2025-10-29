import WorkoutForm from '@/components/workout/workout-form'

export default function CreateWorkoutPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f6] p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Create workout session</h1>
        <WorkoutForm redirectTo="/Category" />
      </div>
    </div>
  )
}
