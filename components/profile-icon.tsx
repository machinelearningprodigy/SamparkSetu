"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileIconProps {
  isLoggedIn?: boolean
  size?: "sm" | "md" | "lg"
  onClick?: () => void
}

export function ProfileIcon({ isLoggedIn = false, size = "md", onClick }: ProfileIconProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Sizes based on the size prop
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  // Colors based on login status
  const colors = isLoggedIn ? "from-blue-500 to-purple-600" : "from-slate-400 to-slate-600"

  return (
    <motion.div
      className={cn(
        "relative rounded-full cursor-pointer flex items-center justify-center",
        "bg-gradient-to-br",
        colors,
        "border-2 border-transparent",
        sizes[size],
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.1, borderColor: "rgba(168, 85, 247, 0.5)" }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isHovered
          ? [
              "0 0 0 0px rgba(168, 85, 247, 0.2)",
              "0 0 0 4px rgba(168, 85, 247, 0.1)",
              "0 0 0 0px rgba(168, 85, 247, 0.2)",
            ]
          : "0 0 0 0px rgba(168, 85, 247, 0)",
      }}
      transition={{
        boxShadow: {
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      }}
    >
      {/* User Icon */}
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1,
          rotate: isHovered ? [0, 5, 0, -5, 0] : 0,
        }}
        transition={{
          scale: { duration: 0.3 },
          rotate: { duration: 0.5, repeat: isHovered ? 1 : 0 },
        }}
      >
        <User className={cn("text-white", size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6")} />
      </motion.div>

      {/* Status indicator */}
      {isLoggedIn && (
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-black"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />
      )}
    </motion.div>
  )
}
