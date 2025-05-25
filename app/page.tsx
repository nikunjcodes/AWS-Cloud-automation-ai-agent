"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { WorkflowSection } from "@/components/sections/workflow-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { Cloud } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Bot, User, Send, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

marked.setOptions({
  breaks: true,
  gfm: true,
})

interface Message {
  role: "user" | "system"
  content: string
  timestamp?: Date
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [visibleSection, setVisibleSection] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Welcome! How can I help you with your cloud infrastructure today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [formattedMessages, setFormattedMessages] = useState<{ [key: number]: string }>({})
  const [activeTab, setActiveTab] = useState("services")
  const inputRef = useRef<HTMLInputElement>(null)

  // Refs for scroll animations using react-intersection-observer
  const [heroRef, isHeroInView] = useInView({ threshold: 0.5 })
  const [featuresRef, isFeaturesInView] = useInView({ threshold: 0.3 })
  const [workflowRef, isWorkflowInView] = useInView({ threshold: 0.3 })
  const [pricingRef, isPricingInView] = useInView({ threshold: 0.3 })

  const suggestedQueries = [
    "Deploy a new web application",
    "Optimize my current infrastructure for cost",
    "Generate Terraform code for my infrastructure",
    "Scale my database cluster",
  ]

  useEffect(() => {
    if (isHeroInView) setVisibleSection("hero")
    if (isFeaturesInView) setVisibleSection("features")
    if (isWorkflowInView) setVisibleSection("workflow")
    if (isPricingInView) setVisibleSection("pricing")
  }, [isHeroInView, isFeaturesInView, isWorkflowInView, isPricingInView])

  // Authentication check
  useEffect(() => {
    checkAuth()
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleSuggestedQuery = (query: string) => {
    setInput(query)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          role: "system" as const,
          content: "I understand you want to " + input.toLowerCase() + ". I can help you with that. Let's break this down into steps...",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsTyping(false)
      }, 1000)
    } catch (error) {
      console.error("Failed to send message:", error)
      setIsTyping(false)
    }
  }

  // Format messages with markdown
  useEffect(() => {
    const formatMessages = async () => {
      const formatted: { [key: number]: string } = {}
      for (let i = 0; i < messages.length; i++) {
        const html = await marked(messages[i].content)
        formatted[i] = DOMPurify.sanitize(html)
      }
      setFormattedMessages(formatted)
    }
    formatMessages()
  }, [messages])

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
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} visibleSection={visibleSection} />

      <main className="flex-1">
        <div ref={heroRef}>
          <HeroSection />
        </div>

        <div ref={featuresRef}>
          <FeaturesSection />
        </div>

        <div ref={workflowRef}>
          <WorkflowSection />
        </div>

        <div ref={pricingRef}>
          <PricingSection />
        </div>

        <div className="container max-w-7xl mx-auto py-16">
          <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="services" className="text-lg py-4">Services</TabsTrigger>
              <TabsTrigger value="chat" className="text-lg py-4">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-8 min-h-[800px]">
              <Card className="bg-card/60 border-primary/20">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl">Suggested Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestedQueries.map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start text-left h-auto py-6 px-6 text-lg transition-all duration-300 hover:border-primary hover:bg-primary/5"
                        onClick={() => {
                          handleSuggestedQuery(query)
                          setActiveTab("chat")
                        }}
                      >
                        <Sparkles className="h-5 w-5 mr-3 text-primary" />
                        {query}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 border-primary/20">
                <CardHeader className="p-6 border-b border-border/50">
                  <CardTitle className="text-2xl flex items-center">
                    <Bot className="mr-3 h-6 w-6 text-primary" />
                    Quick Chat
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Need help? Chat with our AI assistant right here
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="min-h-[500px] rounded-lg border border-border/50 p-6 bg-background/50">
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-6">
                          {messages.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`flex items-start gap-4 max-w-[85%] ${
                                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                                } rounded-lg p-4 shadow-sm ${
                                  message.role === "user" ? "" : "border border-border"
                                } ${message.role === "user" ? "rounded-tr-none" : "rounded-tl-none"}`}
                              >
                                <div
                                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                                    message.role === "user" ? "bg-primary-foreground/20" : "bg-primary/20"
                                  }`}
                                >
                                  {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                </div>
                                <div
                                  className="text-base prose prose-sm dark:prose-invert max-w-none break-words"
                                  dangerouslySetInnerHTML={{ __html: formattedMessages[index] || "" }}
                                />
                              </div>
                            </motion.div>
                          ))}
                          {isTyping && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex justify-start"
                            >
                              <div className="flex items-center space-x-3 bg-card rounded-lg p-4 shadow-sm border border-border">
                                <div className="flex space-x-1">
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="h-3 w-3 rounded-full bg-primary"
                                  />
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                    className="h-3 w-3 rounded-full bg-primary"
                                  />
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                    className="h-3 w-3 rounded-full bg-primary"
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">AI is thinking...</span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                      }}
                      className="flex items-center space-x-4"
                    >
                      <div className="relative flex-1">
                        <Input
                          ref={inputRef}
                          placeholder="Type your message..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="pr-12 py-6 text-lg transition-all duration-300 focus:border-primary"
                          disabled={isTyping}
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={isTyping || !input.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full transition-all duration-300 hover:scale-110 bg-primary text-primary-foreground"
                        >
                          {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                          <span className="sr-only">Send</span>
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="min-h-[800px]">
              <Card className="bg-card/60 border-primary/20">
                <CardHeader className="p-6 border-b border-border/50">
                  <CardTitle className="text-2xl flex items-center">
                    <Bot className="mr-3 h-6 w-6 text-primary" />
                    AI Chat Assistant
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Have a detailed conversation with our AI assistant
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="min-h-[600px] rounded-lg border border-border/50 p-6 bg-background/50">
                      <ScrollArea className="h-[600px] pr-4">
                        {/* Chat content will go here */}
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      <ScrollToTop threshold={300} size="md" position="bottom-right" />
    </div>
  )
}
