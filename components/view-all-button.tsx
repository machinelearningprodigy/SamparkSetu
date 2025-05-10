"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ViewAllButtonProps {
  href: string
  className?: string
}

export function ViewAllButton({ href, className = "" }: ViewAllButtonProps) {
  return (
    <motion.div
      className={`text-center mt-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.div className="inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          href={href}
          className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-indigo-100 rounded-lg group"
        >
          <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-indigo-600 rounded-full group-hover:w-full group-hover:h-56"></span>
          <span className="absolute inset-0 border-0 group-hover:border border-indigo-500 rounded-lg"></span>
          <span className="relative flex items-center justify-center gap-2">
            View All Listings
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </span>
        </Link>
      </motion.div>
    </motion.div>
  )
}
