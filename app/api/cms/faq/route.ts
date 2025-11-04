import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl, API_ENDPOINTS } from "@/lib/backend-config";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_FAQ_LIST);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Failed to fetch FAQ items" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching FAQ items:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Input validation
    if (!body.question || typeof body.question !== 'string' || !body.question.trim()) {
      return NextResponse.json(
        { success: false, message: "Question is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!body.answer || typeof body.answer !== 'string' || !body.answer.trim()) {
      return NextResponse.json(
        { success: false, message: "Answer is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Sanitize inputs (trim whitespace)
    const sanitizedBody = {
      question: body.question.trim().substring(0, 500), // Max 500 chars
      answer: body.answer.trim().substring(0, 2000), // Max 2000 chars
    };

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_FAQ_CREATE);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(sanitizedBody),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Failed to create FAQ item" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating FAQ item:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
