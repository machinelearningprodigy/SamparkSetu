"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  id: string
  image: string
  name: string
  category: string
  date: string
  location: string
  type: "lost" | "found"
  className?: string
}

export function AnimatedCard({ id, image, name, category, date, location, type, className }: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cardDimensions, setCardDimensions] = useState({ width: 0, height: 0, left: 0, top: 0 })

  useEffect(() => {
    if (cardRef.current) {
      const { width, height, left, top } = cardRef.current.getBoundingClientRect()
      setCardDimensions({ width, height, left, top })
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const { left, top, width, height } = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - left) / width
      const y = (e.clientY - top) / height
      setMousePosition({ x, y })
    }
  }

  // Calculate rotation and 3D effect based on mouse position
  const rotateY = isHovered ? (mousePosition.x - 0.5) * 10 : 0
  const rotateX = isHovered ? (0.5 - mousePosition.y) * 10 : 0

  // Determine border and glow colors based on type
  const borderColor = type === "lost" ? "rgba(239, 68, 68, 0.7)" : "rgba(16, 185, 129, 0.7)"
  const glowColor = type === "lost" ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"
  const badgeColor = type === "lost" ? "bg-red-600" : "bg-green-600"

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative group perspective-1000 w-full h-full transform-gpu",
        isHovered ? "z-10" : "z-0",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Card Background Glow */}
      <motion.div
        className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
            mousePosition.y * 100
          }%, ${glowColor} 0%, transparent 70%)`,
          zIndex: -1,
        }}
        animate={{
          boxShadow: isHovered ? `0 0 20px 2px ${glowColor}` : "0 0 0px 0px transparent",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Card Content */}
      <motion.div
        className="bg-slate-800/80 backdrop-blur-sm border overflow-hidden rounded-xl h-full"
        style={{
          borderColor: isHovered ? borderColor : "rgba(51, 65, 85, 0.5)",
          borderWidth: "1px",
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX,
          rotateY,
          boxShadow: isHovered
            ? `0 10px 30px -10px ${glowColor}, 0 0 0 1px ${borderColor}`
            : "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden h-48">
          <motion.div
            className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white ${badgeColor}`}
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {type === "lost" ? "Lost" : "Found"}
          </motion.div>

          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Overlay gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60"
            animate={{
              opacity: isHovered ? 0.3 : 0.6,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="p-4"
          animate={{
            y: isHovered ? -5 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.h3
            className="text-lg font-semibold mb-2 text-white"
            animate={{
              scale: isHovered ? 1.05 : 1,
              color: isHovered ? (type === "lost" ? "#fecaca" : "#d1fae5") : "#ffffff",
            }}
            transition={{ duration: 0.3 }}
          >
            {name}
          </motion.h3>

          <div className="space-y-1">
            <div className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">Category:</span> {category}
            </div>
            <div className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">Date:</span> {date}
            </div>
            <div className="text-sm text-slate-400 mb-4">
              <span className="font-medium text-slate-300">Location:</span> {location}
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-2">
            <Button
              asChild
              variant="outline"
              className={cn(
                "w-full border transition-all duration-300",
                isHovered
                  ? type === "lost"
                    ? "border-red-500/50 text-red-200 hover:bg-red-950/30"
                    : "border-green-500/50 text-green-200 hover:bg-green-950/30"
                  : "border-slate-700",
              )}
            >
              <Link href={`/items/${id}`}>
                <span className="flex items-center justify-center">
                  View Details
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2"
                    animate={{
                      x: isHovered ? 3 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </motion.svg>
                </span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l rounded-tl-lg" style={{ borderColor }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r rounded-tr-lg" style={{ borderColor }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l rounded-bl-lg" style={{ borderColor }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r rounded-br-lg" style={{ borderColor }} />
      </motion.div>
    </motion.div>
  )
}
