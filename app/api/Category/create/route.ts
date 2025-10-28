// app/api/category/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, designId,  } = body
    console.log('Received category creation request with body:', body)

    if (!name || !designId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: name, designId',
        },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_CATEGORY_CREATE)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ name, designId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to create category',
          error: data.error || null,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,    
      message: data.message || 'Category created successfully',
      data: data.data || null,
    })
  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
