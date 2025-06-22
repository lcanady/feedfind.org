import React, { useState } from 'react'

export const MarkdownHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 hover:text-blue-700 inline-flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Markdown supported
      </button>
      
      {isOpen && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Markdown Formatting</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono bg-white px-2 py-1 rounded border">**bold text**</div>
                <div className="text-gray-500">Bold text</div>
              </div>
              <div>
                <div className="font-mono bg-white px-2 py-1 rounded border">*italic text*</div>
                <div className="text-gray-500">Italic text</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono bg-white px-2 py-1 rounded border">[link text](url)</div>
                <div className="text-gray-500">Link</div>
              </div>
              <div>
                <div className="font-mono bg-white px-2 py-1 rounded border">`code`</div>
                <div className="text-gray-500">Inline code</div>
              </div>
            </div>
            
            <div>
              <div className="font-mono bg-white px-2 py-1 rounded border text-xs">
                {'> Quote text'}
              </div>
              <div className="text-gray-500">Quote/blockquote</div>
            </div>
            
            <div>
              <div className="font-mono bg-white px-2 py-1 rounded border text-xs">
                {'- Item 1\n- Item 2'}
              </div>
              <div className="text-gray-500">Bulleted list</div>
            </div>
            
            <div>
              <div className="font-mono bg-white px-2 py-1 rounded border text-xs">
                {'1. First item\n2. Second item'}
              </div>
              <div className="text-gray-500">Numbered list</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarkdownHelp 