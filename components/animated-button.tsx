"use client"


import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  glowColor?: string
}

export function AnimatedButton({
  children,
  className,
  asChild = false,
  size = "default",
  variant = "default",
  glowColor = "rgba(99, 102, 241, 0.4)",
}: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-md blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ backgroundColor: glowColor, zIndex: -1 }}
        />
      )}
      <Button className={cn(className)} asChild={asChild} size={size} variant={variant}>
        {children}
      </Button>
    </motion.div>
  )
}
