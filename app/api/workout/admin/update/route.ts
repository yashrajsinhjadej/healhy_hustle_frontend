// app/api/workout/admin/update/route.ts

import { NextResponse } from "next/server"

// Non-dynamic proxy: expects ?id= in query; forwards POST multipart to backend /api/workout/admin/update/:id
export async function POST(req: Request) {
  try {
    const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendBase) {
      return NextResponse.json({ error: "BACKEND_URL not configured" }, { status: 500 })
    }

    const url = new URL(req.url)
    const workoutId = url.searchParams.get("id")
    if (!workoutId) {
      return NextResponse.json({ error: "Missing id query param" }, { status: 400 })
    }

    const backendUrl = `${backendBase.replace(/\/$/, "")}/api/workout/admin/update/${encodeURIComponent(workoutId)}`

    // Forward headers (skip host)
    const forwardedHeaders: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() === "host") return
      forwardedHeaders[key] = value
    })

    // Preserve multipart form-data by forwarding raw body
    const bodyBuffer = await req.arrayBuffer()

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: forwardedHeaders as any,
      body: Buffer.from(bodyBuffer),
    })

    const text = await res.text()
    const contentType = res.headers.get("content-type") || "application/json"

    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentType },
    })
  } catch (err: any) {
    console.error("Error proxying update workout request:", err)
    return NextResponse.json({ error: err?.message || "Proxy error" }, { status: 500 })
  }
}
