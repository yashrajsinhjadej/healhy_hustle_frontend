// app/api/notifications/status/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, props: Params) {
  try {
    const params = await props.params
    const { id } = params

    // Get authorization header
    const authHeader = request.headers.get('authorization')

    // Parse request body
    let body: { isActive: boolean }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    // Validate isActive field
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isActive must be boolean' },
        { status: 400 }
      )
    }

    console.log('🔄 [Status Update API] Updating notification status:', { id, isActive: body.isActive })

    // Build backend URL
    const backendUrl = getBackendApiUrl(`/api/notification/admin/${id}/status`)
    console.log('🔄 [Status Update API] Backend URL:', backendUrl)

    // Call backend API
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({ isActive: body.isActive }),
    })

    console.log('🔄 [Status Update API] Backend response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      console.error('❌ [Status Update API] Backend error:', errorText)
      
      if (res.status === 401) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { success: false, message: errorText || res.statusText },
        { status: res.status }
      )
    }

    // Parse response
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
      console.log('✅ [Status Update API] Status updated successfully')
      return NextResponse.json(data)
    }

    console.log('✅ [Status Update API] Status updated successfully (no JSON response)')
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('❌ [Status Update API] Error:', err)
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}