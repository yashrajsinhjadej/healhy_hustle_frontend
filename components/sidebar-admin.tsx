"use client"

import { User, Dumbbell, Grid3X3, LogOut, ChevronDown, ChevronUp, Info,FileQuestion, FileText, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { authUtils, User as UserType } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { label: "User management", icon: User, href: "/dashboard" },
  { label: "Training session management", icon: Dumbbell, href: "/Category" },
]

const cmsItems = [
  { label: "About Us", icon: Info, href: "/cms/about" },
  { label: "Faq", icon: FileQuestion, href: "/cms/faq" },
  { label: "Terms & Conditions", icon: FileText, href: "/cms/terms" },
  { label: "Privacy Policy", icon: Shield, href: "/cms/privacy" },
]

export function SidebarAdmin() {
  const router = useRouter()
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<UserType | null>(null)
  const [isCmsOpen, setIsCmsOpen] = useState(false)

  // Check if we're on a CMS route
  const isOnCmsRoute = pathname.startsWith('/cms')
  const isOnMainCmsRoute = pathname === '/cms'

  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedUser = authUtils.getUser()
      if (storedUser) {
        setUserProfile(storedUser)
        return
      }
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data.user)
        }
      } catch {}
    }
    fetchUserProfile()
  }, [])

  // Auto-open CMS dropdown when on CMS routes
  useEffect(() => {
    if (isOnCmsRoute) {
      setIsCmsOpen(true)
    }
  }, [isOnCmsRoute])

  const handleCmsClick = () => {
    if (isOnCmsRoute) {
      // If already on CMS route, just toggle dropdown
      setIsCmsOpen(!isCmsOpen)
    } else {
      // If not on CMS route, navigate to /cms and open dropdown
      setIsCmsOpen(true)
      router.push('/cms')
    }
  }

  const handleLogout = () => {
    authUtils.clearAuthData()
    router.push("/login")
  }

  return (
    <div className="w-60 bg-[#404040] text-white flex flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-4">
        <h1 className="text-xl font-bold text-white">TraynexX</h1>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            // Make 'Training session management' active for all /workouts subroutes
            const isActive = item.href === '/Category'
              ? pathname.startsWith('/Category')
              : pathname === item.href;
            return (
              <div
                key={item.href}
                className={cn(
                  "px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg",
                  isActive
                    ? "bg-[#fc6c6c] text-white"
                    : "text-[#e6e6e6] hover:text-white"
                )}
                onClick={() => router.push(item.href)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") router.push(item.href) }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            )
          })}

          {/* CMS Management Dropdown */}
          <div className="space-y-1">
            <div
              className={cn(
                "px-4 py-2 flex items-center justify-between cursor-pointer transition-colors rounded-lg",
                isOnCmsRoute
                  ? "bg-[#fc6c6c] text-white"
                  : "text-[#e6e6e6] hover:text-white"
              )}
              onClick={handleCmsClick}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleCmsClick() }}
            >
              <div className="flex items-center gap-3">
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">CMS Management</span>
              </div>
              {isCmsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            
            {/* CMS Dropdown Menu */}
            {isCmsOpen && (
              <div className="ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                {cmsItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <div
                      key={item.href}
                      className={cn(
                        "px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg",
                        isActive
                          ? "bg-[#fc6c6c] text-white"
                          : "text-[#b3b3b3] hover:text-white"
                      )}
                      onClick={() => router.push(item.href)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") router.push(item.href) }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* User Profile */}
      <div className="p-4 border-t border-[#5e5e5e] flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback className="bg-[#7b7b7b] text-white">
            {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-white leading-tight">{userProfile?.name || 'User'}</span>
        </div>
      </div>
      {/* Logout */}
      <div className="p-4 pt-2">
        <div
          className="px-4 py-2 flex items-center gap-3 text-[#e6e6e6] hover:text-white cursor-pointer transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  )
}
