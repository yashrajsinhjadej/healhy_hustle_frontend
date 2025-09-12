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
        
        // For now, we'll fetch from the users list API
        // Later you can create a specific user detail API
        const response = await authenticatedFetch("/api/users?limit=1000")
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        const foundUser = data.data.users.find((u: User) => u.id === userId)
        
        if (!foundUser) {
          throw new Error("User not found")
        }

        setUser(foundUser)
        setFormData({
          name: foundUser.name,
          email: foundUser.email,
          phone: foundUser.phone,
          gender: foundUser.gender,
          age: foundUser.age.toString(),
          profileCompleted: foundUser.profileCompleted,
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
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError("")
      
      // Prepare the request body according to the API specification
      const requestBody = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : null,
        profileCompleted: formData.profileCompleted,
        isActive: formData.isActive
      }
      
      console.log('✏️ [EditUserForm] Updating user:', userId)
      console.log('✏️ [EditUserForm] Request body:', requestBody)
      
      const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      const result = await response.json()
      console.log('✅ [EditUserForm] User updated successfully:', result)
      
      // Show success message
      alert("User updated successfully!")
      
      // Navigate back to user management
      router.push("/dashboard")
      
    } catch (error) {
      console.error("Error saving user:", error)
      setError(error instanceof Error ? error.message : "Failed to save user")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard")
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
                  className="bg-[#f1f2f3] border-[#e1e1e1] text-[#000000]"
                  placeholder="Enter user name"
                />
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
                  className="bg-[#f1f2f3] border-[#e1e1e1] text-[#000000]"
                  placeholder="Enter email address"
                />
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
                  className="bg-[#f1f2f3] border-[#e1e1e1] text-[#000000]"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#000000]">
                  Gender *
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="bg-[#f1f2f3] border-[#e1e1e1] text-[#000000]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="Not specified">Not specified</SelectItem>
                  </SelectContent>
                </Select>
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
                  className="bg-[#f1f2f3] border-[#e1e1e1] text-[#000000]"
                  placeholder="Enter age"
                  min="1"
                  max="120"
                />
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

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name || !formData.email || !formData.phone || !formData.gender || !formData.age}
                  className="bg-[#000000] text-white hover:bg-[#212121]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
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
