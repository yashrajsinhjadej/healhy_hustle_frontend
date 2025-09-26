import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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

    // Get the request body
    const body = await request.json()
    
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    console.log('✏️ [Update User API] Updating user:', userId)
    console.log('✏️ [Update User API] Request body:', JSON.stringify(body, null, 2))
    console.log('✏️ [Update User API] Auth header:', authHeader ? 'Present' : 'Missing')
    if (authHeader) {
      console.log('✏️ [Update User API] Token preview:', authHeader.substring(0, 20) + '...')
    }
    console.log('✏️ [Update User API] Backend URL:', `https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app/api/admin/users/${userId}`)
    
    // Make PUT request to the backend API
    const response = await fetch(`https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body)
    })

    console.log('✏️ [Update User API] Backend response status:', response.status)
    console.log('✏️ [Update User API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Update User API] Backend error response:', errorText)
      
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
        { error: `Failed to update user: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ [Update User API] User updated successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: result
    })

  } catch (error) {
    console.error('❌ [Update User API] Error updating user:', error)
    if (error instanceof Error) {
      console.error('❌ [Update User API] Error message:', error.message)
      console.error('❌ [Update User API] Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    
    console.log('🗑️ [Delete User API] Deleting user:', userId)
    console.log('🗑️ [Delete User API] Auth header:', authHeader ? 'Present' : 'Missing')
    if (authHeader) {
      console.log('🗑️ [Delete User API] Token preview:', authHeader.substring(0, 20) + '...')
    }
    console.log('🗑️ [Delete User API] Backend URL:', `https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app/api/admin/users/${userId}`)
    
    // Make DELETE request to the backend API
    const response = await fetch(`https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    })

    console.log('🗑️ [Delete User API] Backend response status:', response.status)
    console.log('🗑️ [Delete User API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Delete User API] Backend error response:', errorText)
      
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
        { error: `Failed to delete user: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ [Delete User API] User deleted successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: result
    })

  } catch (error) {
    console.error('❌ [Delete User API] Error deleting user:', error)
    if (error instanceof Error) {
      console.error('❌ [Delete User API] Error message:', error.message)
      console.error('❌ [Delete User API] Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}