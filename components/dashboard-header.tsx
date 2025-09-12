"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, Search, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { authUtils, type User, authenticatedFetch } from "@/lib/auth"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user data from localStorage first
    const storedUser = authUtils.getUser()
    if (storedUser) {
      setUser(storedUser)
      setIsLoading(false)
    } else {
      // If no stored user, try to fetch from API
      const fetchUserProfile = async () => {
        try {
          const response = await authenticatedFetch('/api/user/profile')
          const data = await response.json()
          
          if (data.success) {
            setUser(data.data)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchUserProfile()
    }
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">
            {isLoading ? "Loading..." : `${getGreeting()}, ${user?.name || 'User'}`}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search" className="pl-10 w-64 bg-background" />
          </div>
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
