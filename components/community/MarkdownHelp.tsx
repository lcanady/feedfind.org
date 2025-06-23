import React from 'react'
import { cn } from '@/lib/utils'

interface MarkdownHelpProps {
  className?: string
}

export const MarkdownHelp: React.FC<MarkdownHelpProps> = ({ className }) => {
  return (
    <div className={cn('text-xs text-gray-500', className)}>
      <p>Markdown formatting supported:</p>
      <ul className="mt-1 space-y-1">
        <li><code>**bold**</code> for <strong>bold text</strong></li>
        <li><code>*italic*</code> for <em>italic text</em></li>
        <li><code># Heading</code> for headings</li>
        <li><code>[link](url)</code> for links</li>
        <li><code>- item</code> for bullet lists</li>
        <li><code>1. item</code> for numbered lists</li>
        <li><code>`code`</code> for inline code</li>
      </ul>
    </div>
  )
}

export default MarkdownHelp 