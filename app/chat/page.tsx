"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  Bot,
  Cloud,
  Code2,
  Database,
  FileText,
  Send,
  Server,
  User,
  LogOut,
  Plus,
  Trash2,
  Loader2,
  MessageSquare,
  PanelRight,
  PanelLeft,
  Sparkles,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { motion, AnimatePresence } from "framer-motion"

marked.setOptions({
  breaks: true,
  gfm: true,
})

interface Chat {
  _id: string
  title: string
  updatedAt: string
}

interface Message {
  role: "user" | "system"
  content: string
  timestamp?: Date
}

interface UserProfile {
  _id: string
  name: string
  email: string
  awsRoleArn?: string | null
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Welcome back! How can I help with your AWS infrastructure today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<string | null>(null)
  const [formattedMessages, setFormattedMessages] = useState<{ [key: number]: string }>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [highlightedService, setHighlightedService] = useState<string | null>(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  useEffect(() => {
    const formatMessages = async () => {
      const formatted: { [key: number]: string } = {}
      for (let i = 0; i < messages.length; i++) {
        const html = await marked(messages[i].content, {
          breaks: true,
          gfm: true,
        })
        formatted[i] = DOMPurify.sanitize(html)
      }
      setFormattedMessages(formatted)
    }
    formatMessages()
  }, [messages])

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setUserProfile(data.user)
      } else {
        console.error("Failed to load user profile:", data.message)
      }
    } catch (err) {
      console.error("Failed to load user profile:", err)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setMessages(data.chat.messages)
        setCurrentChat(chatId)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: "New Conversation" }),
      })
      const data = await response.json()
      if (data.success) {
        setChats([data.chat, ...chats])
        setCurrentChat(data.chat._id)
        setMessages([
          {
            role: "system",
            content: "Welcome to Cloud Navigator Assistant. How can I help you with your cloud infrastructure today?",
          },
        ])

        // Focus on input after creating a new chat
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setChats(chats.filter((chat) => chat._id !== chatId))
        if (currentChat === chatId) {
          setCurrentChat(null)
          setMessages([
            {
              role: "system",
              content: "Welcome to Cloud Navigator Assistant. How can I help you with your cloud infrastructure today?",
            },
          ])
        }

        toast({
          title: "Chat deleted",
          description: "The conversation has been removed",
        })
      }
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, formattedMessages])

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
      let chatId = currentChat

      if (!chatId) {
        const newChatResponse = await fetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ title: "New Conversation" }),
        })
        const newChatData = await newChatResponse.json()
        if (newChatData.success) {
          chatId = newChatData.chat._id
          setChats([newChatData.chat, ...chats])
          setCurrentChat(chatId)
        } else {
          throw new Error("Failed to create new chat")
        }
      }

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: input }),
      })

      const data = await response.json()
      if (data.success) {
        setMessages((prev) => [...prev, data.message])

        const responseText = data.message.content.toLowerCase()
        if (responseText.includes("ec2")) {
          setHighlightedService("EC2")
        } else if (responseText.includes("rds")) {
          setHighlightedService("RDS")
        } else if (responseText.includes("s3")) {
          setHighlightedService("S3")
        } else {
          setHighlightedService(null)
        }

        if (messages.length === 1) {
          const updatedChats = chats.map((chat) => (chat._id === chatId ? { ...chat, title: data.title } : chat))
          setChats(updatedChats)
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
      // Focus back on input after sending
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQueries = [
    "Deploy a new web application",
    "Optimize my current infrastructure for cost",
    "Generate Terraform code for my infrastructure",
    "Scale my database cluster",
  ]

  const handleSuggestedQuery = (query: string) => {
    setInput(query)
    inputRef.current?.focus()

    toast({
      title: "Suggestion selected",
      description: `"${query}" added to input`,
    })
  }

  const handleUseTemplate = (template: string) => {
    toast({
      title: "Template selected",
      description: `${template} template will be used for your deployment`,
    })
  }

  const handleLogout = async () => {
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

  const services = [
    {
      name: "EC2",
      description: "Elastic Compute Cloud",
      icon: Server,
      path: "/ec2",
      color: "bg-blue-500/10 hover:bg-blue-500/20",
      borderColor: "border-blue-500/20 hover:border-blue-500/40",
    },
    {
      name: "RDS",
      description: "Relational Database Service",
      icon: Database,
      path: "/rds",
      color: "bg-green-500/10 hover:bg-green-500/20",
      borderColor: "border-green-500/20 hover:border-green-500/40",
    },
    {
      name: "S3",
      description: "Simple Storage Service",
      icon: FileText,
      path: "/s3",
      color: "bg-orange-500/10 hover:bg-orange-500/20",
      borderColor: "border-orange-500/20 hover:border-orange-500/40",
    },
    {
      name: "Aws S3",
      description: "Deploy Static Websites",
      icon: Cloud,
      path: "/deploy",
      color: "bg-purple-500/10 hover:bg-purple-500/20",
      borderColor: "border-purple-500/20 hover:border-purple-500/40",
    },
    {
      name: "Aws Amplify",
      description: "Deploy Applications from Github",
      icon: Code2,
      path: "/amplify",
      color: "bg-pink-500/10 hover:bg-pink-500/20",
      borderColor: "border-pink-500/20 hover:border-pink-500/40",
    },
  ]

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium animate-pulse">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!userProfile?.awsRoleArn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-background/80">
        <Card className="max-w-xl w-full shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">AWS Setup Required</CardTitle>
            <CardDescription className="text-center text-lg">
              To use the AI Assistant, you need to set up your AWS account first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-amber-100 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-center text-amber-800 dark:text-amber-300">
                Please complete the AWS setup process to start using the AI Assistant.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => router.push("/onboarding/aws-account")}
                size="lg"
                className="transition-all duration-300 hover:scale-105"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to AWS Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background to-background/80">
      {/* Sidebar Toggle Button for Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-4 z-50 md:hidden shadow-lg bg-background/80 backdrop-blur-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 bg-card border-r border-border/50 shadow-lg flex flex-col h-full z-20 absolute md:relative"
          >
            <div className="p-4 border-b border-border/50">
              <Button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <AnimatePresence>
                  {chats.map((chat) => (
                    <motion.div
                      key={chat._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-card/50 border-l-4 transition-all duration-200 ${
                        currentChat === chat._id ? "bg-card/50 border-l-primary" : "border-l-transparent"
                      }`}
                      onClick={() => loadMessages(chat._id)}
                    >
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium">{chat.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(chat._id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {chats.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new chat to begin</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="p-4 border-t border-border/50 mt-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium truncate">{userProfile?.name || "User"}</div>
                </div>
                <ThemeToggle />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full transition-all duration-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <Bot className="mr-2 h-6 w-6 text-primary" />
            AI Assistant
          </h2>
          <div className="flex items-center gap-2">
            {!sidebarOpen && <ThemeToggle />}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex transition-all duration-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-auto">
          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span>Services</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-0 space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence>
                  {services.map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: highlightedService === service.name ? 1.05 : 1,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                        delay: index * 0.05,
                      }}
                      className="will-change-transform"
                    >
                      <Card
                        className={`${service.color} ${service.borderColor} transition-all duration-200 cursor-pointer hover:scale-105 ${
                          highlightedService === service.name ? "ring-2 ring-primary shadow-lg" : ""
                        }`}
                        onClick={() => router.push(service.path)}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                          <service.icon
                            className={`h-4 w-4 ${highlightedService === service.name ? "text-primary animate-pulse" : "text-muted-foreground"}`}
                          />
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold">{service.description}</div>
                          <p className="text-xs text-muted-foreground mt-1">Click to manage {service.name} resources</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              <Card className="h-full bg-card/60 border-primary/20 flex flex-col">
                <CardHeader className="p-4 border-b border-border/50 flex-none">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="mr-2 h-5 w-5 text-primary" />
                    Cloud Automation Assistant
                  </CardTitle>

                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6 px-4 py-4">
                      <AnimatePresence initial={false}>
                        {messages.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.2,
                              ease: "easeOut"
                            }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} will-change-transform`}
                          >
                            <div
                              className={`flex items-start gap-3 w-fit max-w-[95%] ${
                                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                              } rounded-lg p-3 shadow-sm ${
                                message.role === "user" ? "" : "border border-border"
                              } transition-all duration-200 hover:shadow-md ${
                                message.role === "user" ? "rounded-tr-none" : "rounded-tl-none"
                              }`}
                            >
                              <div
                                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                                  message.role === "user" ? "bg-primary-foreground/20" : "bg-primary/20"
                                }`}
                              >
                                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                              </div>
                              <div
                                className="text-sm prose prose-sm dark:prose-invert w-full overflow-x-auto break-words [&>pre]:bg-muted [&>pre]:p-2 [&>pre]:rounded [&>pre]:overflow-x-auto [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-4 [&>ol]:ml-4 [&>p]:my-2 [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base [&>code]:bg-muted [&>code]:px-1 [&>code]:rounded"
                                dangerouslySetInnerHTML={{ __html: formattedMessages[index] || "" }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="flex items-start gap-3 max-w-[85%] bg-card rounded-lg p-3 shadow-sm border border-border rounded-tl-none">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <motion.div
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                  }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1,
                                    ease: "easeInOut",
                                  }}
                                  className="h-3 w-3 rounded-full bg-primary will-change-transform"
                                />
                                <motion.div
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                  }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1,
                                    ease: "easeInOut",
                                    delay: 0.2,
                                  }}
                                  className="h-3 w-3 rounded-full bg-primary will-change-transform"
                                />
                                <motion.div
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                  }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1,
                                    ease: "easeInOut",
                                    delay: 0.4,
                                  }}
                                  className="h-3 w-3 rounded-full bg-primary will-change-transform"
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">AI is thinking...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {messages.length === 1 && !isTyping && (
                        <div className="py-8">
                          <div className="text-center mb-6">
                            <h3 className="text-lg font-medium mb-2">Get started with suggested queries</h3>
                            <p className="text-sm text-muted-foreground">
                              Click on any suggestion or type your own question
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {suggestedQueries.map((query, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="justify-start text-left h-auto py-3 transition-all duration-300 hover:border-primary hover:bg-primary/5"
                                onClick={() => handleSuggestedQuery(query)}
                              >
                                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                                {query}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 border-t border-border/50 mt-auto">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend()
                    }}
                    className="flex w-full items-center space-x-2"
                  >
                    <div className="relative flex-1">
                      <Input
                        ref={inputRef}
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pr-12 py-6 transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary"
                        disabled={isTyping}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isTyping || !input.trim()}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full transition-all duration-300 hover:scale-110 bg-primary text-primary-foreground"
                      >
                        {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </form>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="mt-0 space-y-0 h-[calc(100vh-220px)] relative">
              <Card className="h-full bg-card/60 border-primary/20 flex flex-col">
                <CardHeader className="p-4 border-b border-border/50 flex-none">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="mr-2 h-5 w-5 text-primary" />
                    Cloud Automation Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask me anything about cloud infrastructure, deployments, and optimization
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6 px-4 py-4">
                      <AnimatePresence initial={false}>
                        {messages.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.2,
                              ease: "easeOut"
                            }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} will-change-transform`}
                          >
                            <div
                              className={`flex items-start gap-3 w-fit max-w-[95%] ${
                                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                              } rounded-lg p-3 shadow-sm ${
                                message.role === "user" ? "" : "border border-border"
                              } transition-all duration-200 hover:shadow-md ${
                                message.role === "user" ? "rounded-tr-none" : "rounded-tl-none"
                              }`}
                            >
                              <div
                                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                                  message.role === "user" ? "bg-primary-foreground/20" : "bg-primary/20"
                                }`}
                              >
                                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                              </div>
                              <div
                                className="text-sm prose prose-sm dark:prose-invert w-full overflow-x-auto break-words [&>pre]:bg-muted [&>pre]:p-2 [&>pre]:rounded [&>pre]:overflow-x-auto [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-4 [&>ol]:ml-4 [&>p]:my-2 [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base [&>code]:bg-muted [&>code]:px-1 [&>code]:rounded"
                                dangerouslySetInnerHTML={{ __html: formattedMessages[index] || "" }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="flex items-start gap-3 max-w-[85%] bg-card rounded-lg p-3 shadow-sm border border-border rounded-tl-none">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <motion.div
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                  }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1,
                                    ease: "easeInOut",
                                  }}
                                  className="h-3 w-3 rounded-full bg-primary will-change-transform"
                                />
                                <motion.div
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                  }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1,
                                    ease: "easeInOut",
                                    delay: 0.2,
                                  }}
                                  className="h-3 w-3 rounded-full bg-primary will-change-transform"
                                />
                                <motion.div
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                  }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1,
                                    ease: "easeInOut",
                                    delay: 0.4,
                                  }}
                                  className="h-3 w-3 rounded-full bg-primary will-change-transform"
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">AI is thinking...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {messages.length === 1 && !isTyping && (
                        <div className="py-8">
                          <div className="text-center mb-6">
                            <h3 className="text-lg font-medium mb-2">Get started with suggested queries</h3>
                            <p className="text-sm text-muted-foreground">
                              Click on any suggestion or type your own question
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {suggestedQueries.map((query, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="justify-start text-left h-auto py-3 transition-all duration-300 hover:border-primary hover:bg-primary/5"
                                onClick={() => handleSuggestedQuery(query)}
                              >
                                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                                {query}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 border-t border-border/50 mt-auto">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend()
                    }}
                    className="flex w-full items-center space-x-2"
                  >
                    <div className="relative flex-1">
                      <Input
                        ref={inputRef}
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pr-12 py-6 transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary"
                        disabled={isTyping}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isTyping || !input.trim()}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full transition-all duration-300 hover:scale-110 bg-primary text-primary-foreground"
                      >
                        {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </form>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
