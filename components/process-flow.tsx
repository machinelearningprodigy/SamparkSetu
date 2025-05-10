"use client"

import { motion } from "framer-motion"

export function ProcessFlow() {
  return (
    <div className="relative hidden md:flex justify-center items-center w-full h-12 my-6">
      {/* Connecting line */}
      <motion.div
        className="absolute h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 w-3/4"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "75%", opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />

      {/* Animated dots */}
      <motion.div
        className="absolute h-3 w-3 rounded-full bg-blue-500"
        style={{ left: "12.5%" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.5, delay: 1.2 }}
      />
      <motion.div
        className="absolute h-3 w-3 rounded-full bg-purple-500"
        style={{ left: "50%" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.5, delay: 1.4 }}
      />
      <motion.div
        className="absolute h-3 w-3 rounded-full bg-green-500"
        style={{ left: "87.5%" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.5, delay: 1.6 }}
      />

      {/* Animated pulse rings */}
      {[12.5, 50, 87.5].map((position, index) => (
        <motion.div
          key={index}
          className={`absolute h-3 w-3 rounded-full ${
            index === 0 ? "border-blue-500" : index === 1 ? "border-purple-500" : "border-green-500"
          } border-2 opacity-0`}
          style={{ left: `${position}%` }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.5,
          }}
        />
      ))}

      {/* Animated flow particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white opacity-80"
          initial={{ left: "12.5%", opacity: 0 }}
          animate={{
            left: ["12.5%", "50%", "87.5%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            times: [0, 0.5, 1],
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.6,
          }}
        />
      ))}
    </div>
  )
}
