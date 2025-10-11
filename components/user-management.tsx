"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Filter } from "lucide-react"
import { SidebarAdmin } from "@/components/sidebar-admin"
import { Navbar } from "@/components/navbar"
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
  success: boolean;
  data?: any;
}

export function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ totalUsers: number; activeUsers: number; completedProfiles: number } | null>(null);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const fetchUsers = async (page: number = 1, search: string = "") => {
    try {
      setIsLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        _t: Date.now().toString(),
      });
      const response = await authenticatedFetch(`/api/users?${params}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (response.status === 401) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || "";
        if (isSessionExpiredError(errorMessage)) {
          handleSessionExpiration(errorMessage);
          return;
        }
      }
      const data: UsersResponse = await response.json();
      if (data.success && data.data) {
        setUsers(data.data.users || []);
        setTotalUsers(data.data.pagination?.totalUsers || 0);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setStats(data.data.stats || null);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      setError("");
      
      const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || '';
        
        if (isSessionExpiredError(errorMessage)) {
          handleSessionExpiration(errorMessage);
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Refresh the user list
      await fetchUsers(currentPage, searchTerm);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleEditUser = (userId: string) => {
    router.push(`/edit-user/${userId}`);
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = authUtils.getUser();
        if (storedUser) {
          setUserProfile(storedUser);
          return;
        }

        const response = await authenticatedFetch("/api/user/profile");
        
        if (response.status === 401) {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || '';
          
          if (isSessionExpiredError(errorMessage)) {
            handleSessionExpiration(errorMessage);
            return;
          }
        }
        
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== "") {
        fetchUsers(1, searchTerm);
        setCurrentPage(1);
      } else {
        fetchUsers(currentPage, "");
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <Navbar 
          userProfile={userProfile ?? undefined} 
          searchTerm={searchTerm} 
          onSearch={e => setSearchTerm(e.target.value)} 
          heading={`Good Morning, ${userProfile?.name || 'Johndeo34253'}`} 
        />
        <div className="p-4">
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
                      <p className="text-xl font-bold text-[#000000]">{stats.totalUsers}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">👥</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-[#e1e1e1]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#7b7b7b]">Active Users</p>
                      <p className="text-xl font-bold text-[#000000]">{stats.activeUsers}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">✅</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-[#e1e1e1]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#7b7b7b]">Completed Profiles</p>
                      <p className="text-xl font-bold text-[#000000]">{stats.completedProfiles}</p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">📋</span>
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
                <p className="text-red-800 font-medium text-sm">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-[#e1e1e1] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f1f2f3] border-b border-[#e1e1e1]">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-[#000000] text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#000000] text-sm">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#000000] text-sm">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#000000] text-sm">Gender</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#000000] text-sm">Age</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#000000] text-sm">Profile</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#000000] text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#000000] text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading users...
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-[#7b7b7b]">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-[#f1f2f3]"}>
                        <td className="py-3 px-4 text-[#000000] font-medium text-sm">{user.name}</td>
                        <td className="py-3 px-4 text-[#7b7b7b] text-sm truncate max-w-[150px]">{user.email}</td>
                        <td className="py-3 px-4 text-[#7b7b7b] text-sm">{user.phone}</td>
                        <td className="py-3 px-4 text-[#7b7b7b] text-sm capitalize">{user.gender}</td>
                        <td className="py-3 px-4 text-[#7b7b7b] text-sm">{user.age}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.profileCompleted 
                                ? "bg-[#15803d] text-white" 
                                : "bg-[#f59e0b] text-white"
                            }`}
                          >
                            {user.profileCompleted ? "Complete" : "Incomplete"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === "Active"
                                ? "bg-[#15803d] text-white" 
                                : "bg-[#ff0000] text-white"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 hover:bg-[#f1f2f3]"
                              onClick={() => handleEditUser(user.id)}
                            >
                              <Edit className="w-3 h-3 text-[#7b7b7b]" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              disabled={deletingUserId === user.id}
                            >
                              {deletingUserId === user.id ? (
                                <Loader2 className="w-3 h-3 text-red-500 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && users.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#e1e1e1] bg-white">
                <div className="text-xs text-[#7b7b7b]">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalUsers)} of{" "}
                  {totalUsers} entries
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="p-1"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-3 h-3 text-[#7b7b7b]" />
                  </Button>
                  
                  {/* Show page numbers with smart pagination */}
                  {(() => {
                    const maxVisiblePages = 5;
                    const pages = [];
                    
                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is small
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Smart pagination for many pages
                      if (currentPage <= 3) {
                        // Show first 4 pages + last page
                        for (let i = 1; i <= 4; i++) {
                          pages.push(i);
                        }
                        if (totalPages > 4) {
                          pages.push('...');
                          pages.push(totalPages);
                        }
                      } else if (currentPage >= totalPages - 2) {
                        // Show first page + last 4 pages
                        pages.push(1);
                        pages.push('...');
                        for (let i = totalPages - 3; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Show first + current range + last
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-[#7b7b7b] text-xs">...</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          className={`w-6 h-6 text-xs ${
                            currentPage === page 
                              ? "bg-[#000000] text-white" 
                              : "text-[#7b7b7b] hover:bg-[#f1f2f3]"
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    ));
                  })()}
                  
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="p-1"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-3 h-3 text-[#7b7b7b]" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}