"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface ParallaxLayerProps {
  children: React.ReactNode
  className?: string
  speed?: number
  direction?: "up" | "down" | "left" | "right"
  offset?: number
  zIndex?: number
  startScroll?: number
  endScroll?: number
}

export function ParallaxLayer({
  children,
  className,
  speed = 0.5,
  direction = "up",
  offset = 0,
  zIndex = 0,
  startScroll = 0,
  endScroll = 1,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [elementTop, setElementTop] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  const { scrollY } = useScroll()

  // Calculate element position on mount and resize
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updatePosition = () => {
      const rect = element.getBoundingClientRect()
      setElementTop(rect.top + window.scrollY)
      setClientHeight(window.innerHeight)
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    return () => window.removeEventListener("resize", updatePosition)
  }, [])

  // Calculate parallax values
  const getParallaxValue = () => {
    if (direction === "up" || direction === "down") {
      const directionMultiplier = direction === "up" ? -1 : 1
      return [offset, offset + speed * 100 * directionMultiplier]
    } else {
      const directionMultiplier = direction === "left" ? -1 : 1
      return [offset, offset + speed * 100 * directionMultiplier]
    }
  }

  // Calculate input range based on element position
  const getInputRange = () => {
    return [elementTop - clientHeight * startScroll, elementTop + clientHeight * endScroll]
  }

  // Create transform values based on direction
  const transformValue = useTransform(scrollY, getInputRange(), getParallaxValue())

  const transformStyle = () => {
    if (direction === "up" || direction === "down") {
      return { y: transformValue }
    } else {
      return { x: transformValue }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        ...transformStyle(),
        zIndex,
      }}
    >
      {children}
    </motion.div>
  )
}
