"use client"

import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function PrivacyPolicyPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <Navbar 
          userProfile={undefined} 
          searchTerm={searchTerm} 
          onSearch={(e) => setSearchTerm(e.target.value)} 
          heading="CMS Management (Privacy Policy)" 
          placeholder='privacy'
        />
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-blue-200 rounded-lg p-6">
              <h1 className="text-2xl font-semibold text-[#000000] mb-6">Privacy Policy</h1>
              
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Privacy Policy Content:
                </label>
                <div className="border border-gray-300 rounded-lg p-4 min-h-[400px] bg-white">
                  <div className="text-gray-500 text-center py-20">
                    Privacy Policy dialogue box will be implemented here
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" className="border-gray-300 text-gray-700">
                    Cancel
                  </Button>
                  <Button className="bg-gray-800 text-white hover:bg-gray-900">
                    Save
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
