import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Get query parameters from the URL
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const status = searchParams.get('status')
    const scheduleType = searchParams.get('scheduleType')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const search = searchParams.get('search')
    
    console.log('📅 [Scheduled Notifications API] Fetching scheduled notifications')
    console.log('📅 [Scheduled Notifications API] Query params:', {
      page,
      limit,
      status,
      scheduleType,
      sortBy,
      order,
      search
    })
    
    // Build query string
    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      order,
      ...(status && { status }),
      ...(scheduleType && { scheduleType }),
      ...(search && { search }),
    })
    
    const backendUrl = getBackendApiUrl(`/api/notification/admin/scheduled?${queryParams.toString()}`)
    console.log('📅 [Scheduled Notifications API] Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      cache: 'no-store'
    })

    console.log('📅 [Scheduled Notifications API] Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Scheduled Notifications API] Backend error response:', errorText)
      
      if (response.status === 401) {
        try {
          const errorData = JSON.parse(errorText)
          return NextResponse.json(
            { 
              success: false, 
              error: errorData.error || errorData.message || 'Session expired',
              message: errorData.message || errorData.error || 'Session expired'
            },
            { status: 401 }
          )
        } catch (parseError) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Session expired',
              message: 'Session expired'
            },
            { status: 401 }
          )
        }
      }
      
      return NextResponse.json(
        { error: `Failed to fetch scheduled notifications: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ [Scheduled Notifications API] Scheduled notifications fetched successfully')

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ [Scheduled Notifications API] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}