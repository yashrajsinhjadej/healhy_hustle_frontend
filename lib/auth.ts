// filename: lib/auth.ts
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
        console.warn('⚠ [Auth] Logout API failed, clearing local data anyway.')
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

// Optional: Cache-busting helper
export const withCacheBust = (url: string) => {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}_t=${Date.now()}`
}

// ======= Instrumented authenticatedFetch =======
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = authUtils.getToken()
  const method = (options.method || 'GET').toUpperCase()
  const pathname = typeof window !== 'undefined' ? window.location.pathname : 'server'

  // Clear, single-line summary per request
  console.log(`🌐 [Fetch] ${method} ${url} | route=${pathname} | token=${token ? 'yes' : 'no'}`)

  // Clickable caller stack in DevTools → reveals the component/line initiating the request
  // eslint-disable-next-line no-console
  console.trace('[Fetch] call stack')

  // Merge headers (auth first, then caller-provided headers)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authUtils.getAuthHeader(),
    ...(options.headers || {}),
  }

  // Default to no-store unless explicitly overridden per request
  const cache = options.cache ?? 'no-store'

  // Ensure body is a JSON string if provided
  let body = options.body
  if (body && typeof body !== 'string') {
    try {
      body = JSON.stringify(body)
    } catch (e) {
      console.warn('⚠️ [Fetch] Failed to stringify body, sending raw:', e)
    }
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
    cache,
    body,
  }

  const response = await fetch(url, finalOptions)

  console.log(`🌐 [Fetch] Response ${response.status} for ${method} ${url} | route=${pathname}`)

  // Auth/session error handling
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
