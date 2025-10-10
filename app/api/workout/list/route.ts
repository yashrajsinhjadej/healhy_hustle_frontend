import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

// This route reads request.headers (authorization) and must be dynamic.
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 🔹 Call your backend API

    const authHeader = request.headers.get('authorization')

    const response = await fetch(getBackendApiUrl(API_ENDPOINTS.ADMIN_WORKOUTS_LIST), {
      method: 'GET',    
      headers: {
        'Content-Type': 'application/json',
         ...(authHeader && { 'Authorization': authHeader }),
      },
      cache: 'no-store', // prevents caching
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend Error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error:', err)
    return NextResponse.json({ error: 'Server error fetching workouts' }, { status: 500 })
  }
}
