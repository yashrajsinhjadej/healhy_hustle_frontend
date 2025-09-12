"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Download, 
  Search, 
  MoreHorizontal, 
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
  ChevronUp
} from "lucide-react"
import { authenticatedFetch, authUtils, User as UserType, isSessionExpiredError, handleSessionExpiration } from "@/lib/auth"
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
    totalUsers: number
    currentPage: number
    totalPages: number
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
  const [isCmsDropdownOpen, setIsCmsDropdownOpen] = useState(false)
  const [activeCmsPage, setActiveCmsPage] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'user-management' | 'cms-management'>('user-management')
  const itemsPerPage = 10

  const fetchUsers = async (page: number = 1, search: string = "") => {
    try {
      setIsLoading(true)
      setError("")
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search })
      })

      const response = await authenticatedFetch(`/api/users?${params}`)
      
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
        setTotalUsers(data.data.totalUsers || 0)
        setTotalPages(data.data.totalPages || 1)
        setStats(data.data.stats || null)
        console.log('✅ [UserManagement] Data updated successfully')
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
        throw new Error(errorData.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('❌ [UserManagement] Error deleting user:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleEditUser = (userId: string) => {
    router.push(`/edit-user/${userId}`)
  }

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

  useEffect(() => {
    fetchUsers(currentPage, searchTerm)
  }, [currentPage])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== "") {
        fetchUsers(1, searchTerm)
        setCurrentPage(1)
      } else {
        fetchUsers(currentPage, "")
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const startIndex = (currentPage - 1) * itemsPerPage

  // Debug logging
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

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      {/* Sidebar */}
      <div className="w-60 bg-[#404040] text-white flex flex-col h-screen">
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
              onClick={() => setActiveSection('user-management')}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">User management</span>
            </div>

            <div className="px-4 py-2 flex items-center gap-3 text-[#e6e6e6] hover:text-white cursor-pointer">
              <Dumbbell className="w-5 h-5" />
              <span>Training session management</span>
            </div>

            {/* CMS Management Dropdown */}
            <div className="space-y-1">
              <div 
                className={`px-4 py-2 flex items-center justify-between cursor-pointer transition-colors rounded-lg ${
                  activeSection === 'cms-management' || activeCmsPage
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
          {activeSection === 'cms-management' ? (
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
                    <label className="block text-sm font-medium text-[#000000] mb-2">
                      Description:
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 min-h-[400px] bg-white">
                      <div className="text-gray-500 text-center py-20">
                        Rich text editor will be implemented here
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button className="bg-gray-800 text-white hover:bg-gray-900">
                        Save
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
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                    className="text-red-600"
                                    disabled={deletingUserId === user.id}
                                  >
                                    {deletingUserId === user.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                      disabled={currentPage === 1}
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
                      disabled={currentPage === totalPages}
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
    </div>
  )
}