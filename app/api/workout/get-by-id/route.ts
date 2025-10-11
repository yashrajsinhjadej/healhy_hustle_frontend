import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/backend-config'

// This route reads request.headers (authorization) and must be dynamic.
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workoutId } = body

    // Validate required fields
    if (!workoutId) {
      return NextResponse.json(
        { error: 'Workout ID is required' },
        { status: 400 }
      )
    }

    console.log('🏋️ [Get Workout By ID] Fetching workout:', workoutId)

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')

    // Forward request to backend
    const backendResponse = await fetch(getBackendApiUrl('/api/workout/user/getworkoutbyid'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify({ workoutId }),
      cache: 'no-store', // prevents caching
    })

    console.log('🏋️ [Get Workout By ID] Backend response status:', backendResponse.status)

    if (backendResponse.ok) {
      const workoutData = await backendResponse.json()
      console.log('✅ [Get Workout By ID] Workout data received:', workoutData)
      
      return NextResponse.json({
        success: true,
        data: workoutData,
        message: 'Workout retrieved successfully'
      })
    } else {
      const errorData = await backendResponse.json()
      console.log('❌ [Get Workout By ID] Backend error:', errorData)
      
      return NextResponse.json(
        { 
          success: false,
          error: errorData.error || errorData.message || 'Failed to retrieve workout',
          message: 'Failed to retrieve workout'
        },
        { status: backendResponse.status }
      )
    }
  } catch (error) {
    console.error('❌ [Get Workout By ID] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve workout'
      },
      { status: 500 }
    )
  }
}
