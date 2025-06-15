 "use client"


import { useState } from "react"
import AnimatedChatButton from "./animated-chat-button"
import ChatInterface from "./chat-interface"

// Change to named export to match the import in layout.tsx
export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsExpanded(false) // Reset to compact view when opening
    }
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {!isOpen && <AnimatedChatButton onClick={handleToggleChat} />}
      <ChatInterface
        isOpen={isOpen}
        onClose={handleToggleChat}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
      />
    </>
  )
}
