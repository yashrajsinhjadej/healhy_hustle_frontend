// app/api/workout/admin/update/[id]/route.ts

import { API_ENDPOINTS, getBackendApiUrl } from "@/lib/backend-config";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = params.id;
    if (!workoutId) {
      return NextResponse.json({ error: "Workout ID is required (in path)" }, { status: 400 });
    }

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_UPDATE_WORKOUT(workoutId))
    console.log(`🔄 Proxying update request to: ${backendUrl}`);

    const forwardedHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k !== "host" && k !== "content-length" && k !== "accept-encoding" && k !== "connection") {
        forwardedHeaders[key] = value;
      }
    });

    const bodyBuffer = await req.arrayBuffer();

    const backendRes = await fetch(backendUrl, {
      method: "POST", // backend expects POST
      headers: forwardedHeaders as HeadersInit,
      body: Buffer.from(bodyBuffer),
    });

    const responseText = await backendRes.text();
    const contentType = backendRes.headers.get("content-type") || "application/json";

    if (!backendRes.ok) {
      console.error(`❌ Backend error (${backendRes.status}):`, responseText);
    } else {
      console.log(`✅ Workout updated successfully: ${workoutId}`);
    }

    return new NextResponse(responseText, {
      status: backendRes.status,
      headers: { "content-type": contentType },
    });
  } catch (err: any) {
    console.error("❌ Error proxying workout update:", err);
    return NextResponse.json(
      { error: "Failed to update workout", message: err?.message || "Proxy error" },
      { status: 500 }
    );
  }
}
