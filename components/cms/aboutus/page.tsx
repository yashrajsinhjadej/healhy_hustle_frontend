"use client"

import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { authenticatedFetch } from '@/lib/auth'
import { toast } from 'sonner'
import { getBackendBaseUrl } from '@/lib/backend-config'

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

// Import Quill styles
import 'react-quill/dist/quill.snow.css'

export default function AboutUsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("About Us")
  const [metaDescription, setMetaDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

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

  // Load existing content on mount
  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch('/api/cms/about')
      const data = await response.json()

      if (data.success && data.data) {
        setContent(data.data.htmlContent || '')
        setTitle(data.data.title || 'About Us')
        setMetaDescription(data.data.metaDescription || '')
      }
    } catch (error) {
      console.error('Error loading content:', error)
      if (error instanceof Error && error.message.includes('404')) {
        // Page doesn't exist yet, use defaults
        console.log('CMS page not found, will create new on save')
      }
    } finally {
      setIsLoading(false)
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
      const response = await authenticatedFetch('/api/cms/about', {
        method: 'POST',
        body: JSON.stringify({
          title,
          htmlContent: content,
          metaDescription
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSaveStatus('success')
        const webviewUrl = `${getBackendBaseUrl()}/api/public/cms/about-us`
        toast.success('Content saved successfully!', {
          description: `Mobile app can access at: ${webviewUrl}`
        })
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
      loadContent() // Reload original content
    }
  }

  // Get WebView URL for mobile team
  const getWebViewURL = () => {
    return `${getBackendBaseUrl()}/api/public/cms/about-us`
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#f4f5f6]">
        <SidebarAdmin />
        <div className="flex-1">
          <Navbar 
            userProfile={undefined}
            searchTerm={searchTerm}
            onSearch={(e) => setSearchTerm(e.target.value)}
            heading="CMS Management (About Us)"
            placeholder='Search...'
          />
          <div className="p-4 flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <Navbar 
          userProfile={undefined}
          searchTerm={searchTerm}
          onSearch={(e) => setSearchTerm(e.target.value)}
          heading="CMS Management (About Us)"
          placeholder='Search...'
        />
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-[#000000]">About Us</h1>
                
                {/* WebView URL Info */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = getWebViewURL()
                    navigator.clipboard.writeText(url)
                    toast.success('WebView URL copied to clipboard!', {
                      description: url
                    })
                  }}
                  className="text-xs"
                >
                  📱 Copy WebView URL
                </Button>
              </div>

              {/* Title field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Page Title:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="About Us"
                />
              </div>

              {/* Meta Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Meta Description (for SEO):
                </label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description (max 160 chars)"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Content:
                </label>
                
                {/* Quill Editor */}
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={handleChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Start writing about us..."
                    className="min-h-[400px]"
                  />
                </div>
                
                {/* Mobile Preview */}
                {content && (
                  <div className="mt-6">
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
                
                {/* Action buttons */}
                <div className="flex items-center justify-between mt-6">
                  <div>
                    {saveStatus === 'success' && (
                      <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="text-sm text-red-600 font-medium">✗ Save failed</span>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="border-gray-300 text-gray-700"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-gray-800 text-white hover:bg-gray-900"
                      onClick={handleSave}
                      disabled={isSaving || !content.trim()}
                    >
                      {isSaving ? 'Saving...' : 'Save & Publish'}
                    </Button>
                  </div>
                </div>

                {/* Info card */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-2">📱 For Mobile Team:</p>
                  <p className="text-xs text-blue-800 mb-2">
                    Use this URL in your WebView:
                  </p>
                  <code className="block p-2 bg-white rounded text-xs break-all">
                    {getWebViewURL()}
                  </code>
                  <p className="text-xs text-blue-700 mt-2">
                    This endpoint returns a fully formatted HTML page optimized for mobile viewing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}