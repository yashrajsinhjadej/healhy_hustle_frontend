// app/api/workout/admin/update/[id]/route.ts

import { API_ENDPOINTS, getBackendApiUrl } from "@/lib/backend-config";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_UPDATE_WORKOUT_SEQUENCE);
    console.log(`🔄 Proxying update request to: ${backendUrl}`);

    // 1) Parse JSON body from the incoming request
    const incoming = await req.json().catch(() => null);
    if (!incoming) {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    // 2) Normalize and validate fields
    const workoutId = incoming.workoutId ?? incoming.workoutid ?? params.id; // allow path param fallback
    const categoryId = incoming.categoryId ?? incoming.categoryid;
    const workoutsequence = incoming.workoutsequence ?? incoming.sequence;

    if (!workoutId || !categoryId || workoutsequence === undefined || workoutsequence === null) {
      return NextResponse.json(
        { error: "Bad Request", message: "workoutId, categoryId and workoutsequence are required" },
        { status: 400 }
      );
    }

    // Optional: ensure numeric sequence
    const sequenceNum = Number(workoutsequence);
    if (!Number.isFinite(sequenceNum)) {
      return NextResponse.json(
        { error: "Bad Request", message: "workoutsequence must be a number" },
        { status: 400 }
      );
    }

    // 3) Forward as JSON to backend
    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Forward useful auth headers while avoiding hop-by-hop headers
        authorization: req.headers.get("authorization") || "",
        cookie: req.headers.get("cookie") || "",
        "x-requested-with": "Next.js",
      },
      body: JSON.stringify({
        workoutId,
        categoryId,
        workoutsequence: sequenceNum,
      }),
    });

    const contentType = backendRes.headers.get("content-type") || "application/json";
    const responseText = await backendRes.text();

    if (!backendRes.ok) {
      console.error(`❌ Backend error (${backendRes.status}):`, responseText);
    } else {
      console.log(`✅ Workout sequence updated`);
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
