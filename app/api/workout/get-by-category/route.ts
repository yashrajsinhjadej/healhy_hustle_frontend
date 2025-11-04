import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl,API_ENDPOINTS } from '@/lib/backend-config'

// This route reads request.headers (authorization) and must be dynamic.
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId } = body
    
    // Validate required fields
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Uncomment for debugging:
    // console.log('🏋️ [Get Workout By Category] Fetching workouts for category:', categoryId)

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')

    // Forward request to backend
    const backendResponse = await fetch(
      getBackendApiUrl(API_ENDPOINTS.ADMIN_WORKOUT_BY_CATEGORY),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify({ categoryId }),
        cache: 'no-store', // prevents caching
      }
    )

    // Uncomment for debugging:
    // console.log('🏋️ [Get Workout By ID] Backend response status:', backendResponse.status)

    const backendData = await backendResponse.json()

    if (backendResponse.ok) {
      // Uncomment for debugging:
      // console.log('✅ [Get Workout By Category] Workout data received:', backendData)

      // Send only the actual workout object to frontend
      return NextResponse.json({
        success: true,
        data: backendData.data, // <- unwrapped
        message: backendData.message || 'Workout retrieved successfully',
      })
    } else {
      // Uncomment for debugging:
      // console.log('❌ [Get Workout By Category] Backend error:', backendData)

      return NextResponse.json(
        {
          success: false,
          error: backendData.error || backendData.message || 'Failed to retrieve workout',
          message: 'Failed to retrieve workout',
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
        message: 'Failed to retrieve workout',
      },
      { status: 500 }
    )
  }
}
