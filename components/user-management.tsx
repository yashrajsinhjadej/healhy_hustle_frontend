"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, Filter, User, FileText, X } from "lucide-react"
import { SidebarAdmin } from "@/components/sidebar-admin"
import { Navbar } from "@/components/navbar"
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
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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
          setPagination(data.data.pagination || null);
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
        const response = await authenticatedFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
        if (response.status === 401) {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || "";
          if (
            errorMessage.toLowerCase().includes("session expired") ||
            errorMessage.toLowerCase().includes("login from the other device")
          ) {
            authUtils.clearAuthData();
            router.push("/login");
            return;
          }
        }
        if (response.ok) {
          await fetchUsers(currentPage, searchTerm);
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || errorData.message || "Failed to delete user";
          throw new Error(errorMessage);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to delete user");
      } finally {
        setDeletingUserId(null);
      }
    };

    const handleViewUser = (userId: string) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setSelectedUser(user);
        setIsViewModalOpen(true);
      }
    };

    const handleEditUser = (userId: string) => {
      router.push(`/edit-user/${userId}`);
    };

    useEffect(() => {
      const handleFocus = () => {
        fetchUsers(currentPage, searchTerm);
      };
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }, [currentPage, searchTerm]);

    const handleLogout = async () => {
      try {
        const result = await authUtils.logout();
        if (result.success) {
          router.push("/login");
        } else {
          setError("Logout failed. Please try again.");
        }
      } catch (error) {
        authUtils.clearAuthData();
        router.push("/login");
      }
    };

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
            const errorMessage = errorData.message || errorData.error || "";
            if (
              errorMessage.toLowerCase().includes("session expired") ||
              errorMessage.toLowerCase().includes("login from the other device")
            ) {
              authUtils.clearAuthData();
              router.push("/login");
              return;
            }
          }
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data.user);
          }
        } catch (error) {}
      };
      fetchUserProfile();
    }, []);

    useEffect(() => {
      fetchUsers(currentPage, searchTerm);
    }, []);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchUsers(currentPage, searchTerm);
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [currentPage, searchTerm]);

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
        <Navbar userProfile={userProfile ?? undefined} searchTerm={searchTerm} onSearch={e => setSearchTerm(e.target.value)} heading={`Good Morning, ${userProfile?.name || 'Johndeo34253'}`} />
        <div className="p-4">
          <div>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user.id)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                title="View user details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user.id)}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
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
                  {(() => {
                    const pages = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      if (currentPage <= 3) {
                        for (let i = 1; i <= 4; i++) {
                          pages.push(i);
                        }
                        if (totalPages > 4) {
                          pages.push("...");
                          pages.push(totalPages);
                        }
                      } else if (currentPage >= totalPages - 2) {
                        pages.push(1);
                        pages.push("...");
                        for (let i = totalPages - 3; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        pages.push(1);
                        pages.push("...");
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push("...");
                        pages.push(totalPages);
                      }
                    }
                    return pages.map((page, index) => (
                      <Button
                        key={index}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => typeof page === "number" && setCurrentPage(page)}
                        disabled={page === "..."}
                        className={
                          page === currentPage
                            ? "bg-[#000000] text-white hover:bg-[#212121]"
                            : "border-[#e1e1e1] text-[#7b7b7b]"
                        }
                      >
                        {page}
                      </Button>
                    ));
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
        </div>
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
                      setIsViewModalOpen(false);
                      handleEditUser(selectedUser.id);
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
    </div>
  );
}
// Removed duplicate pagination and modal blocks. Only one valid return and modal exist above.