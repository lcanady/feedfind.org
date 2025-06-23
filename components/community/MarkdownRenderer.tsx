import React from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer 