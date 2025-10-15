// app/cms/about/page.tsx
"use client"

import { useState } from "react"
import { SidebarAdmin } from "@/components/sidebar-admin"
import { Navbar } from "@/components/navbar"
import { RichTextEditor } from "@/components/cms/rich-text-editor"

export default function AboutUsPage() {
  const [searchTerm, setSearchTerm] = useState("")

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

              <label className="block text-sm font-medium text-[#000000] mb-2">Description:</label>

              <RichTextEditor
                className="mt-1"
                initialHTML={`<p>Welcome to our About Us section. Edit this content, add headings, lists, and links.</p>`}
                onSave={(html) => {
                  console.log("[CMS About] Saved HTML:", html)
                }}
                onCancel={() => {
                  console.log("[CMS About] Cancel clicked")
                }}
                showMobilePreview
                toolbarLabel="Formatting"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
