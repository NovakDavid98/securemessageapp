"use client"

import { useEffect, useRef } from "react"

export function MatrixBackground() {
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

    // Matrix characters - taken from the original movie
    const characters =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const charArray = characters.split("")

    // Set up columns
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)

    // Array to track the y position of each column
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100 // Start above the canvas
    }

    // Drawing the characters
    const draw = () => {
      // Black with opacity to create fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set color and font
      ctx.fillStyle = "#0f0" // Bright green
      ctx.font = `${fontSize}px monospace`

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = charArray[Math.floor(Math.random() * charArray.length)]

        // Draw the character
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Add glow effect to some characters
        if (Math.random() > 0.975) {
          ctx.fillStyle = "#7cffcb" // Brighter emerald for glow
          ctx.shadowBlur = 10
          ctx.shadowColor = "#0f0"
        } else {
          // Vary the green color slightly
          const green = 128 + Math.floor(Math.random() * 128)
          ctx.fillStyle = `rgba(0, ${green}, 0, 0.8)`
          ctx.shadowBlur = 0
        }

        ctx.fillText(char, x, y)

        // Reset when off screen and randomize speed
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Increment y coordinate
        drops[i]++
      }
    }

    // Animation loop
    const interval = setInterval(draw, 33) // ~30 fps

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" style={{ opacity: 0.5 }} />
}

