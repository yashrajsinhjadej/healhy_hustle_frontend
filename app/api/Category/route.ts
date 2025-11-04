// app/api/category/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    // Backend endpoint for category list
    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_CATEGORY_LIST)
    // Uncomment for debugging:
    // console.log('Fetching categories from backend URL:', backendUrl)
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()

      // Handle unauthorized
      if (response.status === 401) {
        try {
          const errorData = JSON.parse(errorText)
          return NextResponse.json(
            {
              success: false,
              error: errorData.error || 'Session expired',
              message: errorData.message || 'Session expired',
            },
            { status: 401 }
          )
        } catch {
          return NextResponse.json(
            { success: false, error: 'Session expired', message: 'Session expired' },
            { status: 401 }
          )
        }
      }

      // Other errors
      return NextResponse.json(
        { success: false, error: `Failed to fetch categories: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const apiData = await response.json()

    // Expected structure:
    // { message: "Categories retrieved successfully", data: [ ... ] }
    const categories = apiData.data || []

    return NextResponse.json({
      success: true,
      message: apiData.message || 'Categories retrieved successfully',
      data: categories,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
