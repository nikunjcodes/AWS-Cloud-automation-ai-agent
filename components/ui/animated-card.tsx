"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "none"
  glowColor?: string
  children: React.ReactNode
  interactive?: boolean
}

export function AnimatedCard({
  className,
  hoverEffect = "lift",
  glowColor = "rgba(var(--primary), 0.3)",
  children,
  interactive = true,
  ...props
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !interactive) return

    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const cardVariants = {
    initial: {
      scale: 1,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      border: "1px solid var(--border)",
    },
    hover: {
      scale: hoverEffect === "scale" || hoverEffect === "lift" ? 1.02 : 1,
      boxShadow: hoverEffect === "lift" ? "0 10px 25px rgba(0, 0, 0, 0.1)" : "0 0 0 rgba(0, 0, 0, 0)",
      border: hoverEffect === "border" ? "1px solid var(--primary)" : "1px solid var(--border)",
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative overflow-hidden", className)}
      initial="initial"
      whileHover={interactive ? "hover" : "initial"}
      animate={isHovered ? "hover" : "initial"}
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {hoverEffect === "glow" && isHovered && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor} 0%, transparent 70%)`,
            width: "150%",
            height: "150%",
            left: "-25%",
            top: "-25%",
            opacity: 0.6,
            zIndex: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <Card className={cn("bg-transparent border-none shadow-none", className)} {...props}>
        {children}
      </Card>
    </motion.div>
  )
}

export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
