import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { 
          message: "Validation failed",
          error: "Email is required" 
        },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          message: "Validation failed", 
          errors: [
            {
              field: "email",
              message: "Please enter a valid email address"
            }
          ]
        },
        { status: 400 }
      )
    }

    console.log('📧 [Forgot Password API] Processing password reset request for:', email)
    console.log('📧 [Forgot Password API] Backend URL:', getBackendApiUrl(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD))
    
    // Forward request to backend
    const response = await fetch(getBackendApiUrl(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    console.log('📧 [Forgot Password API] Backend response status:', response.status)
    console.log('📧 [Forgot Password API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Forgot Password API] Backend error response:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { 
            message: errorData.message || "Server error",
            error: errorData.error || "Failed to process password reset request"
          },
          { status: response.status }
        )
      } catch (parseError) {
        return NextResponse.json(
          { 
            message: "Server error",
            error: "Failed to process password reset request. Please try again later."
          },
          { status: 500 }
        )
      }
    }

    const result = await response.json()
    console.log('✅ [Forgot Password API] Password reset request successful:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ [Forgot Password API] Error processing request:', error)
    return NextResponse.json(
      { 
        message: "Server error",
        error: "Failed to process password reset request. Please try again later."
      },
      { status: 500 }
    )
  }
}

