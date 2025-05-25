"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Database, Bot, User, Send, Shield, Key, Server, HardDrive, Loader2, CheckCircle } from "lucide-react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function RDSPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isConfirmationPending, setIsConfirmationPending] = useState(false)
  const [formData, setFormData] = useState({
    dbInstanceClass: "db.t2.micro",
    engine: "mysql",
    dbName: "",
    masterUsername: "admin",
    masterPassword: "",
    allocatedStorage: 20,
    vpcSecurityGroupId: "",
  })
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Welcome to RDS Management! I can help you with:

1. Database Selection
   - Choose the right database engine and instance type
   - Compare performance and pricing
   - Optimize for your workload

2. Database Management
   - Create new database instances
   - Configure security groups
   - Manage storage and backups
   - Monitor performance

3. Cost Optimization
   - Compare on-demand vs. reserved instances
   - Optimize storage and compute resources
   - Monitor and control costs

4. Security & Networking
   - Configure security groups
   - Set up VPC networking
   - Manage access controls

Popular Database Types:
- MySQL: Open-source relational database
- PostgreSQL: Advanced open-source database
- MariaDB: MySQL-compatible database
- Oracle: Enterprise-grade database
- SQL Server: Microsoft's database solution

What would you like to do?`,
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [formattedMessages, setFormattedMessages] = useState<{ [key: number]: string }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("deploy")
  const [deploymentSuccess, setDeploymentSuccess] = useState(false)

  // Fetch user's AWS credentials and set default values
  useEffect(() => {
    const fetchUserCredentials = async () => {
      try {
        console.log("Fetching user credentials...")
        const response = await fetch("/api/user/credentials", {
          credentials: "include",
        })

        console.log("Credentials response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Received credentials data:", data)

          if (data.credentials) {
            // Extract security group ID from credentials
            const securityGroupId = data.credentials.securityGroupId || ""

            console.log("Setting form data with:", {
              securityGroupId,
            })

            setFormData((prev) => ({
              ...prev,
              vpcSecurityGroupId: securityGroupId,
            }))
          } else {
            console.log("No credentials found in response")
          }
        } else {
          const errorData = await response.json()
          console.error("Error fetching credentials:", errorData)
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch AWS credentials",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching user credentials:", error)
        toast({
          title: "Error",
          description: "Failed to fetch AWS credentials. Please check your setup.",
          variant: "destructive",
        })
      }
    }

    fetchUserCredentials()
  }, [toast])

  // Format messages using marked and DOMPurify
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

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [formattedMessages])

  // Handle manual RDS instance creation from form
  const handleDeploy = async () => {
    if (!formData.dbName || !formData.masterPassword || !formData.vpcSecurityGroupId) {
      toast({
        title: "Missing information",
        description: "Database Name, Master Password, and Security Group ID are required.",
        variant: "destructive",
      })
      return
    }

    if (formData.masterPassword.length < 8) {
      toast({
        title: "Invalid password",
        description: "Master password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/rds/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        setDeploymentSuccess(true)
        toast({
          title: "Success",
          description: "RDS instance created successfully",
        })
      } else {
        throw new Error(data.message || "Failed to create RDS instance")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create RDS instance",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sending chat messages
  const handleChatSend = async () => {
    if (!chatInput.trim()) return

    const userMessage: Message = { role: "user", content: chatInput }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = chatInput
    setChatInput("")
    setIsChatLoading(true)
    setIsConfirmationPending(false)

    try {
      console.log("Sending request...") // Debug log
      const response = await fetch("/api/rds/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This is important for sending cookies
        body: JSON.stringify({ message: currentInput }),
      })

      console.log("Response status:", response.status) // Debug log

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error Response:", errorData) // Debug log
        throw new Error(errorData.message || "Failed to get response from RDS assistant")
      }

      const data = await response.json()
      if (data.response) {
        const aiMessage: Message = { role: "assistant", content: data.response }
        setMessages((prev) => [...prev, aiMessage])
      } else if (data.error) {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error("Chat Error:", error) // Debug log
      const errorMsg = error.message || "Failed to get response from RDS assistant"
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ Error: ${errorMsg}` }])
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsChatLoading(false)
      // Focus back on input
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    }
  }

  const databaseEngines = [
    { value: "mysql", label: "MySQL", description: "Open-source relational database" },
    { value: "postgres", label: "PostgreSQL", description: "Advanced open-source database" },
    { value: "mariadb", label: "MariaDB", description: "MySQL-compatible database" },
    { value: "oracle-se2", label: "Oracle", description: "Enterprise-grade database" },
    { value: "sqlserver-ex", label: "SQL Server", description: "Microsoft's database solution" },
  ]

  const instanceClasses = [
    { value: "db.t2.micro", label: "db.t2.micro", specs: "1 vCPU, 1GB RAM", tier: "Free tier eligible" },
    { value: "db.t3.small", label: "db.t3.small", specs: "2 vCPU, 2GB RAM", tier: "General purpose" },
    { value: "db.m5.large", label: "db.m5.large", specs: "2 vCPU, 8GB RAM", tier: "General purpose" },
    { value: "db.r5.xlarge", label: "db.r5.xlarge", specs: "4 vCPU, 32GB RAM", tier: "Memory optimized" },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">RDS Management</h1>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <span className="flex items-center text-xs font-medium">
              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
              AWS Connected
            </span>
          </Badge>
        </div>

        <Tabs defaultValue="deploy" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="deploy" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Deploy Database</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>RDS Assistant</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2 border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle>RDS Instance Deployment</CardTitle>
                  </div>
                  <CardDescription>Configure and deploy your RDS instance using your AWS credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dbInstanceClass">Instance Class</Label>
                        <Select
                          value={formData.dbInstanceClass}
                          onValueChange={(value) => setFormData({ ...formData, dbInstanceClass: value })}
                        >
                          <SelectTrigger id="dbInstanceClass">
                            <SelectValue placeholder="Select instance class" />
                          </SelectTrigger>
                          <SelectContent>
                            {instanceClasses.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    <span className="font-medium">{type.label}</span>
                                    {type.tier === "Free tier eligible" && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        Free tier
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{type.specs}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="engine">Database Engine</Label>
                        <Select
                          value={formData.engine}
                          onValueChange={(value) => setFormData({ ...formData, engine: value })}
                        >
                          <SelectTrigger id="engine">
                            <SelectValue placeholder="Select database engine" />
                          </SelectTrigger>
                          <SelectContent>
                            {databaseEngines.map((engine) => (
                              <SelectItem key={engine.value} value={engine.value}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{engine.label}</span>
                                  <span className="text-xs text-muted-foreground">{engine.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dbName">
                          Database Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dbName"
                            value={formData.dbName}
                            onChange={(e) => setFormData({ ...formData, dbName: e.target.value })}
                            placeholder="Enter database name"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must be 1-63 letters or numbers. Cannot be a reserved word.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="allocatedStorage">Allocated Storage (GB)</Label>
                        <div className="relative">
                          <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="allocatedStorage"
                            type="number"
                            value={formData.allocatedStorage}
                            onChange={(e) =>
                              setFormData({ ...formData, allocatedStorage: Number.parseInt(e.target.value) })
                            }
                            min="20"
                            max="65536"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Minimum 20GB. General Purpose SSD (gp2) storage.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="masterUsername">
                          Master Username <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="masterUsername"
                            value={formData.masterUsername}
                            onChange={(e) => setFormData({ ...formData, masterUsername: e.target.value })}
                            placeholder="Enter master username"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must begin with a letter. Only letters, numbers, and underscore allowed.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="masterPassword">
                          Master Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="masterPassword"
                            type="password"
                            value={formData.masterPassword}
                            onChange={(e) => setFormData({ ...formData, masterPassword: e.target.value })}
                            placeholder="Enter master password"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          At least 8 characters. Cannot contain username or AWS reserved words.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vpcSecurityGroupId">
                          Security Group ID <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="vpcSecurityGroupId"
                            value={formData.vpcSecurityGroupId}
                            onChange={(e) => setFormData({ ...formData, vpcSecurityGroupId: e.target.value })}
                            placeholder="sg-xxxxxxxxxxxxxxxxx"
                            disabled={!!formData.vpcSecurityGroupId}
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Security group that controls database access. Ensure it allows database port access.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleDeploy}
                    disabled={isLoading || isChatLoading || isConfirmationPending}
                    className="w-full h-11"
                    title={isConfirmationPending ? "Please confirm or deny deployment via chat" : ""}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Create RDS Instance
                      </>
                    )}
                  </Button>
                </CardContent>

                <AnimatePresence>
                  {deploymentSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                        <div className="w-full p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                          <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Database Created Successfully
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                            Your RDS instance is being created. It may take several minutes to become available.
                          </p>

                          <div className="space-y-3">
                            <div className="flex items-center p-2 bg-white dark:bg-black/20 rounded border border-green-200 dark:border-green-900/50">
                              <Server className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                              <div className="flex flex-col">
                                <span className="text-xs text-green-600 dark:text-green-400">Instance Type</span>
                                <span className="font-medium text-green-800 dark:text-green-300">
                                  {formData.dbInstanceClass}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center p-2 bg-white dark:bg-black/20 rounded border border-green-200 dark:border-green-900/50">
                              <Database className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                              <div className="flex flex-col">
                                <span className="text-xs text-green-600 dark:text-green-400">Database Engine</span>
                                <span className="font-medium text-green-800 dark:text-green-300">
                                  {databaseEngines.find((e) => e.value === formData.engine)?.label || formData.engine}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center p-2 bg-white dark:bg-black/20 rounded border border-green-200 dark:border-green-900/50">
                              <Database className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                              <div className="flex flex-col">
                                <span className="text-xs text-green-600 dark:text-green-400">Database Name</span>
                                <span className="font-medium text-green-800 dark:text-green-300">
                                  {formData.dbName}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-3">
                            You can check the status of your database in the AWS RDS console.
                          </p>
                        </div>
                      </CardFooter>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="assistant" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2 border-border/50 shadow-lg h-[700px] flex flex-col">
                <CardHeader className="flex-none border-b">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>RDS Assistant</CardTitle>
                  </div>
                  <CardDescription>Ask me about RDS or ask me to create a database for you.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <AnimatePresence initial={false}>
                        {messages.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex items-start gap-3 ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {message.role === "assistant" && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <Bot className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-lg p-4 text-sm prose prose-sm dark:prose-invert max-w-none [&>pre]:bg-muted [&>pre]:p-2 [&>pre]:rounded [&>pre]:overflow-x-auto [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-4 [&>ol]:ml-4 [&>p]:my-2 [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base [&>code]:bg-muted [&>code]:px-1 [&>code]:rounded ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground ml-auto"
                                  : "bg-muted border border-border/50"
                              }`}
                              dangerouslySetInnerHTML={{ __html: formattedMessages[index] || "" }}
                            />
                            {message.role === "user" && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                                <User className="h-5 w-5 text-primary-foreground" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {isChatLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <div className="max-w-[80%] rounded-lg p-4 bg-muted border border-border/50 flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  repeat: Number.POSITIVE_INFINITY,
                                  duration: 1.5,
                                  ease: "easeInOut",
                                }}
                                className="h-2 w-2 rounded-full bg-primary"
                              />
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  repeat: Number.POSITIVE_INFINITY,
                                  duration: 1.5,
                                  ease: "easeInOut",
                                  delay: 0.2,
                                }}
                                className="h-2 w-2 rounded-full bg-primary"
                              />
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  repeat: Number.POSITIVE_INFINITY,
                                  duration: 1.5,
                                  ease: "easeInOut",
                                  delay: 0.4,
                                }}
                                className="h-2 w-2 rounded-full bg-primary"
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex-none p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleChatSend()
                    }}
                    className="flex w-full gap-2"
                  >
                    <Input
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about RDS or say 'create a database'..."
                      disabled={isChatLoading}
                      className="flex-1"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="submit"
                            disabled={isChatLoading || !chatInput.trim()}
                            size="icon"
                            className="h-10 w-10 rounded-full"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </form>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
