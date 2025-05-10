"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  type?: "chars" | "words"
  staggerChildren?: number
}

export function AnimatedText({
  text,
  className = "",
  delay = 0,
  duration = 0.05,
  type = "chars",
  staggerChildren = 0.03,
}: AnimatedTextProps) {
  const [elements, setElements] = useState<string[]>([])

  useEffect(() => {
    if (type === "chars") {
      setElements(text.split(""))
    } else {
      setElements(text.split(" "))
    }
  }, [text, type])

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren, delayChildren: delay * i },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
  }

  return (
    <motion.div className={`inline-block ${className}`} variants={container} initial="hidden" animate="visible">
      {elements.map((element, index) => (
        <motion.span key={index} variants={child} className={`inline-block ${type === "chars" ? "" : "mr-1"}`}>
          {element === " " ? "\u00A0" : element}
        </motion.span>
      ))}
    </motion.div>
  )
}
