import { NextResponse } from 'next/server'
import { getBackendApiUrl,API_ENDPOINTS } from '@/lib/backend-config'
// Proxy route: forwards the incoming request (including multipart bodies) to the backend
export async function POST(req: Request) {
  try {
    const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendBase) {
      return NextResponse.json({ error: 'BACKEND_URL not configured' }, { status: 500 })
    }

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_CREATE_WORKOUT)

    // Forward headers
    const forwardedHeaders: Record<string,string> = {}
    req.headers.forEach((value, key) => {
      // skip host header to avoid issues
      if (key.toLowerCase() === 'host') return
      forwardedHeaders[key] = value
    })

    // Read raw body as ArrayBuffer and forward it unchanged so form-data/files are preserved
    const bodyBuffer = await req.arrayBuffer()

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: forwardedHeaders as any,
      body: Buffer.from(bodyBuffer),
      // keep credentials if any
      // Note: we intentionally forward auth header if present
    })

    const text = await res.text()
    const contentType = res.headers.get('content-type') || 'application/json'

    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': contentType }
    })
  } catch (err: any) {
    console.error('Error proxying create workout request:', err)
    return NextResponse.json({ error: err?.message || 'Proxy error' }, { status: 500 })
  }
}