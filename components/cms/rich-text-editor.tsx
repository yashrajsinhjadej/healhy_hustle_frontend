// src/components/rich-text-editor.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export type RichTextEditorProps = {
  initialHTML?: string
  onSave?: (html: string) => void
  onCancel?: () => void
  className?: string
  showMobilePreview?: boolean
  toolbarLabel?: string
}

/**
 * Lightweight Rich Text Editor using contentEditable.
 * - Frontend captures HTML via innerHTML.
 * - Mobile preview shows the rendered content inside a phone-sized frame (no raw HTML string).
 *
 * Security note:
 * - When integrating with backend or rendering publicly, sanitize the HTML server-side to prevent XSS.
 */
export function RichTextEditor({
  initialHTML = `<p>Welcome to the editor. Add headings, lists, and links.</p>`,
  onSave,
  onCancel,
  className = "",
  showMobilePreview = true,
  toolbarLabel = "Formatting",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [html, setHtml] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      setHtml(editorRef.current.innerHTML)
    }
  }, [])

  const exec = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus()
      try {
        document.execCommand(command, false, value ?? "")
        handleInput()
      } catch (e) {
        console.warn("Formatting command failed:", command, e)
      }
    },
    [handleInput]
  )

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML.trim() === "") {
      editorRef.current.innerHTML = initialHTML
      setHtml(initialHTML)
    }
  }, [initialHTML])

  const clearFormatting = useCallback(() => {
    if (!editorRef.current) return
    const text = editorRef.current.innerText
    editorRef.current.innerHTML = text
    handleInput()
  }, [handleInput])

  const handleSave = useCallback(async () => {
    if (!editorRef.current) return
    setIsSaving(true)
    const contentHtml = editorRef.current.innerHTML

    console.log("[RichTextEditor] HTML to save:", contentHtml)
    await new Promise((res) => setTimeout(res, 500))

    setIsSaving(false)
    setSaveMessage("Content captured (no API).")
    setHtml(contentHtml)
    onSave?.(contentHtml)

    setTimeout(() => setSaveMessage(null), 2000)
  }, [onSave])

  const handleAddLink = useCallback(() => {
    const url = prompt("Enter a URL")
    if (!url) return
    exec("createLink", url)
  }, [exec])

  const toggleBulletList = useCallback(() => exec("insertUnorderedList"), [exec])
  const toggleNumberList = useCallback(() => exec("insertOrderedList"), [exec])
  const makeHeading = useCallback(() => exec("formatBlock", "H2"), [exec])

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{toolbarLabel}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Button type="button" variant="outline" className="border-gray-300" onClick={() => exec("bold")}>
          Bold
        </Button>
        <Button type="button" variant="outline" className="border-gray-300" onClick={() => exec("italic")}>
          Italic
        </Button>
        <Button type="button" variant="outline" className="border-gray-300" onClick={() => exec("underline")}>
          Underline
        </Button>
        <Button type="button" variant="outline" className="border-gray-300" onClick={makeHeading}>
          H2
        </Button>
        <Button type="button" variant="outline" className="border-gray-300" onClick={toggleBulletList}>
          • List
        </Button>
        <Button type="button" variant="outline" className="border-gray-300" onClick={toggleNumberList}>
          1. List
        </Button>
        <Button type="button" variant="outline" className="border-gray-300" onClick={handleAddLink}>
          Link
        </Button>
        <Button type="button" variant="outline" className="border-gray-300" onClick={clearFormatting}>
          Clear
        </Button>
      </div>

      {/* Editor */}
      <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-white">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="prose max-w-none focus:outline-none"
          aria-label="Rich text editor"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          className="border-gray-300 text-gray-700"
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = ""
              setHtml("")
            }
            onCancel?.()
          }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-gray-800 text-white hover:bg-gray-900"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {saveMessage && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
          {saveMessage}
        </div>
      )}

      {/* Mobile Preview */}
      {showMobilePreview && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Mobile preview</h2>
          <div className="mx-auto border border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm"
               style={{ width: 375 }}>
            {/* Status bar mock */}
            <div className="h-6 bg-gray-100 flex items-center justify-between px-3 text-[10px] text-gray-600">
              <span>9:41</span>
              <div className="flex gap-1 items-center">
                <span>▮▮▮▮</span>
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
            {/* App content area */}
            <div className="p-4">
              <div
                className="prose prose-sm max-w-none"
                // Rendering editor content as it would appear on mobile
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
