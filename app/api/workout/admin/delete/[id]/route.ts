import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const authHeader = request.headers.get('authorization')

    const backendUrl = `${getBackendApiUrl(`/api/workout/admin/delete/${id}`)}`

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        // Let backend decide content-type
      }
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
