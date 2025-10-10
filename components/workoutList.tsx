import React from 'react';

// Define the Workout interface (essential for type checking the data)
interface Workout {
  id: string;
  name: string;
  durationMinutes: number;
  date: string;
  // Note: For a real app, you would define this interface in a shared location, 
  // like 'lib/types/workout.ts', and import it here and in the hook.
}

// Define the Props expected by this component
interface WorkoutListProps {
  workouts: Workout[];
}

/**
 * WorkoutList component: Renders a list of individual workout items.
 * This is the 'View' component, focused only on displaying the UI based on the 'workouts' data.
 */
export default function WorkoutList({ workouts }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-base font-semibold text-gray-900">No workouts recorded yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Click "Create New Workout" to start tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <ul role="list" className="divide-y divide-gray-200">
      {workouts.map((workout) => (
        <li key={workout.id} className="py-4 flex items-center justify-between hover:bg-indigo-50/50 px-3 rounded-lg transition duration-150 cursor-pointer">
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-indigo-800">{workout.name}</p>
            <p className="text-sm text-gray-500">
              Date: {new Date(workout.date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right flex items-center">
            <span className="text-base font-medium text-gray-900 mr-4">
              {workout.durationMinutes} min
            </span>
            {/* Action button for future detail view */}
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
              Details &rarr;
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}