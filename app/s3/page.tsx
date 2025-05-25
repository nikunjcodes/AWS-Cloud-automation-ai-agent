"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Bot, User, Send, Upload, Copy, CheckCircle, AlertCircle, Loader2, FileUp, Globe } from "lucide-react"
import { marked } from "marked"
import DOMPurify from "dompurify"
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

export default function S3Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isConfirmationPending, setIsConfirmationPending] = useState(false)
  const [formData, setFormData] = useState({
    bucketName: `my-bucket-${Date.now()}`,
  })
  const [url, setUrl] = useState("")
  const [uploadLink, setUploadLink] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to S3 Management! I can help you create and manage S3 buckets. What would you like to do?",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [formattedMessages, setFormattedMessages] = useState<{ [key: number]: string }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("bucket")

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

  // Handle manual S3 bucket creation from form
  const handleDeploy = async () => {
    if (!formData.bucketName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a bucket name.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/s3/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        setUploadLink(true)
        setUrl(data.url)
        toast({
          title: "Success",
          description: "S3 bucket created successfully",
        })
      } else {
        throw new Error(data.message || "Failed to create S3 bucket")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create S3 bucket",
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
    setIsConfirmationPending(false) // Reset confirmation pending state

    const confirmationKeywords = ["yes", "go ahead", "proceed"]
    const isConfirmationAttempt = confirmationKeywords.some((keyword) => currentInput.toLowerCase().includes(keyword))

    // Check if user is confirming a pending deployment
    if (isConfirmationAttempt && isConfirmationPending) {
      setIsLoading(true)
      setMessages((prev) => [...prev, { role: "assistant", content: "Deploying your S3 bucket..." }])
      try {
        // Use form data for parameters in this example
        const response = await fetch("/api/s3/deploy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // NO Authorization header needed - uses cookie
          },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (data.success) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `✅ S3 bucket created successfully: ${JSON.stringify(data)}` },
          ])
          toast({ title: "Success", description: "S3 bucket deployed via chat confirmation." })
        } else {
          throw new Error(data.message || "Deployment failed via chat confirmation.")
        }
      } catch (error: any) {
        const errorMsg = error.message || "Deployment failed via chat confirmation."
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${errorMsg}` }])
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
      } finally {
        setIsLoading(false)
        setIsChatLoading(false)
        setIsConfirmationPending(false) // Reset confirmation
      }
      return // Stop further processing for this message
    }

    // If not confirming, send message to chat API
    try {
      const response = await fetch("/api/s3/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // NO Authorization header needed - uses cookie
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await response.json()
      if (response.ok && data.response) {
        const aiMessage: Message = { role: "assistant", content: data.response }
        setMessages((prev) => [...prev, aiMessage])
        // Check if AI response asks for confirmation
        if (data.response.toLowerCase().includes("would you like me to proceed")) {
          setIsConfirmationPending(true)
        }
      } else {
        throw new Error(data.error || "Failed to get response from S3 assistant")
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to get response from S3 assistant"
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

  // Handle file upload to S3
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Missing file",
        description: "Please select a file first.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Step 1: Get pre-signed POST data from Lambda
      const res = await fetch("https://p8j8jwxfa0.execute-api.us-east-1.amazonaws.com/prod/LOCAL_TO_S3")
      if (!res.ok) {
        throw new Error("Failed to get upload URL")
      }
      const { uploadUrl, filePublicUrl } = await res.json()

      // Step 2: Use FormData for S3 POST
      const formData = new FormData()
      Object.entries(uploadUrl.fields).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
      formData.append("file", selectedFile)

      // Step 3: Upload the file to S3
      const uploadRes = await fetch(uploadUrl.url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      if (uploadRes.ok) {
        setFileUrl(filePublicUrl)
        toast({
          title: "Success",
          description: "File uploaded successfully!",
        })
      } else {
        const errorText = await uploadRes.text()
        console.error("Upload error:", errorText)
        throw new Error("Upload failed: " + errorText)
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "URL copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">S3 Management</h1>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <span className="flex items-center text-xs font-medium">
              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
              AWS Connected
            </span>
          </Badge>
        </div>

        <Tabs defaultValue="bucket" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="bucket" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Create Bucket</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>S3 Assistant</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bucket" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2 border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>S3 Bucket Creation</CardTitle>
                  </div>
                  <CardDescription>
                    Configure and create your S3 bucket for storing files and hosting static websites
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bucketName">
                        Bucket Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="bucketName"
                          value={formData.bucketName}
                          onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                          placeholder="Enter a unique bucket name"
                          className="pl-10"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Bucket names must be globally unique across all AWS accounts.</p>
                        <p>Naming rules:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>3-63 characters long</li>
                          <li>Can contain lowercase letters, numbers, and hyphens</li>
                          <li>Cannot start or end with a hyphen</li>
                          <li>Cannot contain uppercase letters or underscores</li>
                        </ul>
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
                          <FileText className="mr-2 h-4 w-4" />
                          Create S3 Bucket
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>

                {uploadLink && (
                  <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                    <div className="w-full p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                      <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Bucket Created Successfully
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                        Your S3 bucket has been created and is ready to use.
                      </p>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-black/20 rounded border border-green-200 dark:border-green-900/50">
                          <span className="text-sm font-mono text-gray-800 dark:text-gray-300 truncate mr-2">
                            {url}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(url)} className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          onClick={() => {
                            window.open(url, "_blank")
                            setActiveTab("upload")
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Data
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Note: Open the URL in AWS account Owner's account
                      </p>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2 border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <CardTitle>Upload HTML File</CardTitle>
                  </div>
                  <CardDescription>Upload HTML files to your S3 bucket for static website hosting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <FileUp className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">Upload your HTML file</h3>
                        <p className="text-sm text-muted-foreground">Drag and drop your file here or click to browse</p>
                      </div>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".html"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        className="max-w-xs"
                      />
                      {selectedFile && (
                        <div className="text-sm">
                          Selected: <span className="font-medium">{selectedFile.name}</span> (
                          {(selectedFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleFileUpload} disabled={isUploading || !selectedFile} className="w-full h-11">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                      </>
                    )}
                  </Button>

                  <AnimatePresence>
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center space-y-4 py-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
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
                              className="h-3 w-3 rounded-full bg-primary"
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
                              className="h-3 w-3 rounded-full bg-primary"
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
                              className="h-3 w-3 rounded-full bg-primary"
                            />
                          </div>
                          <span className="text-sm font-medium">Uploading your file...</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center max-w-md">
                          Your file is being uploaded to S3. This may take a moment depending on the file size.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {fileUrl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 p-6 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900"
                      >
                        <div className="flex items-center space-x-2 text-green-800 dark:text-green-400 mb-3">
                          <CheckCircle className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Upload Successful!</h3>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                          Your file has been uploaded successfully and is now available online.
                        </p>
                        <div className="mb-4 p-3 bg-white dark:bg-black/20 rounded-md border border-green-200 dark:border-green-900/50">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-mono text-gray-800 dark:text-gray-300 break-all truncate mr-2">
                              {fileUrl}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(fileUrl)}
                              className="h-8 w-8 flex-shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(fileUrl, "_blank")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          View File Online
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="assistant" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2 border-border/50 shadow-lg h-[700px] flex flex-col">
                <CardHeader className="flex-none border-b">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>S3 Assistant</CardTitle>
                  </div>
                  <CardDescription>Ask me about S3 or ask me to create a bucket for you.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <AnimatePresence initial={false}>
                        {messages.map((message, index) => {
                          const isConfirmationRequest =
                            message.role === "assistant" &&
                            message.content.toLowerCase().includes("would you like me to proceed")
                          return (
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
                                } ${
                                  isConfirmationRequest
                                    ? "ring-2 ring-amber-500 dark:ring-amber-400 ring-offset-2 dark:ring-offset-background"
                                    : ""
                                }`}
                                dangerouslySetInnerHTML={{ __html: formattedMessages[index] || "" }}
                              />
                              {message.role === "user" && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                                  <User className="h-5 w-5 text-primary-foreground" />
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
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
                  {isConfirmationPending && (
                    <div className="w-full mb-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-sm">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Waiting for confirmation. Type "yes" to proceed or describe changes.</span>
                      </div>
                    </div>
                  )}
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
                      placeholder={
                        isConfirmationPending
                          ? "Type 'yes' to confirm or describe changes..."
                          : "Ask about S3 or say 'create a bucket'..."
                      }
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
