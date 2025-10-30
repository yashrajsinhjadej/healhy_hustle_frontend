// app/api/workout/videos/delete/route.ts
import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS, getBackendApiUrl } from "@/lib/backend-config"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") // e.g., "Bearer <jwt>"

    // Parse incoming JSON
    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    // Basic validation to avoid forwarding bad data
    const { videoId, workoutId } = (payload as any) ?? {}
    if (typeof videoId !== "string" || typeof workoutId !== "string") {
      return NextResponse.json(
        { error: "Body must include videoId and workoutId as strings" },
        { status: 422 }
      )
    }

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_VIDEO_DELETE)

    // Proxy request to backend
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId, workoutId }),
    })

    // Pass-through backend response
    const contentType = res.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    const text = await res.text()
    return new NextResponse(text, { status: res.status })
  } catch (err) {
    console.error("Error proxying delete workout video:", err)
    return NextResponse.json(
      { error: "Failed to delete workout video" },
      { status: 500 }
    )
  }
}
