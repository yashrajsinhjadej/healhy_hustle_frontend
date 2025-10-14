// app/api/workout/videos/update/route.ts

import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null)
    if (!payload || !payload.workoutId || !payload.videoId) {
      return NextResponse.json(
        { error: "workoutId and videoId are required" },
        { status: 400 }
      )
    }

    const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendBase) {
      return NextResponse.json({ error: "BACKEND_URL not configured" }, { status: 500 })
    }
    const backendUrl = `${backendBase.replace(/\/$/, "")}/api/workout/videos/update`

    const authHeader = req.headers.get("authorization") || undefined

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const contentType = backendRes.headers.get("content-type") || "application/json"
    const text = await backendRes.text()

    return new NextResponse(text, {
      status: backendRes.status,
      headers: { "content-type": contentType },
    })
  } catch (err: any) {
    console.error("❌ [Videos Update Proxy] Error:", err)
    return NextResponse.json(
      { error: err?.message || "Proxy error" },
      { status: 500 }
    )
  }
}
