"use client"

import { User, Dumbbell, Grid3X3, Video, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { authUtils, User as UserType } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { label: "User management", icon: User, href: "/dashboard" },
  { label: "Training session management", icon: Dumbbell, href: "/workouts" },
  { label: "CMS Management", icon: Grid3X3, href: "/cms" },
]

export function SidebarAdmin() {
  const router = useRouter()
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<UserType | null>(null)

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
            const isActive = pathname === item.href
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
