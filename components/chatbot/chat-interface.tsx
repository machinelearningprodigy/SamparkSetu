"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, Minimize2, Maximize2, Zap, Bot } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export default function ChatInterface({ isOpen, onClose, isExpanded, onToggleExpand }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const welcomeMessage = {
    role: "assistant" as const,
    content: "Hello! I'm your **SamparkSetu AI assistant**. I am designed to help you with lost and found items.",
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (content: string = input) => {
    if ((!content.trim() && !input.trim()) || isLoading) return

    const messageToSend = content.trim() || input.trim()
    setInput("")
    setIsLoading(true)
    setShowWelcome(false)

    // Add user message to the chat
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }])

    try {
      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are SamparkSetu's AI assistant for a lost and found platform. 
              Provide helpful, concise responses about lost and found items. 
              Use markdown formatting for emphasis - use **bold** for important words and phrases.
              Format lists properly with markdown.
              Your responses should have a friendly, helpful tone.
              Keep responses very brief - no more than 2-3 short paragraphs.`,
            },
            ...messages,
            { role: "user", content: messageToSend },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", data)

      // Add assistant response to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content || data.message || "Sorry, I couldn't process your request.",
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    "How do I report a lost item?",
    "I found something, what should I do?",
    "How does the matching system work?",
    "What information should I provide?",
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed bottom-6 right-6 z-50 overflow-hidden rounded-xl ${
          isExpanded ? "h-[80vh] w-[90vw] sm:w-[600px]" : "h-[500px] w-[90vw] sm:w-[400px]"
        }`}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sci-fi outer glow and border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-[1px]">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-50 blur-md"></div>
        </div>

        {/* Main container with sci-fi background */}
        <div
          className="relative h-full rounded-xl overflow-hidden bg-gray-900/95 backdrop-blur-md flex flex-col"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 20%),
              radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 20%),
              linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))
            `,
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Sci-fi circuit pattern overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,30 L90,30" stroke="white" strokeWidth="0.5" fill="none" />
                <path d="M10,50 L90,50" stroke="white" strokeWidth="0.5" fill="none" />
                <path d="M10,70 L90,70" stroke="white" strokeWidth="0.5" fill="none" />
                <path d="M30,10 L30,90" stroke="white" strokeWidth="0.5" fill="none" />
                <path d="M50,10 L50,90" stroke="white" strokeWidth="0.5" fill="none" />
                <path d="M70,10 L70,90" stroke="white" strokeWidth="0.5" fill="none" />
                <circle cx="30" cy="30" r="2" fill="white" />
                <circle cx="50" cy="50" r="2" fill="white" />
                <circle cx="70" cy="70" r="2" fill="white" />
              </svg>
            </div>
          </div>

          {/* Futuristic header with holographic effect */}
          <div className="relative border-b border-cyan-500/30 bg-gradient-to-r from-gray-900 to-gray-800 p-4">
            {/* Header accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[1px]">
                  <div className="absolute inset-0 rounded-full opacity-40 blur-sm bg-blue-500"></div>
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gray-900">
                    <Bot className="h-4 w-4 text-cyan-400" />
                    <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border border-cyan-500/50 opacity-50"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    SAMPARKSETU
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-xs text-gray-400 font-mono">AI ASSISTANT v2.0</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onToggleExpand}
                  className="group relative rounded-full p-1.5 text-gray-400 transition-colors hover:text-cyan-400"
                  aria-label={isExpanded ? "Minimize chat" : "Expand chat"}
                >
                  <div className="absolute inset-0 rounded-full bg-cyan-500/0 transition-all group-hover:bg-cyan-500/20"></div>
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={onClose}
                  className="group relative rounded-full p-1.5 text-gray-400 transition-colors hover:text-cyan-400"
                  aria-label="Close chat"
                >
                  <div className="absolute inset-0 rounded-full bg-cyan-500/0 transition-all group-hover:bg-cyan-500/20"></div>
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Chat messages with sci-fi styling */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(59, 130, 246, 0.3) transparent",
            }}
          >
            {/* Welcome message or conversation */}
            {showWelcome ? (
              <motion.div
                className="mb-4 flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="relative max-w-[90%] rounded-lg p-3 text-gray-100 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 24, 39, 0.8) 100%)",
                    boxShadow: "0 0 15px rgba(59, 130, 246, 0.15), inset 0 0 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

                  {/* Left accent line */}
                  <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-blue-500 to-transparent"></div>

                  <MarkdownRenderer content={welcomeMessage.content} />
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`relative max-w-[80%] rounded-lg p-3 overflow-hidden ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-600/90 to-indigo-700/90 text-white"
                          : "bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-gray-100"
                      }`}
                      style={{
                        boxShadow:
                          message.role === "user"
                            ? "0 0 15px rgba(59, 130, 246, 0.2), inset 0 0 10px rgba(0, 0, 0, 0.2)"
                            : "0 0 15px rgba(59, 130, 246, 0.1), inset 0 0 10px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {/* Top accent line */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-[1px] ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                            : "bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                        }`}
                      ></div>

                      {/* Side accent line */}
                      <div
                        className={`absolute top-0 ${message.role === "user" ? "right-0" : "left-0"} bottom-0 w-[1px] ${
                          message.role === "user"
                            ? "bg-gradient-to-b from-blue-400 to-transparent"
                            : "bg-gradient-to-b from-cyan-500 to-transparent"
                        }`}
                      ></div>

                      {message.role === "assistant" ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </>
            )}

            {/* Loading indicator with sci-fi styling */}
            {isLoading && (
              <motion.div
                className="mb-4 flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="relative max-w-[80%] rounded-lg p-3 text-gray-100 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 24, 39, 0.8) 100%)",
                    boxShadow: "0 0 15px rgba(59, 130, 246, 0.15), inset 0 0 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

                  {/* Left accent line */}
                  <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-cyan-500 to-transparent"></div>

                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 1.5,
                            delay: i * 0.2,
                            ease: "easeInOut",
                          }}
                          className="h-2 w-2 rounded-full bg-cyan-500"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">PROCESSING</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions with sci-fi styling */}
          {showWelcome ? (
            <div className="relative border-t border-cyan-500/30 bg-gradient-to-r from-gray-900 to-gray-800 p-4">
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

              <p className="mb-3 text-sm text-cyan-400 font-mono tracking-wide">SUGGESTED QUERIES:</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    className="group relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gray-800/50 px-3 py-2 text-left text-sm transition-all hover:border-cyan-400/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendMessage(question)}
                  >
                    {/* Button glow effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-cyan-500/0 transition-all group-hover:bg-cyan-500/10"
                      whileHover={{
                        background: [
                          "linear-gradient(90deg, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(59, 130, 246, 0) 100%)",
                          "linear-gradient(90deg, rgba(59, 130, 246, 0) 100%, rgba(59, 130, 246, 0.1) 150%, rgba(59, 130, 246, 0) 200%)",
                        ],
                        backgroundSize: ["200% 100%", "200% 100%"],
                        backgroundPosition: ["0% 0%", "100% 0%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                      }}
                    />

                    <div className="flex items-center space-x-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30">
                        <Zap className="h-3 w-3" />
                      </div>
                      <span className="text-gray-300 group-hover:text-cyan-300 transition-colors">{question}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative border-t border-cyan-500/30 bg-gradient-to-r from-gray-900 to-gray-800 p-4">
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="w-full rounded-lg border border-cyan-500/30 bg-gray-900/80 px-4 py-2 text-white placeholder-gray-500 backdrop-blur-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                    disabled={isLoading}
                  />
                  {/* Input glow effect */}
                  <div className="absolute inset-0 rounded-lg border border-cyan-400/0 transition-all pointer-events-none"></div>
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white disabled:opacity-50 transition-all"
                  aria-label="Send message"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-md bg-gradient-to-r from-blue-600 to-cyan-600"></div>
                  <div className="relative">
                    <Send size={18} />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
