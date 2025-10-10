import { useCallback, useEffect, useState } from "react";

// Define the Workout interface (This should match the structure returned by your backend API)
interface Workout {
  id: string;
  name: string;
  durationMinutes: number;
  date: string; // ISO date string
}

/**
 * useWorkouts Custom Hook: Frontend Service Layer
 * Responsible for fetching the list of workouts from the backend API.
 * It manages the state (data, loading, error) and provides a refetch function.
 * * @returns {object} { workouts, isLoading, error, refetch }
 */
export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // The core function to fetch data from the API
  const fetchWorkouts = useCallback(async () => {
    // 1. Reset state for a new fetch attempt
    setIsLoading(true);
    setError(null);
    
    // We use exponential backoff to retry the API call if it fails (good practice!)
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // API Call to your backend route (GET /api/workouts)
        const response = await fetch('/api/workouts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // If the response is not OK (e.g., 404, 500), throw an error
          const errorData = await response.json().catch(() => ({ message: 'Server error' }));
          throw new Error(errorData.message || `Failed to fetch data (Status: ${response.status})`);
        }

        // Successfully received and parsed data
        const data: Workout[] = await response.json();
        setWorkouts(data);
        return; // Success, exit the function
      } catch (e) {
        lastError = e as Error;
        console.error(`Attempt ${attempt + 1} failed:`, lastError.message);
        
        if (attempt < maxRetries - 1) {
          // Wait before retrying (exponential backoff: 1s, 2s)
          await new Promise(resolve => setTimeout(resolve, 1000 * (2 ** attempt)));
        }
      }
    }
    
    // If all attempts fail, set the final error state
    setError(lastError);
    setWorkouts([]); // Set to empty array to indicate failure to load
    
  }, []); // Empty dependency array means this function is created once

  // useEffect Hook: Calls the fetching function when the component mounts
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Finally, set loading to false when fetching is complete (either success or failure)
  useEffect(() => {
    if (workouts !== null || error !== null) {
        setIsLoading(false);
    }
  }, [workouts, error]);

  // Return the necessary data and controls to the consuming component (WorkoutsPage)
  return { 
    workouts, 
    isLoading, 
    error, 
    refetch: fetchWorkouts // Allows the page to manually trigger a reload
  };
}
