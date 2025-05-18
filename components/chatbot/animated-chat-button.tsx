"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bot, Sparkles } from "lucide-react"

interface AnimatedChatButtonProps {
  onClick: () => void
}

export default function AnimatedChatButton({ onClick }: AnimatedChatButtonProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const messages = ["NEED ASSISTANCE?", "ASK AI ASSISTANT", "LOST SOMETHING?", "FOUND SOMETHING?"]

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Outer glow effect */}
      <div className="absolute inset-0 rounded-full bg-cyan-500 opacity-30 blur-md animate-pulse"></div>

      <motion.button
        onClick={onClick}
        className="relative flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 opacity-80"
          animate={{
            backgroundPosition: ["0% 0%", "100% 0%"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          style={{ backgroundSize: "200% 100%" }}
        />

        {/* Background circuit pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
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

        {/* Icon with animation */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          >
            <Bot className="h-5 w-5 text-white" />
          </motion.div>

          {/* Pulsing dot */}
          <span className="absolute top-0 right-0 h-2 w-2 bg-green-400 rounded-full animate-ping"></span>
        </div>

        {/* Animated text */}
        <div className="overflow-hidden h-5 relative z-10">
          <motion.div
            key={messageIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-bold tracking-wide"
          >
            {messages[messageIndex]}
          </motion.div>
        </div>

        {/* Sparkle icon */}
        <motion.div
          className="absolute -right-1 -top-1 text-yellow-300"
          animate={{
            rotate: [0, 15, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>

        {/* Animated highlight on hover */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)",
              "linear-gradient(90deg, rgba(255,255,255,0) 100%, rgba(255,255,255,0.1) 150%, rgba(255,255,255,0) 200%)",
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
      </motion.button>
    </motion.div>
  )
}
