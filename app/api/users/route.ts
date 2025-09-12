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
    
    // Fetch data from the real API endpoint
    const response = await fetch('http://localhost:3000/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    
    const users = apiData.data?.users || []
    console.log('🔍 [Users API] Extracted users:', users.length, 'users found')
    console.log('🔍 [Users API] First user sample:', users[0] || 'No users')

    // Filter users based on search term
    let filteredUsers = users
    if (search) {
      filteredUsers = users.filter(
        (user: any) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filter by status if provided
    if (status) {
      filteredUsers = filteredUsers.filter((user: any) => user.status === status)
    }

    // Calculate pagination
    const totalUsers = filteredUsers.length
    const totalPages = Math.ceil(totalUsers / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    console.log('🔍 [Users API] Final response:', {
      usersCount: paginatedUsers.length,
      totalUsers,
      currentPage: page,
      totalPages,
      stats: apiData.data?.stats
    })

    return NextResponse.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        stats: apiData.data?.stats
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
