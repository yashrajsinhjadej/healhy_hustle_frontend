import { NextRequest, NextResponse } from 'next/server'

interface SignupRequest {
  name: string
  email: string
  password: string
  phone?: string
  age?: number
  gender?: string
  fitnessGoal?: string
}

interface SignupResponse {
  success: boolean
  message?: string
  error?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    const { name, email, password, phone, age, gender, fitnessGoal } = body

    console.log('📝 [User Signup API] Processing signup request for:', email)
    console.log('📝 [User Signup API] User data:', { name, email, phone, age, gender, fitnessGoal })

    // Validate required fields
    if (!name || !email || !password) {
      console.log('❌ [User Signup API] Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ [User Signup API] Invalid email format')
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      console.log('❌ [User Signup API] Password too short')
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    console.log('📝 [User Signup API] Backend URL: https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app/api/user/signup')
    
    // Forward signup request to backend
    const response = await fetch('https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app/api/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        age,
        gender,
        fitnessGoal
      }),
    })

    const data: SignupResponse = await response.json()
    console.log('📝 [User Signup API] Backend response:', data)

    if (response.ok && data.success) {
      console.log('✅ [User Signup API] User registration successful')
      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: data.user
      })
    } else {
      console.log('❌ [User Signup API] User registration failed:', data.error || data.message)
      return NextResponse.json(
        {
          success: false,
          error: data.error || data.message || 'Registration failed. Please try again.'
        },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('❌ [User Signup API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
