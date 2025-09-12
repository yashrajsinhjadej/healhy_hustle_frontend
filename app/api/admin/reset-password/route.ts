import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        { 
          message: "Validation failed",
          error: "Token and password are required" 
        },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { 
          message: "Validation failed", 
          error: "Password must be at least 6 characters long"
        },
        { status: 400 }
      )
    }

    console.log('🔐 [Reset Password API] Processing password reset with token')
    console.log('🔐 [Reset Password API] Token preview:', token.substring(0, 8) + '...')
    console.log('🔐 [Reset Password API] Backend URL: http://localhost:3000/api/admin/reset-password')
    
    // Forward request to backend
    const response = await fetch('http://localhost:3000/api/admin/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password })
    })

    console.log('🔐 [Reset Password API] Backend response status:', response.status)
    console.log('🔐 [Reset Password API] Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Reset Password API] Backend error response:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { 
            message: errorData.message || "Validation failed",
            error: errorData.error || "Failed to reset password"
          },
          { status: response.status }
        )
      } catch (parseError) {
        return NextResponse.json(
          { 
            message: "Server error",
            error: "Failed to reset password. Please try again later."
          },
          { status: 500 }
        )
      }
    }

    const result = await response.json()
    console.log('✅ [Reset Password API] Password reset successful:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ [Reset Password API] Error processing request:', error)
    return NextResponse.json(
      { 
        message: "Server error",
        error: "Failed to reset password. Please try again later."
      },
      { status: 500 }
    )
  }
}

