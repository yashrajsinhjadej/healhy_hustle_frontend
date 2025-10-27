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
  token?: string
  user?: User
  message?: string
  error?: string
}

export const authUtils = {
  // Store token and user data
  setAuthData: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') return localStorage.getItem(TOKEN_KEY)
    return null
  },

  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(USER_KEY)
      return data ? JSON.parse(data) : null
    }
    return null
  },

  clearAuthData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getToken()
  },

  getAuthHeader: (): Record<string, string> => {
    const token = authUtils.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  logout: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('🚪 [Auth] Logging out...')

      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authUtils.getAuthHeader(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [Auth] Logout successful:', data.message)
      } else {
        console.warn('⚠️ [Auth] Logout API failed, clearing local data anyway.')
      }
    } catch (error) {
      console.error('❌ [Auth] Logout API error:', error)
    } finally {
      authUtils.clearAuthData()
      console.log('🧹 [Auth] Local data cleared')
    }

    return { success: true, message: 'Logged out successfully' }
  },
}

// =========================
// Authenticated Fetch Helper
// =========================

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = authUtils.getToken()

  console.log('🌐 [Fetch] Request:', url)
  console.log('🌐 [Fetch] Token exists:', !!token)

  const headers = {
    'Content-Type': 'application/json',
    ...authUtils.getAuthHeader(),
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  console.log(`🌐 [Fetch] Response status: ${response.status}`)

  // 🔐 Handle auth/session errors
  if (response.status === 401 || response.status === 403) {
    let errorMessage = ''

    try {
      const clone = response.clone()
      const data = await clone.json()
      errorMessage = data?.message || data?.error || ''
      console.warn('🚨 [Fetch] Auth error:', errorMessage)

      if (isSessionExpiredError(errorMessage)) {
        handleSessionExpiration(errorMessage)
        return response // prevent further handling after redirect
      }
    } catch (err) {
      console.warn('⚠️ [Fetch] Could not parse error response; assuming expired token')
      handleSessionExpiration()
      return response
    }
  }

  return response
}

// =========================
// Helper Functions
// =========================

export const isSessionExpiredError = (message: string = ''): boolean => {
  const msg = message.toLowerCase()
  return (
    msg.includes('session expired') ||
    msg.includes('token expired') ||
    msg.includes('invalid token') ||
    msg.includes('unauthorized') ||
    msg.includes('jwt expired') ||
    msg.includes('authentication failed') ||
    msg.includes('login from another device')
  )
}

export const handleSessionExpiration = (reason?: string) => {
  console.warn('🔒 [Auth] Session expired. Redirecting to login...', reason || 'unknown reason')
  authUtils.clearAuthData()

  if (typeof window !== 'undefined') {
    // Redirect only once per session expiration
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
}
