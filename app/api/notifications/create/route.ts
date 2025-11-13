import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Get the request body
    const body = await request.json()
    
    console.log('📨 [Create Notification API] Creating notification')
    console.log('📨 [Create Notification API] Request body:', JSON.stringify(body, null, 2))
    console.log('📨 [Create Notification API] Auth header:', authHeader ? 'Present' : 'Missing')
    
    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Title and body are required' 
        },
        { status: 400 }
      )
    }

    // Validate scheduleType
    const validScheduleTypes = ['instant', 'daily', 'scheduled_once']
    if (!body.scheduleType || !validScheduleTypes.includes(body.scheduleType)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid scheduleType. Must be: instant, daily, or scheduled_once' 
        },
        { status: 400 }
      )
    }

    // Validate based on scheduleType
    if (body.scheduleType === 'daily' && !body.scheduledTime) {
      return NextResponse.json(
        { 
          success: false,
          error: 'scheduledTime is required for daily notifications (format: HH:mm)' 
        },
        { status: 400 }
      )
    }

    if (body.scheduleType === 'scheduled_once' && !body.scheduledDate) {
      return NextResponse.json(
        { 
          success: false,
          error: 'scheduledDate is required for scheduled notifications (ISO 8601 format)' 
        },
        { status: 400 }
      )
    }
    
    const backendUrl = getBackendApiUrl('/api/notification/admin/send-to-all')
    console.log('📨 [Create Notification API] Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body)
    })

    console.log('📨 [Create Notification API] Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Create Notification API] Backend error response:', errorText)
      
      if (response.status === 401) {
        try {
          const errorData = JSON.parse(errorText)
          return NextResponse.json(
            { 
              success: false, 
              error: errorData.error || errorData.message || 'Session expired',
              message: errorData.message || errorData.error || 'Session expired'
            },
            { status: 401 }
          )
        } catch (parseError) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Session expired',
              message: 'Session expired'
            },
            { status: 401 }
          )
        }
      }
      
      // Try to parse error response
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { 
            success: false,
            error: errorData.error || errorData.message || `Failed to create notification: ${response.status}` 
          },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { 
            success: false,
            error: `Failed to create notification: ${response.status} - ${errorText}` 
          },
          { status: response.status }
        )
      }
    }

    const result = await response.json()
    console.log('✅ [Create Notification API] Notification created successfully')

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      data: result
    })

  } catch (error) {
    console.error('❌ [Create Notification API] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}