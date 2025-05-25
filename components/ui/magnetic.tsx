"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MagneticProps {
  children: React.ReactNode
  className?: string
  strength?: number
  radius?: number
  disabled?: boolean
}

export function Magnetic({ children, className, strength = 30, radius = 200, disabled = false }: MagneticProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Update element size on mount and resize
  useEffect(() => {
    if (!ref.current) return

    const updateSize = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect()
        setSize({ width, height })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)

    return () => {
      window.removeEventListener("resize", updateSize)
    }
  }, [])

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return

    const { clientX, clientY } = e
    const { left, top } = ref.current.getBoundingClientRect()

    const centerX = left + size.width / 2
    const centerY = top + size.height / 2

    const distanceX = clientX - centerX
    const distanceY = clientY - centerY
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

    // Only apply effect if cursor is within radius
    if (distance < radius) {
      // Calculate strength based on distance from center (stronger when closer)
      const strengthFactor = 1 - Math.min(distance / radius, 1)
      const magneticX = distanceX * strengthFactor * (strength / 10)
      const magneticY = distanceY * strengthFactor * (strength / 10)

      setPosition({ x: magneticX, y: magneticY })
    } else {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative inline-block", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      {children}
    </motion.div>
  )
}
