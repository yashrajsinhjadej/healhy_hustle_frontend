// filename: app/api/workout/admin/delete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS, getBackendApiUrl } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

/**
 * Supports both POST and DELETE to /api/workout/admin/delete
 * Expects JSON body { workoutId } (or { id }), and proxies to backend.
 */
async function proxyDelete(request: NextRequest) {
  try {
    const authHeader =
      request.headers.get('authorization') || request.headers.get('Authorization')

    // Read id from JSON body
    const { workoutId, id } = await request.json().catch(() => ({} as any))
    const effectiveId = workoutId ?? id

    if (!effectiveId) {
      return NextResponse.json({ error: 'workoutId is required' }, { status: 400 })
    }

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_DELETE_WORKOUT)

    // Forward to backend; adjust method/key to match backend contract
    const res = await fetch(backendUrl, {
      method: 'POST', // change to 'DELETE' if backend expects DELETE
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workoutId: effectiveId }), // or { id: effectiveId }
    })

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    const text = await res.text()
    return new NextResponse(text, { status: res.status })
  } catch (err) {
    console.error('Error proxying delete workout:', err)
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return proxyDelete(request)
}

export async function DELETE(request: NextRequest) {
  return proxyDelete(request)
}
