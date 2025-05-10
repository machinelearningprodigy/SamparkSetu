"use client"

import { useEffect, useRef } from "react"

interface Snowflake {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  wind: number
}

export function SnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create snowflakes
    const snowflakes: Snowflake[] = []
    const snowflakeCount = Math.floor(window.innerWidth / 10) // Adjust density based on screen width

    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.6 + 0.3,
        wind: Math.random() * 0.5 - 0.25,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update snowflakes
      snowflakes.forEach((flake) => {
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`
        ctx.fill()

        // Update position
        flake.y += flake.speed
        flake.x += flake.wind

        // Reset if off screen
        if (flake.y > canvas.height) {
          flake.y = -5
          flake.x = Math.random() * canvas.width
        }

        if (flake.x > canvas.width) {
          flake.x = 0
        } else if (flake.x < 0) {
          flake.x = canvas.width
        }
      })

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" style={{ opacity: 0.7 }} />
}
