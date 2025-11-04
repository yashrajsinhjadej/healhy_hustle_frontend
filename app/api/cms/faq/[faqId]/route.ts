import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl, API_ENDPOINTS } from "@/lib/backend-config";

export async function PUT(
  request: NextRequest,
  { params }: { params: { faqId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    // Validate faqId parameter
    if (!params.faqId || typeof params.faqId !== 'string' || !params.faqId.trim()) {
      return NextResponse.json(
        { success: false, message: "Valid FAQ ID is required" },
        { status: 400 }
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

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_FAQ_UPDATE(params.faqId));

    const response = await fetch(backendUrl, {
      method: "PUT",
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
          message: errorData.message || "Failed to update FAQ item" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating FAQ item:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { faqId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    // Validate faqId parameter
    if (!params.faqId || typeof params.faqId !== 'string' || !params.faqId.trim()) {
      return NextResponse.json(
        { success: false, message: "Valid FAQ ID is required" },
        { status: 400 }
      );
    }

    const backendUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_FAQ_DELETE(params.faqId));

    const response = await fetch(backendUrl, {
      method: "DELETE",
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
          message: errorData.message || "Failed to delete FAQ item" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting FAQ item:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
