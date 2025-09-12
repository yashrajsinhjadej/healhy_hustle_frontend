import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    console.log('🔍 [Profile API] Making request to backend...')
    console.log('🔍 [Profile API] Auth header:', authHeader ? 'Present' : 'Missing')
    
    // Fetch data from the real API endpoint
    const response = await fetch('http://localhost:3000/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    })

    console.log('🔍 [Profile API] Backend response status:', response.status)
    console.log('🔍 [Profile API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
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
    const adminData = apiData.data.admin

    // Format the admin data for the frontend
    const currentUser = {
      id: adminData.id,
      name: adminData.name,
      email: adminData.email,
      username: adminData.name.toLowerCase().replace(/\s+/g, '_'),
      role: adminData.role,
      avatar: adminData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: currentUser
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
