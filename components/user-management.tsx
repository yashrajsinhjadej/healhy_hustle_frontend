"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Download, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Filter,
  User,
  Dumbbell,
  Grid3X3,
  Info,
  Phone,
  FileText,
  Shield,
  LogOut,
  ChevronDown,
  ChevronUp,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Video,
  Table as TableIcon,
  Quote,
  Undo,
  Redo,
  Save,
  Type,
  Palette,
  Minus,
  Plus
} from "lucide-react"
import { authenticatedFetch, authUtils, User as UserType, isSessionExpiredError, handleSessionExpiration } from "@/lib/auth"
import WorkoutsList from './workouts-list'
// Keep the modal component file in the repo, but the header now navigates to the full-page form
import { devLog } from '@/lib/dev-log'
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  phone: string
  gender: string
  age: number | string
  profileCompleted: boolean
  status: string
  signupDate: string
  lastLogin: string
}

interface UsersResponse {
  success: boolean
  data: {
    users: User[]
    pagination: {
      currentPage: number
      totalPages: number
      totalUsers: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
    stats: {
      totalUsers: number
      activeUsers: number
      completedProfiles: number
    }
  }
}

export function UserManagement() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<{totalUsers: number, activeUsers: number, completedProfiles: number} | null>(null)
  const [userProfile, setUserProfile] = useState<UserType | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    currentPage: number
    totalPages: number
    totalUsers: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null>(null)
  const [isCmsDropdownOpen, setIsCmsDropdownOpen] = useState(false)
  const [activeCmsPage, setActiveCmsPage] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'user-management' | 'cms-management' | 'training'>('user-management')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [cmsContent, setCmsContent] = useState('')
  const [isCmsLoading, setIsCmsLoading] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const itemsPerPage = 10

  const fetchUsers = async (page: number = 1, search: string = "") => {
    try {
      setIsLoading(true)
      setError("")
      
      devLog.log('🔄 [UserManagement] Fetching users - Page:', page, 'Search:', search)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        _t: Date.now().toString() // Cache busting parameter
      })

      devLog.log('🌐 [UserManagement] Making API call to:', `/api/users?${params}`)
      const response = await authenticatedFetch(`/api/users?${params}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      // Check if response indicates session expiration
      if (response.status === 401) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || ''
        
        if (isSessionExpiredError(errorMessage)) {
          console.log('🔒 [UserManagement] Session expired, redirecting to login')
          handleSessionExpiration(errorMessage)
          return
        }
      }
      
      const data: UsersResponse = await response.json()

      console.log('🔍 [UserManagement] API Response:', data)
      console.log('🔍 [UserManagement] Users received:', data.data?.users?.length || 0)
      console.log('🔍 [UserManagement] First user:', data.data?.users?.[0] || 'No users')

      if (data.success && data.data) {
        setUsers(data.data.users || [])
        setTotalUsers(data.data.pagination?.totalUsers || 0)
        setTotalPages(data.data.pagination?.totalPages || 1)
        setStats(data.data.stats || null)
        setPagination(data.data.pagination || null)
        console.log('✅ [UserManagement] Data updated successfully')
        console.log('📊 [UserManagement] Pagination:', data.data.pagination)
      } else {
        console.error('❌ [UserManagement] API returned unsuccessful response:', data)
        setError("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingUserId(userId)
      setError("")
      
      console.log('🗑️ [UserManagement] Deleting user:', userId)
      
      const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      // Check if response indicates session expiration
      if (response.status === 401) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || ''
        
        if (errorMessage.toLowerCase().includes('session expired') ||
            errorMessage.toLowerCase().includes('login from the other device')) {
          console.log('🔒 [UserManagement] Session expired during delete, redirecting to login')
          authUtils.clearAuthData()
          router.push('/login')
          return
        }
      }

      if (response.ok) {
        console.log('✅ [UserManagement] User deleted successfully')
        // Refresh the users list
        await fetchUsers(currentPage, searchTerm)
      } else {
        const errorData = await response.json()
        console.log('❌ [UserManagement] Delete failed:', errorData)
        console.log('❌ [UserManagement] Response status:', response.status)
        
        // Display the specific error message from backend
        const errorMessage = errorData.error || errorData.message || 'Failed to delete user'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ [UserManagement] Error deleting user:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setIsViewModalOpen(true)
    }
  }

  // Rich text editor functions
  const executeCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      
      // Try modern approach first
      if (document.queryCommandSupported && document.queryCommandSupported(command)) {
        const success = document.execCommand(command, false, value)
        console.log(`Command ${command} executed:`, success)
      } else {
        // Fallback for unsupported commands
        console.log(`Command ${command} not supported`)
      }
      
      // Update content state
      setCmsContent(editorRef.current.innerHTML)
    }
  }

  const insertContent = (content: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      
      // Use modern approach
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        const fragment = document.createDocumentFragment()
        
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild)
        }
        
        range.insertNode(fragment)
        selection.removeAllRanges()
      } else {
        // Fallback to execCommand
        document.execCommand('insertHTML', false, content)
      }
      
      console.log('Content inserted')
      // Update content state
      setCmsContent(editorRef.current.innerHTML)
    }
  }

  const handleCmsSave = async () => {
    setIsCmsLoading(true)
    try {
      // Here you would typically save to your backend
      console.log('Saving CMS content:', cmsContent)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setIsCmsLoading(false)
    }
  }

  const handleCmsCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      setCmsContent('')
    }
  }

  const handleEditUser = (userId: string) => {
    router.push(`/edit-user/${userId}`)
  }

  // Refresh users list when returning from edit page
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 [UserManagement] Window focused, refreshing users list')
      fetchUsers(currentPage, searchTerm)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [currentPage, searchTerm])

  const handleLogout = async () => {
    try {
      console.log('🚪 [UserManagement] Starting logout process...')
      
      // Call the logout function from authUtils
      const result = await authUtils.logout()
      
      if (result.success) {
        console.log('✅ [UserManagement] Logout successful, redirecting to login')
        // Redirect to login page
        router.push('/login')
      } else {
        console.error('❌ [UserManagement] Logout failed:', result.message)
        setError('Logout failed. Please try again.')
      }
    } catch (error) {
      console.error('❌ [UserManagement] Logout error:', error)
      // Even if logout fails, clear local data and redirect
      authUtils.clearAuthData()
      router.push('/login')
    }
  }

  const toggleCmsDropdown = () => {
    setIsCmsDropdownOpen(!isCmsDropdownOpen)
    // If opening dropdown and no page is selected, set About Us as default
    if (!isCmsDropdownOpen && !activeCmsPage) {
      setActiveCmsPage('about-us')
    }
    // Set CMS management as active section when dropdown is opened
    if (!isCmsDropdownOpen) {
      setActiveSection('cms-management')
    }
  }

  const handleCmsNavigation = (page: string) => {
    console.log(`📄 [UserManagement] Navigating to ${page}`)
    setActiveCmsPage(page)
    setActiveSection('cms-management') // Ensure CMS section stays active
    // For now, just log the navigation. We'll implement the actual pages later
    // router.push(`/cms/${page}`)
  }

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // First try to get from localStorage
        const storedUser = authUtils.getUser()
        if (storedUser) {
          setUserProfile(storedUser)
          return
        }

        // If not in localStorage, fetch from API
        const response = await authenticatedFetch("/api/user/profile")
        
        // Check if response indicates session expiration
        if (response.status === 401) {
          const errorData = await response.json()
          const errorMessage = errorData.message || errorData.error || ''
          
          if (errorMessage.toLowerCase().includes('session expired') || 
              errorMessage.toLowerCase().includes('login from the other device')) {
            console.log('🔒 [UserManagement] Session expired during profile fetch, redirecting to login')
            authUtils.clearAuthData()
            router.push('/login')
            return
          }
        }
        
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data.user)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [])

  // Fetch users on component mount and when returning from other pages
  useEffect(() => {
    console.log('🚀 [UserManagement] Component mounted - fetching initial data')
    fetchUsers(currentPage, searchTerm)
  }, []) // Empty dependency array means this runs only on mount

  // Additional effect to refresh data when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 [UserManagement] Page became visible, refreshing users list')
        fetchUsers(currentPage, searchTerm)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [currentPage, searchTerm])

  useEffect(() => {
    console.log('📄 [UserManagement] Page changed to:', currentPage)
    fetchUsers(currentPage, searchTerm)
  }, [currentPage])

  useEffect(() => {
    console.log('🔍 [UserManagement] Search term changed to:', searchTerm)
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== "") {
        console.log('🔍 [UserManagement] Searching with term:', searchTerm)
        fetchUsers(1, searchTerm)
        setCurrentPage(1)
      } else {
        console.log('🔍 [UserManagement] Search cleared, fetching all users')
        fetchUsers(currentPage, "")
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const startIndex = (currentPage - 1) * itemsPerPage

  // Debug logging - only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [UserManagement] Current state:', {
      users: users.length,
      isLoading,
      error,
      searchTerm,
      currentPage,
      totalPages,
      totalUsers,
      stats,
      itemsPerPage
    })
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      {/* Sidebar */}
      <div className="w-60 bg-[#404040] text-white flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-4">
          <h1 className="text-xl font-bold text-white">TraynexX</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-1">
            <div 
              className={`px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg ${
                activeSection === 'user-management'
                  ? 'bg-[#fc6c6c] text-white'
                  : 'text-[#e6e6e6] hover:text-white'
              }`}
              onClick={() => {
                setActiveSection('user-management')
                setIsCmsDropdownOpen(false)
                setActiveCmsPage(null)
              }}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">User management</span>
            </div>

            <div
              className={`px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg ${
                activeSection === 'training'
                  ? 'bg-[#fc6c6c] text-white'
                  : 'text-[#e6e6e6] hover:text-white'
              }`}
              onClick={() => {
                // Open Training inline inside the dashboard (do not navigate away)
                setActiveSection('training')
                setIsCmsDropdownOpen(false)
                setActiveCmsPage(null)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveSection('training') } }}
            >
              <Dumbbell className="w-5 h-5" />
              <span>Training session management</span>
            </div>

            {/* CMS Management Dropdown */}
            <div className="space-y-1">
              <div 
                className={`px-4 py-2 flex items-center justify-between cursor-pointer transition-colors rounded-lg ${
                  activeSection === 'cms-management'
                    ? 'bg-[#fc6c6c] text-white' 
                    : 'text-[#e6e6e6] hover:text-white'
                }`}
                onClick={toggleCmsDropdown}
              >
                <div className="flex items-center gap-3">
                  <Grid3X3 className="w-5 h-5" />
                  <span className="font-medium">CMS Management</span>
                </div>
                {isCmsDropdownOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              
              {/* Dropdown Menu */}
              {isCmsDropdownOpen && (
                <div className="ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <div 
                    className={`px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg ${
                      activeCmsPage === 'about-us'
                        ? 'bg-[#fc6c6c] text-white'
                        : 'text-[#b3b3b3] hover:text-white'
                    }`}
                    onClick={() => handleCmsNavigation('about-us')}
                  >
                    <Info className="w-4 h-4" />
                    <span>About Us</span>
                  </div>
                  
                  <div 
                    className={`px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg ${
                      activeCmsPage === 'contact-us'
                        ? 'bg-[#fc6c6c] text-white'
                        : 'text-[#b3b3b3] hover:text-white'
                    }`}
                    onClick={() => handleCmsNavigation('contact-us')}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contact Us</span>
                  </div>
                  
                  <div 
                    className={`px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg ${
                      activeCmsPage === 'terms-conditions'
                        ? 'bg-[#fc6c6c] text-white'
                        : 'text-[#b3b3b3] hover:text-white'
                    }`}
                    onClick={() => handleCmsNavigation('terms-conditions')}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Terms & Conditions</span>
                  </div>
                  
                  <div 
                    className={`px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg ${
                      activeCmsPage === 'privacy-policy'
                        ? 'bg-[#fc6c6c] text-white'
                        : 'text-[#b3b3b3] hover:text-white'
                    }`}
                    onClick={() => handleCmsNavigation('privacy-policy')}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Privacy Policy</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#5e5e5e]">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/diverse-user-avatars.png" />
              <AvatarFallback className="bg-[#7b7b7b] text-white">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'JD'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-white">
                {userProfile?.name || 'johndeo34253'}
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-[#5e5e5e]">
          <div 
            className="px-4 py-2 flex items-center gap-3 text-[#e6e6e6] hover:text-white cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-[#e1e1e1]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#000000]">
              {activeSection === 'cms-management' 
                ? `CMS Management (${activeCmsPage === 'about-us' ? 'About us' : activeCmsPage === 'contact-us' ? 'Contact us' : activeCmsPage === 'terms-conditions' ? 'Terms & Conditions' : activeCmsPage === 'privacy-policy' ? 'Privacy Policy' : 'CMS Management'})`
                : `Good Morning, ${userProfile?.name || 'Johndeo34253'}`
              }
            </h2>
              <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7b7b7b] w-4 h-4" />
                <Input 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-[#f1f2f3] border-[#e1e1e1] text-[#000000]" 
                />
              </div>
              <Avatar className="w-10 h-10">
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback className="bg-[#7b7b7b] text-white">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'JD'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4">
          {activeSection === 'training' ? (
            /* Training (Workouts) Content */
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-[#000000]">Training session management</h1>
                <div className="flex items-center gap-2">
                  <Button asChild className="ml-4 bg-[#000000] text-white hover:bg-[#212121]">
                    <a href="/workouts/create">Create workoutsession</a>
                  </Button>
                </div>
              </div>
              <WorkoutsList />
            </div>
          ) : activeSection === 'cms-management' ? (
            /* CMS Content */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-blue-200 rounded-lg p-6">
                <h1 className="text-2xl font-semibold text-[#000000] mb-6">
                  {activeCmsPage === 'about-us' ? 'About us' : 
                   activeCmsPage === 'contact-us' ? 'Contact Us' :
                   activeCmsPage === 'terms-conditions' ? 'Terms & Conditions' :
                   activeCmsPage === 'privacy-policy' ? 'Privacy Policy' : 'CMS Management'}
                </h1>
                
                {activeCmsPage === 'about-us' && (
                  <div>
                    {/* Toolbar */}
                    <div className="border rounded-lg p-3 bg-gray-50 mb-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        {/* Font Controls */}
                        <div className="flex items-center gap-1 border-r pr-2">
                          <select 
                            className="px-2 py-1 text-sm border rounded"
                            onChange={(e) => {
                              e.preventDefault()
                              executeCommand('fontName', e.target.value)
                            }}
                            onClick={(e) => e.preventDefault()}
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                          </select>
                          
                          <select 
                            className="px-2 py-1 text-sm border rounded"
                            onChange={(e) => {
                              e.preventDefault()
                              executeCommand('formatBlock', e.target.value)
                            }}
                            onClick={(e) => e.preventDefault()}
                          >
                            <option value="div">Normal Text</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                            <option value="h4">Heading 4</option>
                            <option value="h5">Heading 5</option>
                            <option value="h6">Heading 6</option>
                          </select>
                        </div>

                        {/* Font Size Controls */}
                        <div className="flex items-center gap-1 border-r pr-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('fontSize', '3')
                            }}
                            title="Decrease font size"
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-2 py-1 text-sm border rounded bg-white">12</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('fontSize', '5')
                            }}
                            title="Increase font size"
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('foreColor', '#000000')
                            }}
                            title="Text color"
                            className="h-8 w-8 p-0"
                          >
                            <Palette className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Text Alignment */}
                        <div className="flex items-center gap-1 border-r pr-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('justifyLeft')
                            }}
                            title="Align left"
                            className="h-8 w-8 p-0"
                          >
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('justifyCenter')
                            }}
                            title="Align center"
                            className="h-8 w-8 p-0"
                          >
                            <AlignCenter className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('justifyRight')
                            }}
                            title="Align right"
                            className="h-8 w-8 p-0"
                          >
                            <AlignRight className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('justifyFull')
                            }}
                            title="Justify"
                            className="h-8 w-8 p-0"
                          >
                            <AlignJustify className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Text Formatting */}
                        <div className="flex items-center gap-1 border-r pr-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('bold')
                            }}
                            title="Bold"
                            className="h-8 w-8 p-0"
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('italic')
                            }}
                            title="Italic"
                            className="h-8 w-8 p-0"
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('underline')
                            }}
                            title="Underline"
                            className="h-8 w-8 p-0"
                          >
                            <Underline className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              executeCommand('strikeThrough')
                            }}
                            title="Strikethrough"
                            className="h-8 w-8 p-0"
                          >
                            <Strikethrough className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Lists */}
                        <div className="flex items-center gap-1 border-r pr-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeCommand('insertUnorderedList')}
                            title="Bullet list"
                            className="h-8 w-8 p-0"
                          >
                            <List className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeCommand('insertOrderedList')}
                            title="Numbered list"
                            className="h-8 w-8 p-0"
                          >
                            <ListOrdered className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Insert Options */}
                        <div className="flex items-center gap-1 border-r pr-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt('Enter URL:')
                              if (url) executeCommand('createLink', url)
                            }}
                            title="Insert link"
                            className="h-8 w-8 p-0"
                          >
                            <Link className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt('Enter image URL:')
                              if (url) insertContent(`<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />`)
                            }}
                            title="Insert image"
                            className="h-8 w-8 p-0"
                          >
                            <Image className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt('Enter video URL:')
                              if (url) insertContent(`<iframe src="${url}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`)
                            }}
                            title="Insert video"
                            className="h-8 w-8 p-0"
                          >
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertContent('<table border="1" style="border-collapse: collapse;"><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>')}
                            title="Insert table"
                            className="h-8 w-8 p-0"
                          >
                            <TableIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertContent('<blockquote style="border-left: 4px solid #ccc; margin: 0; padding-left: 16px; font-style: italic;">Quote text here</blockquote>')}
                            title="Insert quote"
                            className="h-8 w-8 p-0"
                          >
                            <Quote className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Undo/Redo */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeCommand('undo')}
                            title="Undo"
                            className="h-8 w-8 p-0"
                          >
                            <Undo className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeCommand('redo')}
                            title="Redo"
                            className="h-8 w-8 p-0"
                          >
                            <Redo className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Editor */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#000000] mb-2">
                        Description:
                      </label>
                      <div
                        ref={editorRef}
                        contentEditable
                        className="min-h-[400px] p-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          fontFamily: 'Arial, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}
                        onInput={(e) => setCmsContent(e.currentTarget.innerHTML)}
                        suppressContentEditableWarning={true}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                      <Button 
                        variant="outline" 
                        className="border-gray-300 text-gray-700 flex items-center gap-2"
                        onClick={handleCmsCancel}
                        disabled={isCmsLoading}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button 
                        className="bg-gray-800 text-white hover:bg-gray-900 flex items-center gap-2"
                        onClick={handleCmsSave}
                        disabled={isCmsLoading}
                      >
                        {isCmsLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeCmsPage === 'contact-us' && (
                  <div>
                    <div className="text-gray-500 text-center py-20">
                      Contact Us content will be implemented here
                    </div>
                  </div>
                )}
                
                {activeCmsPage === 'terms-conditions' && (
                  <div>
                    <div className="text-gray-500 text-center py-20">
                      Terms & Conditions content will be implemented here
                    </div>
                  </div>
                )}
                
                {activeCmsPage === 'privacy-policy' && (
                  <div>
                    <div className="text-gray-500 text-center py-20">
                      Privacy Policy content will be implemented here
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* User Management Content */
            <div>
              {/* Page Header */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-[#000000]">User management</h1>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-[#e1e1e1] text-[#7b7b7b] bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="bg-[#000000] text-white hover:bg-[#212121]">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Card className="bg-white border-[#e1e1e1]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-[#7b7b7b]">Total Users</p>
                          <p className="text-2xl font-bold text-[#000000]">{stats.totalUsers}</p>
                        </div>
                        <div className="w-8 h-8 bg-[#e1e1e1] rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-[#7b7b7b]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-[#e1e1e1]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-[#7b7b7b]">Active Users</p>
                          <p className="text-2xl font-bold text-[#000000]">{stats.activeUsers}</p>
                        </div>
                        <div className="w-8 h-8 bg-[#e1e1e1] rounded-full flex items-center justify-center">
                          <Eye className="w-4 h-4 text-[#7b7b7b]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-[#e1e1e1]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-[#7b7b7b]">Completed Profiles</p>
                          <p className="text-2xl font-bold text-[#000000]">{stats.completedProfiles}</p>
                        </div>
                        <div className="w-8 h-8 bg-[#e1e1e1] rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[#7b7b7b]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="font-medium text-red-700">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <Card className="bg-white border-[#e1e1e1]">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-[#7b7b7b]" />
                      <span className="ml-2 text-[#7b7b7b]">Loading users...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[#7b7b7b]">No users found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#e1e1e1]">
                          <TableHead className="text-[#7b7b7b] font-medium">User</TableHead>
                          <TableHead className="text-[#7b7b7b] font-medium">Contact</TableHead>
                          <TableHead className="text-[#7b7b7b] font-medium">Profile</TableHead>
                          <TableHead className="text-[#7b7b7b] font-medium">Status</TableHead>
                          <TableHead className="text-[#7b7b7b] font-medium">Last Login</TableHead>
                          <TableHead className="text-[#7b7b7b] font-medium">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-[#e1e1e1]">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src="/placeholder-user.jpg" />
                                  <AvatarFallback className="bg-[#e1e1e1] text-[#7b7b7b] text-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-[#000000]">{user.name}</p>
                                  <p className="text-xs text-[#7b7b7b]">ID: {user.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm text-[#000000]">{user.email}</p>
                                <p className="text-xs text-[#7b7b7b]">{user.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={user.profileCompleted ? "default" : "secondary"}
                                  className={user.profileCompleted ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                >
                                  {user.profileCompleted ? "Completed" : "Incomplete"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={user.status === "Active" ? "default" : "secondary"}
                                  className={user.status === "Active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}
                                >
                                  {user.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-[#000000]">
                                {new Date(user.lastLogin).toLocaleDateString()}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {/* View Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewUser(user.id)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  title="View user details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {/* Edit Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user.id)}
                                  className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                  title="Edit user"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                {/* Delete Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  disabled={deletingUserId === user.id}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  title="Delete user"
                                >
                                  {deletingUserId === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-[#7b7b7b]">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination?.hasPrevPage}
                      className="border-[#e1e1e1] text-[#7b7b7b]"
                    >
                      <ChevronLeft className="w-3 h-3 text-[#7b7b7b]" />
                    </Button>
                    
                    {/* Smart pagination */}
                    {(() => {
                      const pages = []
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        // Smart pagination for many pages
                        if (currentPage <= 3) {
                          // Show first 4 pages + last page
                          for (let i = 1; i <= 4; i++) {
                            pages.push(i)
                          }
                          if (totalPages > 4) {
                            pages.push('...')
                            pages.push(totalPages)
                          }
                        } else if (currentPage >= totalPages - 2) {
                          // Show first page + last 4 pages
                          pages.push(1)
                          pages.push('...')
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          // Show first page + current page range + last page
                          pages.push(1)
                          pages.push('...')
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(i)
                          }
                          pages.push('...')
                          pages.push(totalPages)
                        }
                      }

                      return pages.map((page, index) => (
                        <Button
                          key={index}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          disabled={page === '...'}
                          className={
                            page === currentPage
                              ? "bg-[#000000] text-white hover:bg-[#212121]"
                              : "border-[#e1e1e1] text-[#7b7b7b]"
                          }
                        >
                          {page}
                        </Button>
                      ))
                    })()}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination?.hasNextPage}
                      className="border-[#e1e1e1] text-[#7b7b7b]"
                    >
                      <ChevronRight className="w-3 h-3 text-[#7b7b7b]" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-[#7b7b7b] text-white text-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">ID: {selectedUser.id}</p>
                  <Badge 
                    variant={selectedUser.status === "Active" ? "default" : "secondary"}
                    className={selectedUser.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900">{selectedUser.email || "Not provided"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Phone:</span>
                  <span className="text-sm text-gray-900">{selectedUser.phone || "Not provided"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Gender:</span>
                  <span className="text-sm text-gray-900">{selectedUser.gender || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Age:</span>
                  <span className="text-sm text-gray-900">{selectedUser.age || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Profile Completed:</span>
                  <Badge 
                    variant={selectedUser.profileCompleted ? "default" : "secondary"}
                    className={selectedUser.profileCompleted ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                  >
                    {selectedUser.profileCompleted ? "Completed" : "Incomplete"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Signup Date:</span>
                  <span className="text-sm text-gray-900">{new Date(selectedUser.signupDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">Last Login:</span>
                  <span className="text-sm text-gray-900">{new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewModalOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEditUser(selectedUser.id)
                  }}
                  className="bg-[#000000] text-white hover:bg-[#212121]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}