import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  id?: string
}

export const Section = forwardRef<HTMLElement, SectionProps>(({ children, className, ...props }, ref) => {
  return (
    <section ref={ref} className={cn("py-16 md:py-24 lg:py-32 w-full relative", className)} {...props}>
      {children}
    </section>
  )
})
Section.displayName = "Section"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  centered?: boolean
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ children, className, centered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4 mb-12 md:mb-16", centered && "text-center flex flex-col items-center", className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
SectionHeader.displayName = "SectionHeader"

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export const SectionTitle = forwardRef<HTMLHeadingElement, SectionTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h2 ref={ref} className={cn("text-3xl font-bold tracking-tighter md:text-4xl/tight", className)} {...props}>
        {children}
      </h2>
    )
  },
)
SectionTitle.displayName = "SectionTitle"

interface SectionDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export const SectionDescription = forwardRef<HTMLParagraphElement, SectionDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("max-w-[900px] text-xl text-muted-foreground", className)} {...props}>
        {children}
      </p>
    )
  },
)
SectionDescription.displayName = "SectionDescription"

interface SectionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const SectionBadge = forwardRef<HTMLDivElement, SectionBadgeProps>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SectionBadge.displayName = "SectionBadge"
