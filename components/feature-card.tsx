"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { FileText, Maximize2, MessageSquare } from "lucide-react"

interface FeatureCardProps {
  icon: "report" | "match" | "connect"
  title: string
  description: string
  index: number
}

export function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Define color schemes based on icon type
  const colorScheme = {
    report: {
      iconBg: "bg-blue-600/20",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/50",
      glowColor: "shadow-blue-500/20",
      hoverGlow: "shadow-blue-500/40",
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-400",
    },
    match: {
      iconBg: "bg-purple-600/20",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/50",
      glowColor: "shadow-purple-500/20",
      hoverGlow: "shadow-purple-500/40",
      gradientFrom: "from-purple-600",
      gradientTo: "to-purple-400",
    },
    connect: {
      iconBg: "bg-green-600/20",
      iconColor: "text-green-500",
      borderColor: "border-green-500/50",
      glowColor: "shadow-green-500/20",
      hoverGlow: "shadow-green-500/40",
      gradientFrom: "from-green-600",
      gradientTo: "to-green-400",
    },
  }

  // Ensure we have a valid icon type
  const safeIcon = ["report", "match", "connect"].includes(icon) ? icon : "report"
  const scheme = colorScheme[safeIcon]

  // Icon mapping
  const iconMap = {
    report: <FileText className="h-8 w-8" />,
    match: <Maximize2 className="h-8 w-8" />,
    connect: <MessageSquare className="h-8 w-8" />,
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card container with border and shadow effects */}
      <div
        className={cn(
          "relative h-full rounded-xl p-6 backdrop-blur-sm border-2 transition-all duration-300",
          scheme.borderColor,
          "bg-slate-900/60",
          "shadow-lg",
          isHovered ? scheme.hoverGlow : scheme.glowColor,
        )}
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div
            className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", scheme.gradientFrom, scheme.gradientTo)}
          />

          {/* Corner accents */}
          <div
            className={cn("absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg", scheme.borderColor)}
          />
          <div
            className={cn("absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg", scheme.borderColor)}
          />
          <div
            className={cn("absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg", scheme.borderColor)}
          />
          <div
            className={cn("absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg", scheme.borderColor)}
          />
        </div>

        {/* Card content */}
        <div className="relative z-10 flex flex-col items-center text-center h-full">
          {/* Icon */}
          <motion.div
            className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", scheme.iconBg)}
            animate={{
              y: isHovered ? -5 : 0,
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className={scheme.iconColor}>{iconMap[safeIcon]}</div>
          </motion.div>

          {/* Title */}
          <motion.h3
            className="text-xl font-semibold mb-3 relative"
            animate={{ y: isHovered ? -2 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {title}
            {/* Animated underline */}
            <motion.div
              className={cn(
                "absolute -bottom-1 left-1/2 h-0.5 rounded-full bg-gradient-to-r",
                scheme.gradientFrom,
                scheme.gradientTo,
              )}
              initial={{ width: "0%", x: "-50%" }}
              animate={{ width: isHovered ? "80%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.h3>

          {/* Description */}
          <p className="text-slate-400">{description}</p>

          {/* Learn more link */}
          <motion.div
            className="mt-auto pt-4"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className={cn("text-sm font-medium cursor-pointer", scheme.iconColor)}>Learn more →</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
