"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Save, X, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link, Image, Video, Table as TableIcon, Quote, Undo, Redo, Palette, Minus, Plus } from "lucide-react"

export function CmsManagement() {
  const [cmsContent, setCmsContent] = useState("")
  const [isCmsLoading, setIsCmsLoading] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const executeCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      if (document.queryCommandSupported && document.queryCommandSupported(command)) {
        document.execCommand(command, false, value)
      }
      setCmsContent(editorRef.current.innerHTML)
    }
  }

  const insertContent = (content: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        const fragment = document.createDocumentFragment()
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild)
        }
        range.insertNode(fragment)
        selection.removeAllRanges()
      } else {
        document.execCommand('insertHTML', false, content)
      }
      setCmsContent(editorRef.current.innerHTML)
    }
  }

  const handleCmsSave = async () => {
    setIsCmsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Content saved successfully!')
    } catch (error) {
      alert('Failed to save content. Please try again.')
    } finally {
      setIsCmsLoading(false)
    }
  }

  const handleCmsCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      setCmsContent('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-blue-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-[#000000] mb-6">CMS Management</h1>
        {/* Toolbar */}
        <div className="border rounded-lg p-3 bg-gray-50 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Font Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              <select className="px-2 py-1 text-sm border rounded" onChange={e => executeCommand('fontName', e.target.value)}>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
              <select className="px-2 py-1 text-sm border rounded" onChange={e => executeCommand('formatBlock', e.target.value)}>
                <option value="div">Normal Text</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
              </select>
            </div>
            {/* Font Size Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button variant="outline" size="sm" onClick={() => executeCommand('fontSize', '3')} className="h-8 w-8 p-0"><Minus className="w-4 h-4" /></Button>
              <span className="px-2 py-1 text-sm border rounded bg-white">12</span>
              <Button variant="outline" size="sm" onClick={() => executeCommand('fontSize', '5')} className="h-8 w-8 p-0"><Plus className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('foreColor', '#000000')} className="h-8 w-8 p-0"><Palette className="w-4 h-4" /></Button>
            </div>
            {/* Text Alignment */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button variant="outline" size="sm" onClick={() => executeCommand('justifyLeft')} className="h-8 w-8 p-0"><AlignLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('justifyCenter')} className="h-8 w-8 p-0"><AlignCenter className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('justifyRight')} className="h-8 w-8 p-0"><AlignRight className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('justifyFull')} className="h-8 w-8 p-0"><AlignJustify className="w-4 h-4" /></Button>
            </div>
            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button variant="outline" size="sm" onClick={() => executeCommand('bold')} className="h-8 w-8 p-0"><Bold className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('italic')} className="h-8 w-8 p-0"><Italic className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('underline')} className="h-8 w-8 p-0"><Underline className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('strikeThrough')} className="h-8 w-8 p-0"><Strikethrough className="w-4 h-4" /></Button>
            </div>
            {/* Lists */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button variant="outline" size="sm" onClick={() => executeCommand('insertUnorderedList')} className="h-8 w-8 p-0"><List className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('insertOrderedList')} className="h-8 w-8 p-0"><ListOrdered className="w-4 h-4" /></Button>
            </div>
            {/* Insert Options */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button variant="outline" size="sm" onClick={() => { const url = prompt('Enter URL:'); if (url) executeCommand('createLink', url) }} className="h-8 w-8 p-0"><Link className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => { const url = prompt('Enter image URL:'); if (url) insertContent(`<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />`) }} className="h-8 w-8 p-0"><Image className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => { const url = prompt('Enter video URL:'); if (url) insertContent(`<iframe src="${url}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`) }} className="h-8 w-8 p-0"><Video className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => insertContent('<table border="1" style="border-collapse: collapse;"><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>')} className="h-8 w-8 p-0"><TableIcon className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => insertContent('<blockquote style="border-left: 4px solid #ccc; margin: 0; padding-left: 16px; font-style: italic;">Quote text here</blockquote>')} className="h-8 w-8 p-0"><Quote className="w-4 h-4" /></Button>
            </div>
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => executeCommand('undo')} className="h-8 w-8 p-0"><Undo className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => executeCommand('redo')} className="h-8 w-8 p-0"><Redo className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
        {/* Editor */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#000000] mb-2">Description:</label>
          <div ref={editorRef} contentEditable className="min-h-[400px] p-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.6' }} onInput={e => setCmsContent(e.currentTarget.innerHTML)} suppressContentEditableWarning={true} />
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" className="border-gray-300 text-gray-700 flex items-center gap-2" onClick={handleCmsCancel} disabled={isCmsLoading}><X className="w-4 h-4" />Cancel</Button>
          <Button className="bg-gray-800 text-white hover:bg-gray-900 flex items-center gap-2" onClick={handleCmsSave} disabled={isCmsLoading}>{isCmsLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4" />Save</>)}</Button>
        </div>
      </div>
    </div>
  )
}
