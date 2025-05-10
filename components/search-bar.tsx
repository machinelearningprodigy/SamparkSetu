"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ onSearch, placeholder = "Search for lost or found items", className }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  const clearSearch = () => {
    setQuery("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <motion.div
      className={`relative max-w-4xl mx-auto ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSearch} className="relative">
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: isFocused
              ? "0 0 0 2px rgba(99, 102, 241, 0.8), 0 0 20px rgba(99, 102, 241, 0.4)"
              : "0 0 0 1px rgba(51, 65, 85, 0.5), 0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ duration: 0.2 }}
        />

        <div className="relative flex items-center">
          <motion.div
            className="absolute left-3 text-slate-400"
            animate={{
              scale: isFocused ? 1.1 : 1,
              color: isFocused ? "#6366f1" : "#94a3b8",
            }}
          >
            <Search size={18} />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg pl-10 pr-10 py-3 focus:outline-none text-white placeholder:text-slate-500 w-full"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                className="absolute right-[70px] text-slate-400 hover:text-slate-300"
                onClick={clearSearch}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <X size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.div className="absolute right-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <motion.div
                className="absolute inset-0 rounded-md opacity-0"
                animate={{
                  boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.3)",
                  opacity: [0, 0.5, 0],
                }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
              />
            </Button>
          </motion.div>
        </div>
      </form>

      {/* Floating particles */}
      <div className="absolute -inset-4 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {isFocused && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * 100 - 50 + "%",
                    y: Math.random() * 100 - 50 + "%",
                  }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    scale: [0, 1, 0],
                    x: `calc(${Math.random() * 100 - 50}% + ${Math.random() * 40 - 20}px)`,
                    y: `calc(${Math.random() * 100 - 50}% + ${Math.random() * 40 - 20}px)`,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1 + Math.random(), delay: Math.random() * 0.5 }}
                >
                  <Sparkles size={10 + Math.random() * 10} className="text-indigo-400" style={{ opacity: 0.7 }} />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
