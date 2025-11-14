import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/backend-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    const body = await request.json()

    console.log('📨 [Create Notification API] Creating notification')
    console.log('📨 [Create Notification API] Request body:', JSON.stringify(body, null, 2))
    console.log('📨 [Create Notification API] Auth header:', authHeader ? 'Present' : 'Missing')

    // Required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { success: false, error: 'Title and body are required' },
        { status: 400 }
      )
    }

    const validScheduleTypes = ['instant', 'daily', 'scheduled_once']
    if (!body.scheduleType || !validScheduleTypes.includes(body.scheduleType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid scheduleType' },
        { status: 400 }
      )
    }

    if (body.scheduleType === 'daily' && !body.scheduledTime) {
      return NextResponse.json(
        { success: false, error: 'scheduledTime is required for daily notifications' },
        { status: 400 }
      )
    }

    if (body.scheduleType === 'scheduled_once' && !body.scheduledDate) {
      return NextResponse.json(
        { success: false, error: 'scheduledDate is required' },
        { status: 400 }
      )
    }

    // 💥 THE IMPORTANT PART: Forward targetAudience + filters
    const payload: any = {
      title: body.title,
      body: body.body,
      scheduleType: body.scheduleType,
      targetAudience: body.targetAudience || 'all',
      filters: body.targetAudience === 'filtered' ? body.filters : undefined,
      scheduledTime: body.scheduledTime,
      scheduledDate: body.scheduledDate
        ? new Date(body.scheduledDate).toISOString()
        : undefined
    }

    const backendUrl = getBackendApiUrl('/api/notification/admin/send-to-all')

    console.log('📨 [Create Notification API] Backend URL:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(payload)
    })

    console.log('📨 [Create Notification API] Backend response status:', response.status)

    if (!response.ok) {
      const errText = await response.text()
      console.error('❌ Backend error:', errText)

      try {
        const errJson = JSON.parse(errText)
        return NextResponse.json(
          { success: false, error: errJson.error || errJson.message },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { success: false, error: errText },
          { status: response.status }
        )
      }
    }

    const result = await response.json()
    console.log('✅ Notification created successfully')

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      data: result
    })

  } catch (error: any) {
    console.error('❌ [Create Notification API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
