// app/api/workout/get-by-id/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS, getBackendApiUrl } from '@/lib/backend-config'

// This route reads request.headers (authorization) and must be dynamic.
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workoutId } = body

    if (!workoutId || typeof workoutId !== 'string') {
      return NextResponse.json(
        { error: 'Workout ID is required' },
        { status: 400 }
      )
    }

    // Uncomment for debugging:
    // console.log('🏋️ [Get Workout By ID] Fetching workout:', workoutId)

    const authHeader = request.headers.get('authorization')

    // Use the dynamic workoutId in backend path params
    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_GET_WORKOUT_BY_ID(workoutId))

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: 'no-store',
    })

    // Uncomment for debugging:
    // console.log('🏋️ [Get Workout By ID] Backend response status:', backendResponse.status)

    const backendData = await backendResponse.json().catch(() => null)

    if (backendResponse.ok) {
      // Uncomment for debugging:
      // console.log('✅ [Get Workout By ID] Workout data received:', backendData)
      return NextResponse.json({
        success: true,
        data: backendData?.data ?? backendData,
        message: backendData?.message || 'Workout retrieved successfully',
      })
    } else {
      // Uncomment for debugging:
      // console.log('❌ [Get Workout By ID] Backend error:', backendData)
      return NextResponse.json(
        {
          success: false,
          error: backendData?.error || backendData?.message || 'Failed to retrieve workout',
          message: 'Failed to retrieve workout',
        },
        { status: backendResponse.status }
      )
    }
  } catch (error) {
    // Keep error logging for production debugging
    console.error('❌ [Get Workout By ID] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve workout',
      },
      { status: 500 }
    )
  }
}
