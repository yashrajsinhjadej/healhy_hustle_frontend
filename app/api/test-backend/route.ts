import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [Test Backend] Testing backend connectivity...')
    
    // Test different possible backend URLs
    const possibleUrls = [
      'http://localhost:3000/api/admin/profile',
      'http://localhost:3001/api/admin/profile',
      'http://localhost:8000/api/admin/profile',
      'http://localhost:5000/api/admin/profile',
    ]
    
    const results = []
    
    for (const url of possibleUrls) {
      try {
        console.log(`🧪 [Test Backend] Testing URL: ${url}`)
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
        
        console.log(`🧪 [Test Backend] ${url} - Status: ${response.status}, OK: ${response.ok}`)
      } catch (error) {
        results.push({
          url,
          status: 'ERROR',
          ok: false,
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        console.log(`🧪 [Test Backend] ${url} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
