import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    // Uncomment for debugging:
    // console.log('🔍 [Profile API] Making request to backend...')
    // console.log('🔍 [Profile API] Auth header:', authHeader ? 'Present' : 'Missing')
    
    // Fetch data from the correct profile endpoint
    const response = await fetch(getBackendApiUrl(API_ENDPOINTS.ADMIN_PROFILE), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    })

    // Uncomment for debugging:
    // console.log('🔍 [Profile API] Backend response status:', response.status)
    // console.log('🔍 [Profile API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      // Keep error logging for production debugging
      console.error('❌ [Profile API] Backend error response:', errorText)
      
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
    
    // Check if the response has the expected structure
    // Profile endpoint returns: { success: true, data: { admin: {...} } }
    if (!apiData || !apiData.data) {
      console.error('❌ [Profile API] Unexpected API response structure:', apiData)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid API response structure',
          message: 'Failed to fetch user profile'
        },
        { status: 500 }
      )
    }
    
    // Handle both possible response structures
    // Option 1: { data: { admin: {...} } } - from profile endpoint
    // Option 2: { data: {...} } - direct admin object
    const adminData = apiData.data.admin || apiData.data

    // Format the admin data for the frontend
    const currentUser = {
      id: adminData.id || adminData._id,
      name: adminData.name,
      email: adminData.email,
      username: adminData.username || adminData.name.toLowerCase().replace(/\s+/g, '_'),
      role: adminData.role,
      avatar: adminData.avatar || adminData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      lastLogin: adminData.lastLogin || new Date().toISOString(),
      createdAt: adminData.createdAt || new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: currentUser
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        message: 'Failed to fetch user profile'
      },
      { status: 500 }
    )
  }
}
