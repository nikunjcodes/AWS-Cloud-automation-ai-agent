"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

interface ScrollIndicatorProps {
  className?: string
  barClassName?: string
  height?: number
  color?: string
  position?: "top" | "bottom"
  showPercentage?: boolean
  percentageClassName?: string
}

export function ScrollIndicator({
  className,
  barClassName,
  height = 3,
  color,
  position = "top",
  showPercentage = false,
  percentageClassName,
}: ScrollIndicatorProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      setPercentage(Math.round(value * 100))
    })
    return unsubscribe
  }, [scrollYProgress])

  return (
    <div className={cn("fixed left-0 right-0 z-50", position === "top" ? "top-0" : "bottom-0", className)}>
      <motion.div
        className={cn("origin-left", barClassName)}
        style={{
          scaleX,
          height,
          backgroundColor: color || "var(--primary)",
        }}
      />
      {showPercentage && (
        <div
          className={cn(
            "absolute right-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium",
            position === "top" ? "top-2" : "bottom-2",
            percentageClassName,
          )}
        >
          {percentage}%
        </div>
      )}
    </div>
  )
}
