// Authentication utilities for JWT token management

const TOKEN_KEY = 'traynex_auth_token'
const USER_KEY = 'traynex_user_data'

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
  message?: string
}

// Token management functions
export const authUtils = {
  // Store token and user data in localStorage
  setAuthData: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  // Get token from localStorage
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  // Get user data from localStorage
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY)
      return userData ? JSON.parse(userData) : null
    }
    return null
  },

  // Clear authentication data
  clearAuthData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = authUtils.getToken()
    return !!token
  },

  // Get authorization header for API requests
  getAuthHeader: (): { Authorization: string } | {} => {
    const token = authUtils.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  // Logout function - calls API and clears local data
  logout: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('🚪 [Auth] Starting logout process...')
      
      // Call logout API
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authUtils.getAuthHeader(),
        },
      })

      console.log('🚪 [Auth] Logout API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [Auth] Logout successful:', data.message)
      } else {
        console.log('⚠️ [Auth] Logout API failed, but clearing local data anyway')
      }
    } catch (error) {
      console.error('❌ [Auth] Logout API error:', error)
      // Continue with local cleanup even if API fails
    } finally {
      // Always clear local authentication data
      authUtils.clearAuthData()
      console.log('🧹 [Auth] Local authentication data cleared')
    }

    return { success: true, message: 'Logged out successfully' }
  }
}

// API request helper with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = authUtils.getToken()
  
  console.log('🔍 [AuthenticatedFetch] Making request to:', url)
  console.log('🔍 [AuthenticatedFetch] Token preview:', token?.substring(0, 20) + '...')
  console.log('🔍 [AuthenticatedFetch] Token length:', token?.length)
  console.log('🔍 [AuthenticatedFetch] Token type:', typeof token)
  
  const headers = {
    'Content-Type': 'application/json',
    ...authUtils.getAuthHeader(),
    ...options.headers,
  }
  
  console.log('🔍 [AuthenticatedFetch] Auth header:', authUtils.getAuthHeader())

  const response = await fetch(url, {
    ...options,
    headers,
  })

  console.log('🔍 [AuthenticatedFetch] Response status:', response.status)
  console.log('🔍 [AuthenticatedFetch] Response ok:', response.ok)

  // Handle session expiration and authentication errors
  if (response.status === 401 || response.status === 403) {
    try {
      // Clone the response to avoid "body stream already read" error
      const responseClone = response.clone()
      const errorData = await responseClone.json()
      const errorMessage = errorData.message || errorData.error || ''
      
      console.log('🔒 [Auth] Authentication error:', response.status)
      console.log('🔒 [Auth] Error message:', errorMessage)
      console.log('🔒 [Auth] Full error data:', errorData)
      
      // Check for specific session expiration messages
      if (isSessionExpiredError(errorMessage) || response.status === 403) {
        handleSessionExpiration(errorMessage)
      }
    } catch (parseError) {
      // If we can't parse the error response, still handle 401/403 as session expired
      console.log('🔒 [Auth] Parse error, clearing auth data and redirecting')
      authUtils.clearAuthData()
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return response
}

// Helper function to check if an error message indicates session expiration
export const isSessionExpiredError = (errorMessage: string): boolean => {
  const message = errorMessage.toLowerCase()
  return (
    message.includes('session expired') ||
    message.includes('login from the other device') ||
    message.includes('login from another device') ||
    message.includes('session expired due to login from another device') ||
    message.includes('token expired') ||
    message.includes('invalid token') ||
    message.includes('unauthorized')
  )
}

// Helper function to handle session expiration
export const handleSessionExpiration = (errorMessage?: string) => {
  console.log('🔒 [Auth] Session expired, redirecting to login:', errorMessage || 'Unknown error')
  authUtils.clearAuthData()
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}
