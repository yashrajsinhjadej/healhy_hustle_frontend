import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    console.log('🔍 [Users API] Making request to backend...')
    console.log('🔍 [Users API] Auth header:', authHeader ? 'Present' : 'Missing')
    if (authHeader) {
      console.log('🔍 [Users API] Token preview:', authHeader.substring(0, 20) + '...')
    }
    console.log('🔍 [Users API] Backend URL: http://localhost:3000/api/admin/dashboard')
    
    // Build query parameters for the dashboard API
    const dashboardParams = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      ...(status && { status }),
      _t: Date.now().toString() // Cache busting parameter
    })

    const backendUrl = `http://localhost:3000/api/admin/dashboard?${dashboardParams}`
    console.log('🔍 [Users API] Full backend URL:', backendUrl)
    console.log('🔍 [Users API] Request parameters:', { page, search, status })

    // Fetch data from the real API endpoint with pagination
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    })

    console.log('🔍 [Users API] Backend response status:', response.status)
    console.log('🔍 [Users API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Users API] Backend error response:', errorText)
      
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
      
      throw new Error(`Failed to fetch data from admin dashboard API: ${response.status} - ${errorText}`)
    }

    const apiData = await response.json()
    console.log('🔍 [Users API] Raw backend response:', JSON.stringify(apiData, null, 2))
    
    // Use the backend's pagination data directly
    const users = apiData.data?.users || []
    const pagination = apiData.data?.pagination || {}
    const stats = apiData.data?.stats || {}
    
    console.log('🔍 [Users API] Backend pagination:', pagination)
    console.log('🔍 [Users API] Backend stats:', stats)
    console.log('🔍 [Users API] Users count:', users.length)

    return NextResponse.json({
      success: true,
      data: {
        users: users,
        pagination: {
          currentPage: pagination.currentPage || page,
          totalPages: pagination.totalPages || 1,
          totalUsers: pagination.totalUsers || 0,
          hasNextPage: pagination.hasNextPage || false,
          hasPrevPage: pagination.hasPrevPage || false
        },
        stats: stats
      }
    })
  } catch (error) {
    console.error('❌ [Users API] Error fetching users:', error)
    if (error instanceof Error) {
      console.error('❌ [Users API] Error message:', error.message)
      console.error('❌ [Users API] Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
