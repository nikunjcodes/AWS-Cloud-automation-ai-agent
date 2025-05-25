import type React from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  from?: string
  to?: string
  direction?: "to-r" | "to-l" | "to-t" | "to-b" | "to-tr" | "to-tl" | "to-br" | "to-bl"
}

export function GradientText({
  children,
  className,
  from = "primary",
  to = "primary/70",
  direction = "to-r",
}: GradientTextProps) {
  return (
    <span
      className={cn("bg-clip-text text-transparent", `bg-gradient-${direction}`, `from-${from}`, `to-${to}`, className)}
    >
      {children}
    </span>
  )
}
