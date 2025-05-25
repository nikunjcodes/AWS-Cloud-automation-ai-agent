"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScrollToTopProps {
  className?: string
  threshold?: number
  size?: "sm" | "md" | "lg"
  position?: "bottom-right" | "bottom-left" | "bottom-center"
  icon?: React.ReactNode
  showLabel?: boolean
  label?: string
}

export function ScrollToTop({
  className,
  threshold = 300,
  size = "md",
  position = "bottom-right",
  icon,
  showLabel = false,
  label = "Back to top",
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4 md:bottom-8 md:right-8",
    "bottom-left": "bottom-4 left-4 md:bottom-8 md:left-8",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 md:bottom-8",
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className={cn(
            "fixed z-50 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50",
            sizeClasses[size],
            positionClasses[position],
            showLabel && "px-4 rounded-full",
            className,
          )}
          aria-label="Scroll to top"
        >
          {icon || <ArrowUp className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5")} />}
          {showLabel && <span className="ml-2 text-sm font-medium">{label}</span>}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
