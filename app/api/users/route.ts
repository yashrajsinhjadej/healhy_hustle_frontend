// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Core pagination + search
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '' // pass-through if provided
    const search = searchParams.get('search') || ''

    // Minimal filters
    const status = searchParams.get('status') || ''          // 'active' | 'inactive'
    const gender = searchParams.get('gender') || ''          // 'male' | 'female' | 'other'
    const age_min = searchParams.get('age_min') || ''        // number string
    const age_max = searchParams.get('age_max') || ''        // number string
    const profileCompleted = searchParams.get('profileCompleted') || '' // get it from URL

    const authHeader = request.headers.get('authorization')

    // Build querystring for backend dashboard controller
    const qs = new URLSearchParams({
      page,
      ...(limit && { limit }),
      ...(search && { search }),
      ...(status && { status }),
      ...(gender && { gender }),
      ...(age_min && { age_min }),
      ...(age_max && { age_max }),
      ...(profileCompleted && { profileCompleted }),
      _t: Date.now().toString(), // cache busting
    })

    const backendUrl = `${getBackendApiUrl(API_ENDPOINTS.ADMIN_DASHBOARD)}?${qs.toString()}`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      if (response.status === 401) {
        try {
          const errorData = JSON.parse(errorText)
          return NextResponse.json(
            {
              success: false,
              error: errorData.error || errorData.message || 'Session expired',
              message: errorData.message || errorData.error || 'Session expired',
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
      return NextResponse.json(
        { error: `Failed to fetch dashboard: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const apiData = await response.json()
    const users = apiData.data?.users || []
    const pagination = apiData.data?.pagination || {}
    const stats = apiData.data?.stats || {}

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pagination.currentPage ?? Number(page),
          totalPages: pagination.totalPages ?? 1,
          totalUsers: pagination.totalUsers ?? 0,
          hasNextPage: pagination.hasNextPage ?? false,
          hasPrevPage: pagination.hasPrevPage ?? false,
        },
        stats,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
