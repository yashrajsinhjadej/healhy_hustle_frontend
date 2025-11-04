"use client"

import { SidebarAdmin } from '@/components/sidebar-admin'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, GripVertical } from 'lucide-react'
import { authenticatedFetch } from '@/lib/auth'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FAQItem {
  _id: string
  question: string
  answer: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<FAQItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Form state for creating FAQ
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  
  // Form state for editing FAQ
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)

  // Fetch FAQ items on mount
  useEffect(() => {
    fetchFAQItems()
  }, [])

  const fetchFAQItems = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authenticatedFetch('/api/cms/faq', {
        method: 'GET',
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          // FAQ items not found, initialize empty
          setFaqItems([])
          return
        }
        throw new Error(`Failed to load FAQ items: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setFaqItems(result.data)
      } else {
        setError(result.message || 'Failed to fetch FAQ items')
      }
    } catch (err) {
      // Keep error logging for debugging in production
      console.error('Error fetching FAQ items:', err)
      setError('Failed to load FAQ items')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter FAQ items based on search term
  const filteredFAQs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateFAQ = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('Please fill in both question and answer')
      return
    }

    setIsSaving(true)
    try {
      const response = await authenticatedFetch('/api/cms/faq', {
        method: 'POST',
        body: JSON.stringify({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create FAQ item')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('FAQ created successfully')
        // Refresh the FAQ list
        await fetchFAQItems()
        // Close modal and reset form
        setIsCreateModalOpen(false)
        setNewQuestion("")
        setNewAnswer("")
      } else {
        toast.error(result.message || 'Failed to create FAQ item')
      }
    } catch (err) {
      console.error('Error creating FAQ item:', err)
      toast.error('Failed to create FAQ item. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false)
    setNewQuestion("")
    setNewAnswer("")
  }

  const handleEditClick = (item: FAQItem) => {
    setEditingFaq(item)
    setEditQuestion(item.question)
    setEditAnswer(item.answer)
    setEditIsActive(item.isActive)
    setIsEditModalOpen(true)
  }

  const handleUpdateFAQ = async () => {
    if (!editQuestion.trim() || !editAnswer.trim() || !editingFaq) {
      toast.error('Please fill in both question and answer')
      return
    }

    setIsSaving(true)
    try {
      const response = await authenticatedFetch(`/api/cms/faq/${editingFaq._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
          isActive: editIsActive,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update FAQ item')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('FAQ updated successfully')
        // Refresh the FAQ list
        await fetchFAQItems()
        // Close modal and reset form
        setIsEditModalOpen(false)
        setEditingFaq(null)
        setEditQuestion("")
        setEditAnswer("")
        setEditIsActive(true)
      } else {
        toast.error(result.message || 'Failed to update FAQ item')
      }
    } catch (err) {
      console.error('Error updating FAQ item:', err)
      toast.error('Failed to update FAQ item. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingFaq(null)
    setEditQuestion("")
    setEditAnswer("")
    setEditIsActive(true)
  }

  const handleDeleteFAQ = async (item: FAQItem) => {
    if (!confirm(`Are you sure you want to delete this FAQ?\n\nQuestion: ${item.question}`)) {
      return
    }

    setDeletingId(item._id)
    try {
      const response = await authenticatedFetch(`/api/cms/faq/${item._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ item')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('FAQ deleted successfully')
        // Refresh the FAQ list
        await fetchFAQItems()
      } else {
        toast.error(result.message || 'Failed to delete FAQ item')
      }
    } catch (err) {
      console.error('Error deleting FAQ item:', err)
      toast.error('Failed to delete FAQ item. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, item: FAQItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetItem: FAQItem) => {
    e.preventDefault()

    if (!draggedItem || draggedItem._id === targetItem._id) {
      setDraggedItem(null)
      return
    }

    // Reorder the items locally
    const items = [...faqItems]
    const draggedIndex = items.findIndex(item => item._id === draggedItem._id)
    const targetIndex = items.findIndex(item => item._id === targetItem._id)

    // Remove dragged item and insert at target position
    items.splice(draggedIndex, 1)
    items.splice(targetIndex, 0, draggedItem)

    // Update local state immediately for smooth UX
    setFaqItems(items)
    setDraggedItem(null)

    // Send reorder request to backend
    try {
      const orderedIds = items.map(item => item._id)
      const response = await authenticatedFetch('/api/cms/faq/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds })
      })

      if (!response.ok) {
        throw new Error('Failed to reorder FAQ items')
      }

      const result = await response.json()

      if (!result.success) {
        // Revert on failure
        await fetchFAQItems()
        toast.error(result.message || 'Failed to reorder FAQ items')
      } else {
        toast.success('FAQ order updated successfully')
      }
    } catch (err) {
      console.error('Error reordering FAQ items:', err)
      // Revert on error
      await fetchFAQItems()
      toast.error('Failed to reorder FAQ items. Please try again.')
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6]">
      <SidebarAdmin />
      <div className="flex-1">
        <Navbar 
          userProfile={undefined}
          searchTerm={searchTerm}
          onSearch={(e) => setSearchTerm(e.target.value)}
          heading="CMS Management (FAQ)"
          placeholder='Search FAQs...'
        />
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-blue-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-[#000000]">FAQ Management</h1>
                <Button 
                  className="bg-gray-800 text-white hover:bg-gray-900 flex items-center gap-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add New FAQ
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading FAQ items...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : filteredFAQs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No FAQs match your search.' : 'No FAQ items found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((item, index) => (
                    <div 
                      key={item._id} 
                      draggable={!searchTerm}
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item)}
                      onDragEnd={handleDragEnd}
                      className={`border border-gray-200 rounded-lg p-4 transition-all ${
                        draggedItem?._id === item._id 
                          ? 'opacity-50 scale-95' 
                          : 'hover:shadow-md'
                      } ${!searchTerm ? 'cursor-move' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        {!searchTerm && (
                          <div className="mr-3 mt-1 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              #{item.order}
                            </span>
                            {item.isActive && (
                              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.question}
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {item.answer}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-300"
                            onClick={() => handleEditClick(item)}
                            disabled={deletingId === item._id}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteFAQ(item)}
                            disabled={deletingId === item._id}
                          >
                            {deletingId === item._id ? (
                              <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create FAQ Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                placeholder="Enter the question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={5}
                disabled={isSaving}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelCreate}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFAQ}
              disabled={isSaving || !newQuestion.trim() || !newAnswer.trim()}
              className="bg-gray-800 text-white hover:bg-gray-900"
            >
              {isSaving ? 'Creating...' : 'Create FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">Question *</Label>
              <Input
                id="edit-question"
                placeholder="Enter the question"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-answer">Answer *</Label>
              <Textarea
                id="edit-answer"
                placeholder="Enter the answer"
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                rows={5}
                disabled={isSaving}
                className="resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                disabled={isSaving}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-isActive" className="cursor-pointer">
                Active (visible to users)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFAQ}
              disabled={isSaving || !editQuestion.trim() || !editAnswer.trim()}
              className="bg-gray-800 text-white hover:bg-gray-900"
            >
              {isSaving ? 'Updating...' : 'Update FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}