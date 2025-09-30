import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

export async function POST(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    console.log('🚪 [Admin Logout] Processing logout request...')
    console.log('🚪 [Admin Logout] Auth header:', authHeader ? 'Present' : 'Missing')
    if (authHeader) {
      console.log('🚪 [Admin Logout] Token preview:', authHeader.substring(0, 20) + '...')
    }
    
    // Forward logout request to backend
    const response = await fetch(getBackendApiUrl(API_ENDPOINTS.ADMIN_LOGOUT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    })

    console.log('🚪 [Admin Logout] Backend response status:', response.status)
    console.log('🚪 [Admin Logout] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Admin Logout] Backend error response:', errorText)
      
      // Parse error response if possible
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { 
            message: errorData.message || "Logout failed",
            error: errorData.error || "Unknown error occurred"
          },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { 
            message: "Logout failed",
            error: "Server error occurred"
          },
          { status: response.status }
        )
      }
    }

    const data = await response.json()
    console.log('✅ [Admin Logout] Backend response data:', data)

    // Return success response
    return NextResponse.json({
      success: true,
      message: data.message || "Logged out successfully"
    })

  } catch (error) {
    console.error('❌ [Admin Logout] Error:', error)
    return NextResponse.json(
      { 
        message: "Logout failed",
        error: "Network error occurred"
      },
      { status: 500 }
    )
  }
}


