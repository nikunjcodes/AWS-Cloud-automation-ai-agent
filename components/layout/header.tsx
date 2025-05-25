"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Cloud, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { ScrollIndicator } from "@/components/ui/scroll-indicator"
import { Magnetic } from "@/components/ui/magnetic"
import { GradientText } from "@/components/ui/gradient-text"

interface HeaderProps {
  isAuthenticated?: boolean
  onLogout?: () => Promise<void>
  visibleSection?: string
}

export function Header({ isAuthenticated = false, onLogout, visibleSection }: HeaderProps) {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Navigation items
  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
  ]

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle logout
  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    } else {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        })
        router.push("/login")
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }
  }

  return (
    <>
      <ScrollIndicator />
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "border-b bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent",
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <Magnetic strength={20}>
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-75 blur-sm"></div>
                <div className="relative bg-background rounded-full p-1">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
              </div>
              <GradientText className="text-xl font-bold">Cloud Navigator</GradientText>
            </Link>
          </Magnetic>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => scrollToSection(item.href.substring(1))}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative",
                  visibleSection === item.href.substring(1) && "text-primary",
                )}
              >
                {item.label}
                {visibleSection === item.href.substring(1) && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    layoutId="navIndicator"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="default" size="sm" className="shadow-sm">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="default"
                    size="sm"
                    className="shadow-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    Sign up
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t bg-background/95 backdrop-blur-md"
            >
              <div className="container py-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => scrollToSection(item.href.substring(1))}
                    className={cn(
                      "py-2 text-sm font-medium transition-colors hover:text-primary",
                      visibleSection === item.href.substring(1) && "text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link href="/login" className="py-2 text-sm font-medium">
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
