"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Process the markdown content
  const processedContent = React.useMemo(() => {
    let processed = content

    // Replace bold text (both ** and __ formats)
    processed = processed.replace(
      /(\*\*|__)(.*?)\1/g,
      '<span class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">$2</span>',
    )

    // Replace italic text (both * and _ formats)
    processed = processed.replace(/(\*|_)(.*?)\1/g, '<span class="italic text-cyan-300">$2</span>')

    // Replace headers
    processed = processed.replace(
      /^### (.*?)$/gm,
      '<h3 class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 my-1">$1</h3>',
    )
    processed = processed.replace(
      /^## (.*?)$/gm,
      '<h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 my-2">$1</h2>',
    )
    processed = processed.replace(
      /^# (.*?)$/gm,
      '<h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 my-3">$1</h1>',
    )

    // Replace lists
    processed = processed.replace(
      /^\* (.*?)$/gm,
      '<div class="ml-4 flex items-start my-1"><div class="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500"></div><div>$1</div></div>',
    )
    processed = processed.replace(
      /^\d+\. (.*?)$/gm,
      '<div class="ml-4 flex items-start my-1"><div class="mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-xs text-cyan-400">•</div><div>$1</div></div>',
    )

    // Replace links
    processed = processed.replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" class="text-cyan-400 underline hover:text-cyan-300 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>',
    )

    // Replace code blocks
    processed = processed.replace(
      /```([\s\S]*?)```/g,
      '<pre class="my-2 overflow-x-auto rounded-md bg-gray-800/50 p-2 font-mono text-sm text-cyan-300 border border-cyan-500/20">$1</pre>',
    )

    // Replace inline code
    processed = processed.replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-gray-800/50 px-1 font-mono text-cyan-300 border border-cyan-500/20">$1</code>',
    )

    // Add line breaks
    processed = processed.replace(/\n/g, "<br />")

    return processed
  }, [content])

  return (
    <div
      className={cn("prose prose-invert max-w-none text-sm leading-relaxed", className)}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
