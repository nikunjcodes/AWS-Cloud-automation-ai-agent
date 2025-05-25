"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface IntersectionObserverProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  animateWhenInView?: boolean
  animationVariants?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "none"
  delay?: number
  duration?: number
  onIntersect?: (isIntersecting: boolean) => void
}

export function IntersectionObserver({
  children,
  className,
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = false,
  animateWhenInView = true,
  animationVariants = "fade",
  delay = 0,
  duration = 0.5,
  onIntersect,
}: IntersectionObserverProps) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
    onChange: onIntersect,
  })

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      y: animationVariants === "slide-up" ? 20 : animationVariants === "slide-down" ? -20 : 0,
      x: animationVariants === "slide-left" ? 20 : animationVariants === "slide-right" ? -20 : 0,
      scale: animationVariants === "zoom" ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: "easeOut",
      },
    },
  }

  if (animateWhenInView && animationVariants !== "none") {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
