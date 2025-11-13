// app/api/notifications/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/backend-config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    // Get query parameters from the URL
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'firedAt'
    const order = searchParams.get('order') || 'desc'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    
    console.log('📋 [Notification History API] Fetching notification history')
    console.log('📋 [Notification History API] Query params:', {
      page,
      limit,
      status,
      sortBy,
      order,
      startDate,
      endDate,
      search
    })
    console.log('📋 [Notification History API] Auth header:', authHeader ? 'Present' : 'Missing')
    
    // Build query string
    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      order,
      ...(status && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(search && { search }),
    })
    
    const backendUrl = getBackendApiUrl(`/api/notification/admin/history?${queryParams.toString()}`)
    console.log('📋 [Notification History API] Backend URL:', backendUrl)
    
    // Make GET request to the backend API
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      cache: 'no-store'
    })

    console.log('📋 [Notification History API] Backend response status:', response.status)
    console.log('📋 [Notification History API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Notification History API] Backend error response:', errorText)
      
      // If it's a 401 error, forward it to the frontend for session handling
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
        { error: `Failed to fetch notification history: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ [Notification History API] Notification history fetched successfully')
    console.log('✅ [Notification History API] Total notifications:', result.data?.pagination?.totalItems || 0)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ [Notification History API] Error fetching notification history:', error)
    if (error instanceof Error) {
      console.error('❌ [Notification History API] Error message:', error.message)
      console.error('❌ [Notification History API] Error stack:', error.stack)
    }
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