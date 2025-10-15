"use client"

import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

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
  const [isSaving, setIsSaving] = useState(false)

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ]
  }

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ]

  // Handle content change
  const handleChange = (value: string) => {
    setContent(value)
    console.log('Current HTML content:', value)
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // This is where you'll integrate your API call
      console.log('Saving content:', content)
      
      // Example API call (uncomment when ready):
      // const response = await fetch('/api/admin/cms', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     slug: 'about-us',
      //     title: 'About Us',
      //     htmlContent: content,
      //   })
      // })
      
      // if (response.ok) {
      //   alert('Content saved successfully!')
      // }
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Content saved! (Console log shows the HTML)')
      
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (content && confirm('Are you sure you want to discard changes?')) {
      setContent("")
    }
  }

  // Load existing content on mount (when API is ready)
  useEffect(() => {
    // Example: Load existing content
    // fetch('/api/cms/about-us')
    //   .then(res => res.json())
    //   .then(data => setContent(data.htmlContent))
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <Navbar 
          userProfile={undefined}
          searchTerm={searchTerm}
          onSearch={(e) => setSearchTerm(e.target.value)}
          heading="CMS Management (About us)"
        />
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-blue-200 rounded-lg p-6">
              <h1 className="text-2xl font-semibold text-[#000000] mb-6">About us</h1>
              
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Description:
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
                
                {/* Preview Section (Optional) */}
                {content && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                )}
                
                <div className="flex justify-end gap-3 mt-6">
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
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}