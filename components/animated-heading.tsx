"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedHeadingProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedHeading({ children, className }: AnimatedHeadingProps) {
  return (
    <motion.div
      className={cn("relative mb-12 text-center", className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-3xl md:text-4xl font-bold relative z-10 inline-block"
        animate={{
          textShadow: [
            "0 0 5px rgba(99, 102, 241, 0.3)",
            "0 0 15px rgba(99, 102, 241, 0.5)",
            "0 0 5px rgba(99, 102, 241, 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        {children}
      </motion.h2>

      {/* Animated underline */}
      <motion.div
        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: "40%" }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Animated pulse underline */}
      <motion.div
        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-full"
        initial={{ width: "0%", opacity: 0.5 }}
        animate={{
          width: ["0%", "40%", "0%"],
          opacity: [0, 0.5, 0],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", repeatDelay: 1 }}
      />

      {/* Decorative elements */}
      <motion.div
        className="absolute -top-6 -left-6 w-12 h-12 opacity-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.2, scale: 1, rotate: 360 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="w-full h-full border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
      </motion.div>
      <motion.div
        className="absolute -bottom-6 -right-6 w-12 h-12 opacity-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.2, scale: 1, rotate: 360 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <div className="w-full h-full border-b-2 border-r-2 border-green-500 rounded-br-lg" />
      </motion.div>
    </motion.div>
  )
}
