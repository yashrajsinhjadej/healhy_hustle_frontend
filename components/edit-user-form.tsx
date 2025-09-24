"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { authenticatedFetch } from "@/lib/auth"

interface User {
  id: string
  name: string
  email: string
  phone: string
  gender: string
  age: number
  profileCompleted: boolean
  status: string
}

interface EditUserFormProps {
  userId: string
}

export function EditUserForm({ userId }: EditUserFormProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    profileCompleted: false,
    isActive: true
  })

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        setError("")
        
        console.log('🔍 [EditUserForm] Fetching user data for ID:', userId)
        
        // Fetch specific user data using the new API endpoint
        const response = await authenticatedFetch(`/api/users/${userId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        console.log('🔍 [EditUserForm] User data received:', data)
        
        if (!data.success || !data.data) {
          throw new Error("User not found")
        }

        const foundUser = data.data
        setUser(foundUser)
        setFormData({
          name: foundUser.name || "",
          email: foundUser.email || "",
          phone: foundUser.phone || "",
          gender: foundUser.gender || "",
          age: foundUser.age && foundUser.age !== "Not specified" ? foundUser.age.toString() : "",
          profileCompleted: foundUser.profileCompleted || false,
          isActive: foundUser.status === "Active"
        })
        
      } catch (error) {
        console.error("Error fetching user:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch user data")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Validate the field in real-time and update validation errors
    let fieldError = ""
    
    switch (field) {
      case 'name':
        fieldError = validateName(value as string)
        break
      case 'email':
        fieldError = validateEmail(value as string)
        break
      case 'phone':
        fieldError = validatePhone(value as string)
        break
      case 'age':
        fieldError = validateAge(value as string)
        break
      case 'gender':
        fieldError = validateGender(value as string)
        break
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: fieldError
    }))
  }

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return ""
  }

  const validateName = (name: string): string => {
    if (!name.trim()) return "Name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters long"
    if (name.trim().length > 50) return "Name must be less than 50 characters"
    return ""
  }

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "Phone number is required"
    // More flexible phone validation - accepts various formats
    const cleanPhone = phone.replace(/\s/g, '')
    const phoneRegex = /^[\+]?[1-9]\d{6,14}$/
    if (!phoneRegex.test(cleanPhone)) return "Please enter a valid phone number (7-15 digits)"
    return ""
  }

  const validateAge = (age: string): string => {
    if (!age.trim()) return "Age is required"
    const ageNum = parseInt(age)
    if (isNaN(ageNum)) return "Age must be a valid number"
    if (ageNum < 13) return "Age must be at least 13"
    if (ageNum > 120) return "Age must be less than 120"
    return ""
  }

  const validateGender = (gender: string): string => {
    if (!gender) return "Gender is required"
    return ""
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    const nameError = validateName(formData.name)
    if (nameError) errors.name = nameError
    
    const emailError = validateEmail(formData.email)
    if (emailError) errors.email = emailError
    
    const phoneError = validatePhone(formData.phone)
    if (phoneError) errors.phone = phoneError
    
    const ageError = validateAge(formData.age)
    if (ageError) errors.age = ageError
    
    const genderError = validateGender(formData.gender)
    if (genderError) errors.gender = genderError
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError("")
      setValidationErrors({})
      
      // Validate form before submitting
      if (!validateForm()) {
        setIsSaving(false)
        return
      }
      
      // Prepare the request body according to the API specification
      const requestBody = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : null,
        profileCompleted: formData.profileCompleted,
        isActive: formData.isActive
      }
      
      console.log('✏️ [EditUserForm] Updating user:', userId)
      console.log('✏️ [EditUserForm] Request body:', requestBody)
      
      console.log('💾 [EditUserForm] Saving user data:', requestBody)
      
      const response = await authenticatedFetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      let result
      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ [EditUserForm] Update failed:', errorData)
        console.log('❌ [EditUserForm] Response status:', response.status)
        console.log('❌ [EditUserForm] Full error response:', JSON.stringify(errorData, null, 2))
        
        // Handle different types of backend validation errors
        const errorMessage = errorData.error || errorData.message || 'Failed to update user'
        
        console.log('🔍 [EditUserForm] Processing error message:', errorMessage)
        console.log('🔍 [EditUserForm] Error message lowercase:', errorMessage.toLowerCase())
        
        // Check if it's a field-specific validation error
        if (response.status === 400 || response.status === 422) {
          // Handle field-specific validation errors
          if ((errorMessage.toLowerCase().includes('email') && 
               (errorMessage.toLowerCase().includes('already exists') || 
                errorMessage.toLowerCase().includes('already in use'))) ||
              errorMessage.toLowerCase().includes('email is already in use')) {
            console.log('✅ [EditUserForm] Email validation error detected, setting field error')
            setValidationErrors(prev => ({
              ...prev,
              email: 'This email address is already in use'
            }))
            setError('')
            return // Don't throw error, let user fix the field
          }
          
          if ((errorMessage.toLowerCase().includes('phone') && 
               (errorMessage.toLowerCase().includes('already exists') || 
                errorMessage.toLowerCase().includes('already in use'))) ||
              errorMessage.toLowerCase().includes('phone is already in use')) {
            setValidationErrors(prev => ({
              ...prev,
              phone: 'This phone number is already in use'
            }))
            setError('')
            return // Don't throw error, let user fix the field
          }
          
          // Handle other validation errors
          if (errorMessage.toLowerCase().includes('invalid email')) {
            setValidationErrors(prev => ({
              ...prev,
              email: 'Please enter a valid email address'
            }))
            setError('')
            return
          }
          
          // Fallback: if it's a validation error and mentions email, treat as email error
          if (errorMessage.toLowerCase().includes('email') && 
              (errorMessage.toLowerCase().includes('validation') || 
               errorMessage.toLowerCase().includes('failed'))) {
            console.log('✅ [EditUserForm] Generic email validation error detected')
            setValidationErrors(prev => ({
              ...prev,
              email: 'Email validation failed: ' + errorMessage
            }))
            setError('')
            return
          }
        }
        
        // For other errors, display as general error
        setError(errorMessage)
        return // Exit early for error cases
      }

      result = await response.json()
      console.log('✅ [EditUserForm] User updated successfully:', result)
      
      // Show success message
      alert("User updated successfully!")
      
      // Navigate back to user management
      router.push("/dashboard")
      
    } catch (error) {
      console.error("Error saving user:", error)
      
      // Handle network errors or other unexpected errors
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError('Network error. Please check your connection and try again.')
        } else if (error.message.includes('Session expired')) {
          setError('Your session has expired. Please log in again.')
          // Optionally redirect to login
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          setError(error.message)
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  const renderFieldError = (fieldName: string) => {
    const error = validationErrors[fieldName]
    if (!error) return null
    
    return (
      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
        <span className="text-red-500">•</span>
        {error}
      </p>
    )
  }

  const getFieldClassName = (fieldName: string) => {
    const hasError = validationErrors[fieldName]
    return hasError 
      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
  }

  const isFormValid = () => {
    const errors = Object.values(validationErrors).filter(error => error.trim() !== "")
    return errors.length === 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5f6] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading user data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f5f6] flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">Error</div>
              <div className="text-sm text-gray-600 mb-4">{error}</div>
              <Button onClick={handleCancel} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f5f6]">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={handleCancel} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-semibold text-[#000000]">Edit User</h1>
          <p className="text-[#7b7b7b] mt-2">Update user information</p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border-[#e1e1e1]">
            <CardHeader>
              <CardTitle className="text-xl">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-[#000000]">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`bg-[#f1f2f3] text-[#000000] ${getFieldClassName("name")}`}
                  placeholder="Enter user name"
                />
                {renderFieldError("name")}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#000000]">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`bg-[#f1f2f3] text-[#000000] ${getFieldClassName("email")}`}
                  placeholder="Enter email address"
                />
                {renderFieldError("email")}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-[#000000]">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`bg-[#f1f2f3] text-[#000000] ${getFieldClassName("phone")}`}
                  placeholder="Enter phone number"
                />
                {renderFieldError("phone")}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#000000]">
                  Gender *
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className={`bg-[#f1f2f3] text-[#000000] ${getFieldClassName("gender")}`}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="Not specified">Not specified</SelectItem>
                  </SelectContent>
                </Select>
                {renderFieldError("gender")}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-[#000000]">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className={`bg-[#f1f2f3] text-[#000000] ${getFieldClassName("age")}`}
                  placeholder="Enter age"
                  min="1"
                  max="120"
                />
                {renderFieldError("age")}
              </div>

              {/* Profile Completed */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#000000]">
                  Profile Completed
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.profileCompleted}
                    onCheckedChange={(checked) => handleInputChange("profileCompleted", checked)}
                  />
                  <span className="text-sm text-[#7b7b7b]">
                    {formData.profileCompleted ? "Profile is complete" : "Profile is incomplete"}
                  </span>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#000000]">
                  Account Status
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <span className="text-sm text-[#7b7b7b]">
                    {formData.isActive ? "Account is active" : "Account is inactive"}
                  </span>
                </div>
              </div>

              {/* Validation Summary */}
              {!isFormValid() && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="font-medium">Please fix the following errors:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {Object.values(validationErrors).filter(error => error.trim() !== "").map((error, index) => (
                        <li key={index} className="text-red-600 text-xs">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="font-medium">Update Failed</p>
                    <p className="text-red-600">{error}</p>
                    <p className="text-red-500 text-xs mt-1">
                      Please check the field errors above and try again.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !isFormValid()}
                  className={`${
                    !isFormValid() 
                      ? "bg-gray-400 text-white cursor-not-allowed" 
                      : "bg-[#000000] text-white hover:bg-[#212121]"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : !isFormValid() ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Fix Errors to Save
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-[#e1e1e1] text-[#7b7b7b] bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
