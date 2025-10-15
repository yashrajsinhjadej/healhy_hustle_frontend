// app/api/users/export-dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Collect filters (similar to get users)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || ''
    const profileCompleted = searchParams.get('profileCompleted') || ''
    const gender = searchParams.get('gender') || ''
    const age_min = searchParams.get('age_min') || ''
    const age_max = searchParams.get('age_max') || ''

    const authHeader = request.headers.get('authorization')

    const qs = new URLSearchParams({
      page,
      ...(limit && { limit }),
      ...(profileCompleted && { profileCompleted }),
      ...(gender && { gender }),
      ...(age_min && { age_min }),
      ...(age_max && { age_max }),
      _t: Date.now().toString(), // cache busting
    })

    const backendUrl = `${getBackendApiUrl(API_ENDPOINTS.ADMIN_EXPORT_CSV)}?${qs.toString()}`
    console.log(backendUrl)
    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: `Backend error: ${response.status} - ${text}` },
        { status: response.status }
      )
    }

    // Get CSV content as blob/buffer
    const csvData = await response.text()

    // Return CSV to frontend with correct headers
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="dashboard_export.csv"',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
