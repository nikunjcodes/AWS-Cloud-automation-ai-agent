"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Cloud,
  Code2,
  Database,
  Server,
  Settings,
  Zap,
  CheckCircle,
  ChevronRight,
  Menu,
  X,
  MoonIcon,
  SunIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Image from "next/image"

// ThemeToggle Component
function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

// Enhanced Tabs Components
const EnhancedTabsTrigger = ({ className, showIndicator = false, children, ...props }) => (
  <TabsTrigger
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm relative",
      className,
    )}
    {...props}
  >
    {children}
    {showIndicator && (
      <motion.div
        layoutId="tabIndicator"
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
    )}
  </TabsTrigger>
)

const EnhancedTabsContent = ({ className, animate = true, children, ...props }) => {
  const content = (
    <TabsContent
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
    </TabsContent>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}

// Section Components
const Section = ({ children, className, id, ...props }) => (
  <section id={id} className={cn("py-12 md:py-16 lg:py-20 w-full relative", className)} {...props}>
    {children}
  </section>
)

const SectionTitle = ({ children, className, ...props }) => (
  <h2 className={cn("text-3xl font-bold tracking-tighter md:text-4xl/tight", className)} {...props}>
    {children}
  </h2>
)

const SectionDescription = ({ children, className, ...props }) => (
  <p className={cn("max-w-[900px] text-xl text-muted-foreground", className)} {...props}>
    {children}
  </p>
)

// Main Home Component
export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeFeature, setActiveFeature] = useState(0)
  const [visibleSection, setVisibleSection] = useState("")
  const [activeTab, setActiveTab] = useState("requirements")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Refs for scroll animations
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const workflowRef = useRef(null)
  const pricingRef = useRef(null)

  // Check if sections are in view
  const { ref: heroViewRef, inView: isHeroInView } = useInView({ once: false, amount: 0.5 })
  const { ref: featuresViewRef, inView: isFeaturesInView } = useInView({ once: false, amount: 0.3 })
  const { ref: workflowViewRef, inView: isWorkflowInView } = useInView({ once: false, amount: 0.3 })
  const { ref: pricingViewRef, inView: isPricingInView } = useInView({ once: false, amount: 0.3 })

  // Scroll animation values
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.5])
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95])

  // Update visible section based on scroll
  useEffect(() => {
    if (isHeroInView) setVisibleSection("hero")
    if (isFeaturesInView) setVisibleSection("features")
    if (isWorkflowInView) setVisibleSection("workflow")
    if (isPricingInView) setVisibleSection("pricing")
  }, [isHeroInView, isFeaturesInView, isWorkflowInView, isPricingInView])

  // Feature rotation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Authentication check
  useEffect(() => {
    checkAuth()
  }, [])

  // Handle scroll events for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      })
      const data = await response.json()
      setIsAuthenticated(data.isAuthenticated)
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Smooth scroll to section
  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setIsAuthenticated(false)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Navigation items
  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
  ]

  // Feature cards data
  const features = [
    {
      icon: <Cloud className="h-10 w-10" />,
      title: "Automated Provisioning",
      description: "Intelligent resource allocation based on your requirements",
      details: "Our AI analyzes your needs and automatically provisions the optimal AWS resources for your workload.",
    },
    {
      icon: <Code2 className="h-10 w-10" />,
      title: "Infrastructure as Code",
      description: "Terraform-based deployments with version control",
      details: "All infrastructure changes are managed through code, ensuring consistency and reproducibility.",
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Cost Optimization",
      description: "Continuous monitoring and resource optimization",
      details: "Our platform constantly analyzes your usage patterns to recommend cost-saving measures.",
    },
  ]

  // Workflow steps data
  const workflowSteps = [
    {
      id: "requirements",
      title: "Requirement Gathering",
      description:
        "Describe your business requirements to our AI agent using natural language. No need for technical specifications.",
      step: 1,
      color: "primary",
      icon: <Settings className="h-16 w-16 text-primary" />,
      content: (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50 shadow-sm">
          <p className="text-sm font-mono text-foreground/90">
            "I need a scalable web application with a database backend that can handle 10,000 concurrent users."
          </p>
        </div>
      ),
    },
    {
      id: "analysis",
      title: "Requirement Analysis",
      description: "Our AI analyzes your requirements and selects the appropriate AWS services to meet your needs.",
      step: 2,
      color: "green-500",
      icon: <Database className="h-16 w-16 text-green-500" />,
      content: (
        <div className="space-y-3">
          {[
            "EC2 Auto Scaling Group for web servers",
            "RDS Aurora for database",
            "Elastic Load Balancer for traffic distribution",
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm">{item}</p>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      id: "plan",
      title: "Deployment Plan",
      description:
        "The AI creates a structured deployment plan with detailed resource specifications and cost estimates.",
      step: 3,
      color: "yellow-500",
      icon: <Code2 className="h-16 w-16 text-yellow-500" />,
      content: (
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <pre className="text-xs overflow-auto">
            <code className="language-terraform">
              {`module "web_app" {
  source = "terraform-aws-modules/ec2-instance/aws"
  instance_type = "t3.large"
  min_size = 2
  max_size = 10
  ...
}`}
            </code>
          </pre>
        </div>
      ),
    },
    {
      id: "confirmation",
      title: "User Confirmation",
      description: "Review and approve the deployment plan. Set up your AWS account credentials securely.",
      step: 4,
      color: "purple-500",
      icon: <Settings className="h-16 w-16 text-purple-500" />,
      content: (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="default" className="bg-purple-500 hover:bg-purple-600 text-white">
            Approve Plan
          </Button>
          <Button variant="outline" className="border-purple-500/30 text-purple-500 hover:bg-purple-500/10">
            Request Changes
          </Button>
        </div>
      ),
    },
    {
      id: "deployment",
      title: "Automated Deployment",
      description: "The AI automates the deployment process using AWS tools and Infrastructure as Code.",
      step: 5,
      color: "orange-500",
      icon: <Cloud className="h-16 w-16 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <div className="w-full bg-muted/30 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Deployment Progress</span>
              <span className="text-sm">75%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "75%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { text: "Creating VPC and subnets", status: "complete" },
              { text: "Configuring security groups", status: "complete" },
              { text: "Launching EC2 instances", status: "in-progress" },
              { text: "Setting up database", status: "pending" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.status === "complete" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : step.status === "in-progress" ? (
                  <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    step.status === "complete"
                      ? "text-green-500"
                      : step.status === "in-progress"
                        ? "text-orange-500"
                        : "text-muted-foreground",
                  )}
                >
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "management",
      title: "Ongoing Management",
      description: "Securely monitor and manage your infrastructure with automated backups and optimization.",
      step: 6,
      color: "red-500",
      icon: <Server className="h-16 w-16 text-red-500" />,
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "CPU Usage", value: "24%", trend: "down" },
            { label: "Memory", value: "1.2 GB", trend: "up" },
            { label: "Storage", value: "42 GB", trend: "stable" },
            { label: "Network", value: "156 Mbps", trend: "up" },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    metric.trend === "up" ? "bg-green-500" : metric.trend === "down" ? "bg-red-500" : "bg-yellow-500",
                  )}
                />
              </div>
              <p className="text-xl font-bold">{metric.value}</p>
            </motion.div>
          ))}
        </div>
      ),
    },
  ]

  // Pricing plans data
  const pricingPlans = [
    {
      title: "Starter",
      description: "For small projects and teams",
      price: "$49",
      features: [
        { text: "Up to 5 deployments", included: true },
        { text: "Basic AI assistance", included: true },
        { text: "Standard support", included: true },
        { text: "Cost optimization", included: false },
      ],
      popular: false,
      buttonText: "Get Started",
    },
    {
      title: "Professional",
      description: "For growing businesses",
      price: "$149",
      features: [
        { text: "Up to 20 deployments", included: true },
        { text: "Advanced AI assistance", included: true },
        { text: "Priority support", included: true },
        { text: "Cost optimization", included: true },
      ],
      popular: true,
      buttonText: "Get Started",
    },
    {
      title: "Enterprise",
      description: "For large organizations",
      price: "$499",
      features: [
        { text: "Unlimited deployments", included: true },
        { text: "Premium AI assistance", included: true },
        { text: "24/7 dedicated support", included: true },
        { text: "Advanced cost optimization", included: true },
      ],
      popular: false,
      buttonText: "Contact Sales",
    },
  ]

  // Footer columns data
  const footerColumns = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Integrations", "Changelog", "Documentation"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Press", "Partners"],
    },
    {
      title: "Resources",
      links: ["Community", "Contact", "Support", "FAQ", "Privacy Policy"],
    },
  ]

  // Social media links
  const socialLinks = ["twitter", "github", "linkedin", "youtube"]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Cloud className="h-12 w-12 text-primary animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-primary animate-spin opacity-75"></div>
          </div>
          <p className="text-lg font-medium animate-pulse">Loading Cloud Navigator...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header with Glassmorphism */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "border-b bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent",
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-75 blur-sm"></div>
              <div className="relative bg-background rounded-full p-1">
                <Cloud className="h-6 w-6 text-primary" />
              </div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Cloud Navigator
            </span>
          </div>

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

      <main className="flex-1">
        {/* Hero Section with Parallax Effect */}
        <section
          id="hero"
          ref={(el) => {
            heroRef.current = el
            heroViewRef(el)
          }}
          className="relative w-full py-8 md:py-12 lg:py-16 overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] opacity-50 pointer-events-none"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="container px-4 md:px-6 relative z-10"
            style={{ opacity: heroOpacity, scale: heroScale }}
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <motion.div
                className="flex flex-col justify-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Badge
                  variant="outline"
                  className="w-fit px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20"
                >
                  Next-Gen Cloud Automation
                </Badge>

                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    AI-Driven Cloud Automation
                  </h1>
                  <p className="max-w-[600px] text-xl text-muted-foreground">
                    Automate resource provisioning, deployment, and service management with our intelligent cloud
                    orchestration platform.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </Button>
                  </Link>
                  <Link href="/learn">
                    <Button
                      size="lg"
                      variant="outline"
                      className="group border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
                        Learn More
                      </span>
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden"
                        style={{ zIndex: 5 - i }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10"></div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">1,200+</span> companies using Cloud Navigator
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-60 z-10 pointer-events-none"></div>
                  <img
                    src="/images/image.jpg"
                    alt="Cloud Navigator Platform"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
        </section>

        {/* Features Section with Staggered Animation */}
        <Section
          id="features"
          ref={(el) => {
            featuresRef.current = el
            featuresViewRef(el)
          }}
          className="w-full py-20 md:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

          <div className="container space-y-4 px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center justify-center space-y-3 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Key Features
                </div>
                <SectionTitle>Intelligent Cloud Orchestration</SectionTitle>
                <SectionDescription>
                  Our platform leverages LLMs and Infrastructure-as-Code to optimize your cloud deployments
                </SectionDescription>
              </div>
            </motion.div>

            <div className="mx-auto grid max-w-5xl items-center gap-6 py-6 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg",
                    activeFeature === index
                      ? "border-primary/50 shadow-md shadow-primary/10"
                      : "border-border hover:border-primary/30",
                  )}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div
                      className={cn(
                        "mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300",
                        activeFeature === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary group-hover:bg-primary/20",
                      )}
                    >
                      {feature.icon}
                    </div>

                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="mb-4 text-muted-foreground">{feature.description}</p>

                    <div className="mt-6 flex items-center text-sm font-medium text-primary">
                      <span>Learn more</span>
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mx-auto max-w-5xl rounded-2xl border bg-card/50 p-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">Trusted by Industry Leaders</h3>
                  <p className="text-muted-foreground mb-6">
                    Join hundreds of companies that trust Cloud Navigator to manage their cloud infrastructure
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-12 rounded-md bg-muted/50 flex items-center justify-center">
                        <div className="w-24 h-6 bg-muted/70 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl opacity-70"></div>
                    <div className="relative bg-card rounded-full p-4 shadow-xl">
                      <div className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                        98%
                      </div>
                      <div className="text-sm text-center text-muted-foreground mt-1">Cost Reduction</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* Workflow Section with Interactive Tabs */}
        <Section
          id="workflow"
          ref={(el) => {
            workflowRef.current = el
            workflowViewRef(el)
          }}
          className="w-full py-20 md:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={isWorkflowInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Streamlined Process
                </div>
                <SectionTitle>How It Works</SectionTitle>
                <SectionDescription>
                  Our streamlined process makes cloud automation simple and efficient
                </SectionDescription>
              </div>
            </motion.div>

            <motion.div
              className="mx-auto max-w-5xl items-center gap-6"
              initial={{ opacity: 0 }}
              animate={isWorkflowInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <Tabs defaultValue="requirements" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 p-1 bg-background/80 backdrop-blur-sm border rounded-full shadow-sm">
                  {workflowSteps.map((step, index) => (
                    <EnhancedTabsTrigger
                      key={step.id}
                      value={step.id}
                      showIndicator={step.id === activeTab}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full transition-all duration-300 data-[state=active]:shadow-md relative z-10 px-4 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="hidden md:flex h-5 w-5 items-center justify-center rounded-full bg-background/20">
                          {step.step}
                        </div>
                        <span className="capitalize">{step.id}</span>
                      </div>
                    </EnhancedTabsTrigger>
                  ))}
                </TabsList>

                <div className="relative mt-8">
                  <AnimatePresence mode="wait">
                    {workflowSteps.map(
                      (step) =>
                        activeTab === step.id && (
                          <EnhancedTabsContent
                            key={step.id}
                            value={step.id}
                            className="relative rounded-2xl border bg-background/95 backdrop-blur-sm shadow-lg"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-2xl"></div>
                            <div className="flex flex-col md:flex-row">
                              <div className="flex-1 p-8">
                                <div
                                  className={`inline-flex items-center rounded-full bg-${step.color}/10 px-3 py-1 text-sm font-medium text-${step.color} mb-4`}
                                >
                                  Step {step.step}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                                <p className="text-muted-foreground mb-6">{step.description}</p>
                                {step.content}
                              </div>
                              <div className="flex-1 bg-muted/30 backdrop-blur-sm flex items-center justify-center p-8">
                                <div className="relative">
                                  <div
                                    className={`absolute -inset-4 rounded-full bg-${step.color}/20 blur-xl opacity-50`}
                                  ></div>
                                  <div
                                    className={`relative w-32 h-32 rounded-full bg-${step.color}/10 flex items-center justify-center`}
                                  >
                                    {step.icon}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </EnhancedTabsContent>
                        ),
                    )}
                  </AnimatePresence>
                </div>
              </Tabs>
            </motion.div>
          </div>
        </Section>

        {/* Pricing Section with Hover Effects */}
        <Section
          id="pricing"
          ref={(el) => {
            pricingRef.current = el
            pricingViewRef(el)
          }}
          className="w-full py-20 md:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Simple Pricing
                </div>
                <SectionTitle>Ready to Automate Your Cloud Infrastructure?</SectionTitle>
                <SectionDescription>Get started with our AI-driven cloud automation platform today</SectionDescription>
              </div>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3 lg:gap-12 mt-8">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
                >
                  <Card
                    className={cn(
                      "relative overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group",
                      plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/50",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                        plan.popular ? "from-primary/10 to-primary/5" : "from-primary/5 to-transparent",
                      )}
                    />

                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                        Popular
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.title}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">/month</span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3 text-sm">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            {feature.included ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 mr-2">
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                              </div>
                            ) : (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted mr-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
                              </div>
                            )}
                            <span className={feature.included ? "" : "text-muted-foreground"}>{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className={cn(
                          "w-full transition-all duration-300",
                          plan.popular
                            ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                            : "bg-card hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30",
                        )}
                      >
                        {plan.buttonText}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex flex-col items-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Now
                      <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
                      Contact Sales
                    </span>
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>14-day free trial</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>
      </main>

      {/* Footer with Gradient Border */}
      <footer className="w-full border-t bg-card/80 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="container flex flex-col py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-75 blur-sm"></div>
                  <div className="relative bg-background rounded-full p-1">
                    <Cloud className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Cloud Navigator
                </span>
              </div>
              <p className="text-sm text-muted-foreground">AI-driven cloud automation platform for modern businesses</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social}
                    href={`#${social}`}
                    className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="h-4 w-4 rounded-full bg-muted" />
                  </Link>
                ))}
              </div>
            </div>

            {footerColumns.map((column, i) => (
              <div key={i} className="space-y-4">
                <h3 className="text-sm font-medium">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link
                        href={`#${link.toLowerCase()}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Cloud Navigator. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollYProgress.get() > 0.1 ? 1 : 0 }}
        className="fixed bottom-4 right-4 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50 hover:bg-primary/90"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowRight className="h-5 w-5 rotate-[-90deg]" />
      </motion.button>
    </div>
  )
}
