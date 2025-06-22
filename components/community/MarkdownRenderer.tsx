import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownRendererProps {
  content: string
  className?: string
  compact?: boolean // for replies and smaller content
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '', 
  compact = false 
}) => {
  return (
    <div className={`prose prose-gray max-w-none ${compact ? 'prose-sm' : ''} 
                   prose-headings:text-gray-900 
                   prose-p:text-gray-700 prose-p:leading-relaxed
                   prose-a:text-blue-600 prose-a:hover:text-blue-700
                   prose-strong:text-gray-900 prose-em:text-gray-700
                   prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-4
                   prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                   prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded prose-pre:p-4
                   prose-ul:list-disc prose-ol:list-decimal prose-ul:space-y-1 prose-ol:space-y-1
                   prose-li:marker:text-gray-500 prose-li:text-gray-700
                   ${compact ? 'prose-p:mb-2 prose-my-2' : 'prose-p:mb-4 prose-my-4'}
                   ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className={`font-bold text-gray-900 ${compact ? 'text-lg mt-4 mb-2' : 'text-2xl mt-6 mb-4'}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`font-semibold text-gray-900 ${compact ? 'text-base mt-3 mb-2' : 'text-xl mt-5 mb-3'}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm mt-2 mb-1' : 'text-lg mt-4 mb-2'}`}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`text-gray-700 leading-relaxed ${compact ? 'mb-2' : 'mb-4'}`}>
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-700 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 border-blue-500 bg-blue-50 pl-4 text-gray-700 ${compact ? 'py-1 my-2' : 'py-2 my-4'}`}>
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }: any) => {
            const inline = !props.className?.includes('language-')
            return inline ? (
              <code className={`bg-gray-100 rounded font-mono text-gray-800 ${compact ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-sm'}`}>
                {children}
              </code>
            ) : (
              <pre className={`bg-gray-100 border border-gray-200 rounded overflow-x-auto ${compact ? 'p-2 text-xs' : 'p-4 text-sm'}`}>
                <code className="font-mono text-gray-800">{children}</code>
              </pre>
            )
          },
          ul: ({ children }) => (
            <ul className={`list-disc list-inside space-y-1 text-gray-700 ${compact ? 'mb-2' : 'mb-4'}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-inside space-y-1 text-gray-700 ${compact ? 'mb-2' : 'mb-4'}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer 