"use client"

import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { authenticatedFetch } from '@/lib/auth'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

// Import Quill dynamically with better loading optimization
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <Skeleton className="h-10 w-full mb-4 bg-gray-200" />
      <Skeleton className="h-64 w-full bg-gray-200" />
    </div>
  )
})

// Import Quill styles
import 'react-quill/dist/quill.snow.css'

export default function AboutUsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("About Us")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()
  const [userProfile, setUserProfile] = useState<any>(null)

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ]

  // Load user profile and show editor after brief delay
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authenticatedFetch('/api/users/profile', {
          method: 'GET'
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setUserProfile(data.data)
          }
        }
      } catch (error) {
        // Silently fail - user profile is optional for this page
        console.error('Failed to fetch user profile:', error)
      }
    }

    fetchUserProfile()
    
    // Show editor after brief delay to let page structure render first
    const timer = setTimeout(() => {
      setShowEditor(true)
    }, 150)
    
    // Load content in background with transition
    startTransition(() => {
      loadContent()
    })
    
    return () => clearTimeout(timer)
  }, [])

  const loadContent = async () => {
    setIsLoadingContent(true)
    try {
      const response = await authenticatedFetch('/api/cms/about-us', {
        method: 'GET'
      })

      if (!response.ok) {
        if (response.status === 404) {
          // CMS page not found, will create new on save
          return
        }
        throw new Error(`Failed to load content: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        setContent(data.data.htmlContent || '')
        setTitle(data.data.title || 'About Us')
      }
    } catch (error) {
      // Keep error logging for production debugging
      console.error('Error loading content:', error)
    } finally {
      setIsLoadingContent(false)
    }
  }

  // Handle content change
  const handleChange = (value: string) => {
    setContent(value)
    setSaveStatus('idle')
  }

  // Handle save
  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Content cannot be empty')
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await authenticatedFetch('/api/cms/about-us', {
        method: 'POST',
        body: JSON.stringify({
          title,
          htmlContent: content
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSaveStatus('success')
        toast.success('Content saved successfully!')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        toast.error(`Failed to save: ${data.message || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Error saving content:', error)
      setSaveStatus('error')
      toast.error('Failed to save content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (content && confirm('Are you sure you want to discard changes?')) {
      loadContent()
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <Navbar 
          userProfile={userProfile}
          searchTerm={searchTerm}
          onSearch={(e) => setSearchTerm(e.target.value)}
          heading="CMS Management - About Us"
          placeholder='Search...'
        />
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-6">About Us Content</h2>
            
            {!showEditor ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <Skeleton className="h-10 w-full mb-4 bg-gray-200" />
                <Skeleton className="h-64 w-full bg-gray-200" />
              </div>
            ) : (
              <ReactQuill
                theme="snow"
                value={content}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                className="bg-white min-h-[400px]"
              />
            )}
            
            {/* Mobile Preview */}
            {content && showEditor && (
              <div className="mt-8">
                <p className="text-sm font-medium text-gray-700 mb-3">📱 Mobile Preview:</p>
                <div className="mx-auto border-4 border-gray-800 rounded-3xl overflow-hidden bg-white shadow-lg"
                     style={{ width: 375, maxWidth: '100%' }}>
                  {/* Status bar mock */}
                  <div className="h-6 bg-gray-100 flex items-center justify-between px-3 text-[10px] text-gray-600">
                    <span>9:41</span>
                    <div className="flex gap-1 items-center">
                      <span>▮▮▮▮</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  {/* Content area */}
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-16">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving || !showEditor}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !content.trim() || !showEditor || isPending}
                className="bg-[#3d7b51] hover:bg-[#2d5a3d]"
              >
                {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}