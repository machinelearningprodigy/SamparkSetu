"use client"

import type React from "react"

import { motion } from "framer-motion"

interface SectionHeadingProps {
  children: React.ReactNode
  className?: string
}

export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <motion.div
      className={`relative mb-8 text-center ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-2xl md:text-3xl font-bold relative z-10 inline-block"
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
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: "60%" }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
        initial={{ width: "0%", opacity: 0.5 }}
        animate={{
          width: ["0%", "60%", "0%"],
          left: ["50%", "50%", "50%"],
          opacity: [0, 0.5, 0],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", repeatDelay: 1 }}
      />
    </motion.div>
  )
}
