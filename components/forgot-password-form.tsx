"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("📧 [Forgot Password] Requesting password reset for:", email)
      
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      console.log("📧 [Forgot Password] API response:", data)

      if (response.ok) {
        console.log("✅ [Forgot Password] Password reset request successful")
        setIsSubmitted(true)
      } else {
        console.error("❌ [Forgot Password] API error:", data)
        setError(data.error || data.message || 'Failed to send reset email')
      }
    } catch (error) {
      console.error("❌ [Forgot Password] Network error:", error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-card-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We'll send you a password reset link to your email address. The link will expire in 24 hours.
          </p>
        </div>
        <Alert className="text-left">
          <Mail className="h-4 w-4" />
          <AlertDescription>Please also check your spam folder if you don't see the email.</AlertDescription>
        </Alert>
        <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
          Try another email
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-600 text-xs font-bold">!</span>
          </div>
          <div>
            <p className="font-medium">Request Failed</p>
            <p className="text-red-600">{error}</p>
          </div>
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
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We'll send you a password reset link to your email address. The link will expire in 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">Please also check your spam folder if you don't see the email.</p>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Sending reset link...
          </div>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  )
}
