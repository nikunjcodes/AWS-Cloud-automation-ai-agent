"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimationType = "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "typewriter" | "wave"

interface AnimatedTextProps {
  text: string
  className?: string
  animationType?: AnimationType
  delay?: number
  duration?: number
  once?: boolean
  threshold?: number
  as?: React.ElementType
  textClassName?: string
  staggerChildren?: number
  color?: string
}

export function AnimatedText({
  text,
  className,
  animationType = "fade",
  delay = 0,
  duration = 0.5,
  once = false,
  threshold = 0.1,
  as: Component = "div",
  textClassName,
  staggerChildren = 0.03,
  color,
}: AnimatedTextProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once, threshold })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    } else if (!once) {
      controls.start("hidden")
    }
  }, [isInView, controls, once])

  // Animation variants based on type
  const getVariants = (): Variants => {
    switch (animationType) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration, delay } },
        }
      case "slide-up":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration, delay } },
        }
      case "slide-down":
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { duration, delay } },
        }
      case "slide-left":
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0, transition: { duration, delay } },
        }
      case "slide-right":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0, transition: { duration, delay } },
        }
      case "typewriter":
        return {
          hidden: { width: 0, opacity: 0 },
          visible: {
            width: "100%",
            opacity: 1,
            transition: {
              width: { duration: duration * 2, delay },
              opacity: { duration: duration / 2, delay },
            },
          },
        }
      case "wave":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration, delay } },
        }
    }
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: delay + i * staggerChildren,
        duration: duration / 2,
      },
    }),
  }

  // For wave and typewriter animations
  if (animationType === "wave") {
    return (
      <Component className={cn("overflow-hidden", className)} ref={ref}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren,
              },
            },
          }}
          className={cn("flex", textClassName)}
        >
          {text.split("").map((char, i) => (
            <motion.span key={`${char}-${i}`} custom={i} variants={letterVariants} style={color ? { color } : {}}>
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
      </Component>
    )
  }

  if (animationType === "typewriter") {
    return (
      <Component className={cn("overflow-hidden", className)} ref={ref}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={getVariants()}
          className={cn("whitespace-nowrap overflow-hidden", textClassName)}
          style={color ? { color } : {}}
        >
          {text}
        </motion.div>
      </Component>
    )
  }

  // Default animation
  return (
    <Component className={className} ref={ref}>
      <motion.div
        initial="hidden"
        animate={controls}
        variants={getVariants()}
        className={textClassName}
        style={color ? { color } : {}}
      >
        {text}
      </motion.div>
    </Component>
  )
}
