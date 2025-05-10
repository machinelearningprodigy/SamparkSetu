"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedAvatarProps {
  photoURL?: string | null
  displayName?: string | null
  size?: "sm" | "md" | "lg"
  onClick?: () => void
}

export function AnimatedAvatar({ photoURL, displayName, size = "md", onClick }: AnimatedAvatarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState(0)

  // Sizes based on the size prop
  const sizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
  }

  // Rotate slightly on interval for subtle animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setRotation((prev) => (prev + 1) % 360)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isHovered])

  return (
    <motion.div
      className={cn("relative rounded-full overflow-hidden cursor-pointer", "border-2 border-transparent", sizes[size])}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{
        scale: 1.1,
        borderColor: "rgba(168, 85, 247, 0.5)",
      }}
      animate={{
        rotate: isHovered ? 0 : rotation,
        transition: { duration: 2, ease: "easeInOut" },
      }}
    >
      {/* Main Avatar Image */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <img
          src={photoURL || `/placeholder.svg?height=100&width=100&query=futuristic avatar`}
          alt={displayName || "User profile"}
          className={cn("object-cover w-full h-full", "transition-all duration-300")}
        />
      </div>

      {/* Glowing Border Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(45deg, rgba(59, 130, 246, 0.5), rgba(168, 85, 247, 0.5))",
              filter: "blur(1px)",
              mixBlendMode: "overlay",
            }}
          />
        )}
      </AnimatePresence>

      {/* Pulsing Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isHovered
            ? [
                "0 0 0 0px rgba(168, 85, 247, 0.2)",
                "0 0 0 4px rgba(168, 85, 247, 0)",
                "0 0 0 0px rgba(168, 85, 247, 0.2)",
              ]
            : "none",
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      />
    </motion.div>
  )
}
