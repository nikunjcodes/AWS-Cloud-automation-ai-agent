"use client"

import { useState } from "react"

import { useRef } from "react"

import type * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  animationEffect?: "pulse" | "bounce" | "shine" | "expand" | "none"
  delay?: number
  children: React.ReactNode
}

export function AnimatedButton({
  className,
  animationEffect = "pulse",
  delay = 0,
  children,
  ...props
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Animation variants
  const pulseVariants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  }

  const bounceVariants = {
    initial: { y: 0 },
    animate: { y: [0, -5, 0], transition: { duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 4 } },
    hover: { y: -5, transition: { duration: 0.2 } },
  }

  const expandVariants = {
    initial: { scale: 1 },
    animate: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
  }

  // Select the appropriate animation variant
  const getVariant = () => {
    switch (animationEffect) {
      case "pulse":
        return pulseVariants
      case "bounce":
        return bounceVariants
      case "expand":
        return expandVariants
      default:
        return { initial: {}, animate: {}, hover: {} }
    }
  }

  const variants = getVariant()

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={variants}
      transition={{ delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Button
        ref={buttonRef}
        className={cn("relative overflow-hidden", animationEffect === "shine" && "group", className)}
        {...props}
      >
        {animationEffect === "shine" && isHovered && (
          <motion.span
            className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  )
}
