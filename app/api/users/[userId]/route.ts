import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    console.log('🔍 [User Detail API] Fetching user:', userId)
    console.log('🔍 [User Detail API] Auth header:', authHeader ? 'Present' : 'Missing')
    if (authHeader) {
      console.log('🔍 [User Detail API] Token preview:', authHeader.substring(0, 20) + '...')
    }
    
    // Call your backend API to get user details
    const backendUrl = `http://localhost:3000/api/admin/users/${userId}`
    console.log('🔍 [User Detail API] Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    })

    console.log('🔍 [User Detail API] Backend response status:', response.status)
    console.log('🔍 [User Detail API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [User Detail API] Backend error response:', errorText)
      
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
      
      throw new Error(`Failed to fetch user data from backend: ${response.status} - ${errorText}`)
    }

    const apiData = await response.json()
    console.log('🔍 [User Detail API] Backend response data:', apiData)
    
    return NextResponse.json({
      success: true,
      data: apiData.data?.user || apiData.data || apiData
    })
  } catch (error) {
    console.error('❌ [User Detail API] Error fetching user:', error)
    if (error instanceof Error) {
      console.error('❌ [User Detail API] Error message:', error.message)
      console.error('❌ [User Detail API] Error stack:', error.stack)
    }
    console.error('❌ [User Detail API] Full error object:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        userId: params.userId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    console.log('🔍 [User Update API] Updating user:', userId)
    console.log('🔍 [User Update API] Update data:', body)
    console.log('🔍 [User Update API] Auth header:', authHeader ? 'Present' : 'Missing')
    
    // Call your backend API to update user
    const backendUrl = `http://localhost:3000/api/admin/users/${userId}`
    console.log('🔍 [User Update API] Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body)
    })

    console.log('🔍 [User Update API] Backend response status:', response.status)
    console.log('🔍 [User Update API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [User Update API] Backend error response:', errorText)
      
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
      
      // For validation errors (400, 422), forward the backend error to frontend
      if (response.status === 400 || response.status === 422) {
        try {
          const errorData = JSON.parse(errorText)
          return NextResponse.json(
            { 
              success: false, 
              error: errorData.error || errorData.message || 'Validation failed',
              message: errorData.message || errorData.error || 'Validation failed'
            },
            { status: response.status }
          )
        } catch (parseError) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Validation failed',
              message: 'Validation failed'
            },
            { status: response.status }
          )
        }
      }
      
      // For other errors, throw to be caught by the catch block
      throw new Error(`Failed to update user: ${response.status} - ${errorText}`)
    }

    const apiData = await response.json()
    console.log('🔍 [User Update API] Backend response data:', apiData)
    
    return NextResponse.json({
      success: true,
      data: apiData.data || apiData
    })
  } catch (error) {
    console.error('❌ [User Update API] Error updating user:', error)
    if (error instanceof Error) {
      console.error('❌ [User Update API] Error message:', error.message)
      console.error('❌ [User Update API] Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

