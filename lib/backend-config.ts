/**
 * Backend Configuration Utility
 * 
 * This utility provides a centralized way to manage backend API URLs
 * and construct full endpoint URLs for API calls.
 */

import AdminResetPasswordPage from "@/app/admin/reset-password/page"

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
  ADMIN_EXPORT_CSV:'/api/admin/dashboard/export',
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_BY_ID: (userId: string) => `/api/admin/users/${userId}`,
  
  // User Profile
  ADMIN_PROFILE: '/api/admin/profile',

  //Category 
  ADMIN_CATEGORY_LIST: '/api/workout/admin/category/list',
  ADMIN_CATEGORY_CREATE: '/api/workout/admin/category/create',
  ADMIN_CATEGORY_UPDATE: (userID: string) => `/api/workout/admin/category/update/${userID}`,
  ADMIN_CATEGORY_DELETE: (userID: string) => `/api/workout/admin/category/delete/${userID}`,
  ADMIN_CATEGORY_DETAILS: (userID: string) => `/api/workout/admin/category/list/${userID}`,

  //workouts
  ADMIN_WORKOUTS_LIST: '/api/workout/user/listworkout',
  ADMIN_WORKOUT_BY_CATEGORY: '/api/workout/user/getcategory',
  ADMIN_CREATE_WORKOUT:'/api/workout/admin/create',
  ADMIN_DELETE_WORKOUT:'/api/workout/admin/delete',
  ADMIN_UPDATE_WORKOUT_SEQUENCE:'/api/workout/admin/updatesequence',
  ADMIN_UPDATE_WORKOUT: (userId:string) => `/api/workout/admin/update/${userId}`,
  ADMIN_GET_WORKOUT_BY_ID: (userId:string) => `/api/workout/admin/getworkoutbyid/${userId}`,
  

  //videos 


  ADMIN_VIDEO_CREATE : '/api/workout/admin/videos/create',
  ADMIN_VIDEO_DELETE : `/api/workout/admin/videos/delete`,
  ADMIN_VIDEO_UPDATE :  `/api/workout/admin/videos/update`,


  // CMS 

  ADMIN_CMS :(userId:string) => `/api/cms/admin/${userId}`,
  ADMIN_CREATE_CMS : `/api/cms/admin/create`,



} as const

export default {
  getBackendApiUrl,
  getBackendBaseUrl,
  isBackendConfigured,
  API_ENDPOINTS
}