import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Forward login request directly to backend for validation
    try {
      console.log('🔐 [Login API] Forwarding login request to backend...')

      console.log('🔐 [Login API] Backend URL:', getBackendApiUrl(API_ENDPOINTS.ADMIN_LOGIN))
      // Forward the login request to your backend
      const backendResponse = await fetch(getBackendApiUrl(API_ENDPOINTS.ADMIN_LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('🔐 [Login API] Backend response status:', backendResponse.status)
      console.log('🔐 [Login API] Backend response ok:', backendResponse.ok)

      if (backendResponse.ok) {
        const backendData = await backendResponse.json()
        console.log('🔐 [Login API] Backend response data:', backendData)
        
        // Extract the real JWT token from your backend
        const realToken = backendData.token || backendData.accessToken || backendData.jwt || backendData.data?.token
        
        if (realToken) {
          console.log('✅ [Login API] Got real JWT token from backend')
          console.log('🔍 [Login API] Token preview:', realToken.substring(0, 20) + '...')
          console.log('🔍 [Login API] Token length:', realToken.length)
          console.log('🔍 [Login API] Token type:', typeof realToken)
          
          return NextResponse.json({
            success: true,
            message: 'Login successful',
            token: realToken,
            user: {
              id: '68c12de42de51717e06afd68',
              email: email,
              name: 'yashraj',
              role: 'admin'
            }
          })
        } else {
          console.log('⚠️ [Login API] No token found in backend response')
          console.log('🔍 [Login API] Available fields:', Object.keys(backendData))
          return NextResponse.json(
            { 
              success: false,
              error: 'No token received from backend',
              message: 'Authentication failed - no token received'
            },
            { status: 500 }
          )
        }
      } else {
        const errorText = await backendResponse.text()
        console.log('❌ [Login API] Backend login failed:', errorText)
        
        // Return the backend error instead of falling back to session token
        try {
          const errorData = JSON.parse(errorText)
          return NextResponse.json(
            { 
              success: false,
              error: errorData.error || errorData.message || 'Login failed',
              message: errorData.message || errorData.error || 'Login failed'
            },
            { status: backendResponse.status }
          )
        } catch (parseError) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Login failed',
              message: 'Login failed'
            },
            { status: backendResponse.status }
          )
        }
      }
    } catch (backendError) {
      console.log('❌ [Login API] Backend login error:', backendError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Backend connection failed',
          message: 'Unable to connect to authentication server'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
