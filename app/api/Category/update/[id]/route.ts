import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl,API_ENDPOINTS } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
  }

  try {
    // 🔐 Get Authorization header
    const authHeader = request.headers.get('authorization')

    // 📦 Parse request body
    const body = await request.json()

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_CATEGORY_UPDATE(id))

    console.log('🔗 [Category Update] Forwarding to:', backendUrl)
    console.log('📤 [Category Update] Request Body:', body)

    // 🚀 Forward request to backend
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    })

    // 🧠 Handle response (both JSON / text)
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    const text = await res.text()
    return new NextResponse(text, { status: res.status })
  } catch (err) {
    console.error('❌ [Category Update] Error:', err)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}
