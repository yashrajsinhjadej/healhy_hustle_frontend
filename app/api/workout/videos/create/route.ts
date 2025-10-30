// app/api/workout/videos/create/route.ts
import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS, getBackendApiUrl } from "@/lib/backend-config"

export const dynamic = "force-dynamic"

/**
 * Create Workout Video (Proxy)
 * POST /api/workout/videos/create
 * Body (JSON):
 * {
 *   workoutId: string,
 *   title: string,
 *   description: string,
 *   youtubeUrl: string,
 *   duration: number,   // seconds
 *   sequence: number
 * }
 * Forwards to backend: {{url}}/api/workout/videos/create
 * Passes through Authorization header (JWT).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    // Parse JSON body
    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // Basic validation
    const p = payload as any
    const valid =
      p &&
      typeof p.workoutId === "string" &&
      typeof p.title === "string" &&
      typeof p.description === "string" &&
      typeof p.youtubeUrl === "string" &&
      typeof p.duration === "number" &&
      typeof p.sequence === "number"

    if (!valid) {
      return NextResponse.json(
        {
          error:
            "Body must include workoutId, title, description, youtubeUrl (strings), duration and sequence (numbers)",
        },
        { status: 422 }
      )
    }

    // Build backend URL
    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_VIDEO_CREATE)

    // Proxy request to backend
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(p),
    })

    // Pass-through backend response (JSON or text)
    const contentType = res.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    const text = await res.text()
    return new NextResponse(text, { status: res.status })
  } catch (err) {
    console.error("Error proxying create workout video:", err)
    return NextResponse.json(
      { error: "Failed to create workout video" },
      { status: 500 }
    )
  }
}
