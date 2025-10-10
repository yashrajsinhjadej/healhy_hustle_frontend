"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Users,
  GraduationCap,    
  Settings,
  FileText,
  Phone,
  Shield,
  Eye,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { authUtils, type User } from "@/lib/auth"
import { useState as useStateReact, useEffect } from "react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const [cmsExpanded, setCmsExpanded] = useState(false)
  const [user, setUser] = useStateReact<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = authUtils.getUser()
    setUser(storedUser)
  }, [])

  const handleLogout = () => {
    authUtils.clearAuthData()
    router.push('/login')
  }

  const pathname = usePathname();
  const menuItems = [
    {
      title: "User management",
      icon: Users,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      title: "Training session management",
      icon: GraduationCap,
      href: "/workouts",
      active: pathname === "/workouts",
    },
  ];

  const cmsItems = [
    { title: "About Us", icon: FileText, href: "/dashboard/cms/about" },
    { title: "Contact us", icon: Phone, href: "/dashboard/cms/contact" },
    { title: "Term & Conditions", icon: Shield, href: "/dashboard/cms/terms" },
    { title: "Privacy Policy", icon: Eye, href: "/dashboard/cms/privacy" },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => onOpenChange(false)} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div>
              <h1 className="text-xl font-bold text-sidebar-primary">TrayneX</h1>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    item.active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )}
                  style={item.active ? { background: '#ff5a5f', color: '#fff' } : {}}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}

            {/* CMS Management with submenu */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent/50 h-11"
                onClick={() => setCmsExpanded(!cmsExpanded)}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  CMS Management
                </div>
                {cmsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>

              {cmsExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {cmsItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-9 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
                      >
                        <item.icon className="h-3 w-3" />
                        {item.title}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-sidebar-accent/20">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="text-xs font-medium text-sidebar-primary-foreground">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  ID: {user?.id || 'N/A'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
