// app/(admin)/cms/terms-and-conditions/page.tsx
"use client"

import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { authenticatedFetch } from '@/lib/auth'

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

// Import Quill styles
import 'react-quill/dist/quill.snow.css'

export default function TermsAndConditionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("Terms and Conditions")
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

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch('/api/cms/terms-and-conditions', {
        method: 'GET'
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log('CMS page not found, will create new on save')
          return
        }
        throw new Error(`Failed to load content: ${response.statusText}`)
}

      const data = await response.json()

      if (data.success && data.data) {
        setContent(data.data.htmlContent || '')
        setTitle(data.data.title || 'Terms and Conditions')
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (value: string) => {
    setContent(value)
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Content cannot be empty')
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await authenticatedFetch('/api/cms/terms-and-conditions', {
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
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        alert(`Failed to save: ${data.message || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Error saving content:', error)
      setSaveStatus('error')
      alert('Failed to save content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (content && confirm('Are you sure you want to discard changes?')) {
      loadContent()
    }
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
            heading="CMS Management - Terms & Conditions"
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
          heading="CMS Management - Terms & Conditions"
          placeholder='Search...'
        />
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-blue-200 rounded-lg p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-[#000000]">Terms & Conditions</h1>
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
                  placeholder="Terms and Conditions"
                />
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
                    placeholder="Write your Terms & Conditions..."
                    className="min-h-[400px]"
                  />
                </div>
                
                {/* Mobile Preview */}
                {content && (
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

                {/* WebView URL info card and copy button removed as requested */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
