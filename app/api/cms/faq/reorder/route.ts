import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl, API_ENDPOINTS } from "@/lib/backend-config";

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.orderedIds || !Array.isArray(body.orderedIds)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body. Expected 'orderedIds' array." },
        { status: 400 }
      );
    }

    if (body.orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "orderedIds array cannot be empty" },
        { status: 400 }
      );
    }

    // Validate each ID is a non-empty string
    const isValid = body.orderedIds.every(
      (id: any) => typeof id === 'string' && id.trim().length > 0
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "All IDs in orderedIds must be non-empty strings" },
        { status: 400 }
      );
    }

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_FAQ_REORDER);

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Failed to reorder FAQ items" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reordering FAQ items:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
