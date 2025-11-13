import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl,API_ENDPOINTS } from '@/lib/backend-config';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(getBackendApiUrl(API_ENDPOINTS.ADMIN_CMS(params.slug)), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching CMS content:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tokenHeader = request.headers.get('authorization');
    const token = tokenHeader?.startsWith('Bearer ') ? tokenHeader.slice(7) : tokenHeader;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Use CMS endpoint, not workout category
    const url = getBackendApiUrl(API_ENDPOINTS.ADMIN_CMS(params.slug));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Do NOT hardcode about-us; pass the actual slug and fields
      body: JSON.stringify({
        slug: params.slug,
        title: body.title,
        htmlContent: body.htmlContent
      }),
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error saving CMS content:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}