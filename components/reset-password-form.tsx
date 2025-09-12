"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [token, setToken] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0
  const isPasswordValid = newPassword.length >= 6 // Changed to 6 to match API requirement
  const canSubmit = passwordsMatch && isPasswordValid && token

  // Extract token from URL on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      console.log("🔐 [Reset Password] Token extracted from URL:", tokenFromUrl.substring(0, 8) + '...')
    } else {
      setError("Invalid or missing reset token. Please check your email link.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)
    setError("")

    try {
      console.log("🔐 [Reset Password] Submitting password reset with token")
      
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password: newPassword 
        })
      })

      const data = await response.json()
      console.log("🔐 [Reset Password] API response:", data)

      if (response.ok) {
        console.log("✅ [Reset Password] Password reset successful")
        setIsSuccess(true)
      } else {
        console.error("❌ [Reset Password] API error:", data)
        setError(data.error || data.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error("❌ [Reset Password] Network error:", error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-card-foreground">Password reset successful</h3>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Continue to Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert className="text-left border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-card-foreground">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 pr-10 bg-background border-border focus:border-primary focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 bg-background border-border focus:border-primary focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Remember me and Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground">
            Remember me
          </Label>
        </div>
        <div className="text-sm">
          <Link href="/forgot-password" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Password validation feedback */}
      <div className="space-y-2">
        {newPassword.length > 0 && !isPasswordValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Password must be at least 6 characters long.</AlertDescription>
          </Alert>
        )}

        {confirmPassword.length > 0 && !passwordsMatch && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Passwords do not match.</AlertDescription>
          </Alert>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={isLoading || !canSubmit}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Resetting password...
          </div>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  )
}
