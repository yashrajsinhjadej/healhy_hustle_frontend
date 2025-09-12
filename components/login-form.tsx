"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authUtils, type AuthResponse } from "@/lib/auth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Clear any existing tokens when component mounts
  useEffect(() => {
    authUtils.clearAuthData()
    console.log('🧹 [Login] Component mounted - cleared existing tokens')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Clear any existing tokens before login
    authUtils.clearAuthData()
    console.log('🧹 [Login] Cleared existing tokens before login')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data: AuthResponse = await response.json()

      if (response.ok && data.success) {
        // Store token and user data
        console.log('🔍 [Login Form] Storing token:', data.token?.substring(0, 20) + '...')
        console.log('🔍 [Login Form] Token length:', data.token?.length)
        console.log('🔍 [Login Form] User data:', data.user)
        
        authUtils.setAuthData(data.token, data.user)
        console.log('✅ [Login Form] Login successful, token stored')
        
        // Verify what we stored
        const storedToken = authUtils.getToken()
        console.log('🔍 [Login Form] Stored token verification:', storedToken?.substring(0, 20) + '...')
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Login failed
        if (response.status === 403) {
          // Clear any existing invalid tokens
          authUtils.clearAuthData()
          setError(data.error || data.message || 'Invalid or expired token. Please try again.')
        } else {
          setError(data.message || 'Login failed')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-background border-border focus:border-primary focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link href="/forgot-password" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Signing in...
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
