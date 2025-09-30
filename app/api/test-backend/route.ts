import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 [Test Backend] Testing backend connectivity...')
    }
    
    // Test different possible backend URLs
    const possibleUrls = [
      getBackendApiUrl(API_ENDPOINTS.ADMIN_PROFILE),
      getBackendApiUrl(API_ENDPOINTS.ADMIN_DASHBOARD),
      getBackendApiUrl(API_ENDPOINTS.ADMIN_LOGIN),
      getBackendApiUrl('/api/health'), // Health check endpoint if available
    ]
    
    const results = []
    
    for (const url of possibleUrls) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🧪 [Test Backend] Testing URL: ${url}`)
        }
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        results.push({
          url,
          status: response.status,
          ok: response.ok,
          accessible: true
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🧪 [Test Backend] ${url} - Status: ${response.status}, OK: ${response.ok}`)
        }
      } catch (error) {
        results.push({
          url,
          status: 'ERROR',
          ok: false,
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🧪 [Test Backend] ${url} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Backend connectivity test completed',
      results
    })
    
  } catch (error) {
    console.error('❌ [Test Backend] Error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
