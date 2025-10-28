// app/api/Category/details/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

export const dynamic = 'force-dynamic' // disable static caching

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 })
  }

  try {
    // Forward auth
    const authHeader = request.headers.get('authorization')

    // Build backend URL with cache-bust to avoid intermediary caches
    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_CATEGORY_DETAILS(id))
    const urlWithBust = `${backendUrl}${backendUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`
    console.log('🔗 [Category Details] Forwarding to:', urlWithBust)

    // Forward request with explicit no-store
    const res = await fetch(urlWithBust, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: 'no-store',
    })

    const contentType = res.headers.get('content-type') || ''

    // Normalize response to JSON
    if (contentType.includes('application/json')) {
      const data = await res.json()

      // Propagate no-store headers to the client
      const nextRes = NextResponse.json(data, { status: res.status })
      nextRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      nextRes.headers.set('Pragma', 'no-cache')
      nextRes.headers.set('Expires', '0')
      nextRes.headers.set('Surrogate-Control', 'no-store')
      return nextRes
    }

    const text = await res.text()
    const nextRes = new NextResponse(text, { status: res.status })
    nextRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    nextRes.headers.set('Pragma', 'no-cache')
    nextRes.headers.set('Expires', '0')
    nextRes.headers.set('Surrogate-Control', 'no-store')
    return nextRes
  } catch (err) {
    console.error('❌ [Category Details] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category details' },
      { status: 500 }
    )
  }
}
