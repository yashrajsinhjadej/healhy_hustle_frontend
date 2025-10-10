/**
 * Backend Configuration Utility
 * 
 * This utility provides a centralized way to manage backend API URLs
 * and construct full endpoint URLs for API calls.
 */

// Get the backend URL from environment variables
const getBackendUrl = (): string => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  
  if (!backendUrl) {
    console.error('❌ [Backend Config] NEXT_PUBLIC_BACKEND_URL is not defined in environment variables')
    throw new Error('Backend URL is not configured. Please check your .env.local file.')
  }
  
  // Remove trailing slash if present
  return backendUrl.replace(/\/$/, '')
}

/**
 * Construct a full backend API URL
 * @param endpoint - The API endpoint (e.g., '/api/admin/login')
 * @returns Full URL to the backend API endpoint
 */
export const getBackendApiUrl = (endpoint: string): string => {
  const baseUrl = getBackendUrl()
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  const fullUrl = `${baseUrl}${normalizedEndpoint}`
  
  console.log('🔗 [Backend Config] Constructed URL:', fullUrl)
  return fullUrl
}

/**
 * Get just the backend base URL
 * @returns Backend base URL
 */
export const getBackendBaseUrl = (): string => {
  return getBackendUrl()
}

/**
 * Check if backend URL is configured
 * @returns boolean indicating if backend URL is available
 */
export const isBackendConfigured = (): boolean => {
  try {
    getBackendUrl()
    return true
  } catch {
    return false
  }
}

// Pre-defined API endpoints for easy reference
export const API_ENDPOINTS = {
  // Admin Authentication
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_LOGOUT: '/api/admin/logout',
  ADMIN_FORGOT_PASSWORD: '/api/admin/forgot-password',
  ADMIN_RESET_PASSWORD: '/api/admin/reset-password',
  
  // Admin Dashboard & Users
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_BY_ID: (userId: string) => `/api/admin/users/${userId}`,
  
  // User Profile
  ADMIN_PROFILE: '/api/admin/profile',

  ADMIN_WORKOUTS_LIST: '/api/workout/user/listworkout',


} as const

export default {
  getBackendApiUrl,
  getBackendBaseUrl,
  isBackendConfigured,
  API_ENDPOINTS
}