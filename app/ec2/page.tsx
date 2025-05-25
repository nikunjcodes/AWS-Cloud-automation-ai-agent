"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import {
  Server,
  Bot,
  User,
  Send,
  Calculator,
  Terminal,
  Copy,
  Cpu,
  DatabaseIcon,
  HardDrive,
  Network,
  Loader2,
} from "lucide-react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
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

interface PricingParams {
  instanceType: string
  duration: number
  termType: "OnDemand" | "Reserved" | "Spot"
  operatingSystem: "Linux" | "Windows"
  tenancy: "Shared" | "Dedicated"
  region: string
}

interface PricingEstimate {
  basePrice: number
  totalCost: number
  specs: {
    vCPUs: number
    memory: number
    storage: string
    network: string
  }
  monthlyCost: number
}

export default function EC2Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isConfirmationPending, setIsConfirmationPending] = useState(false)
  const [formData, setFormData] = useState({
    instanceType: "t2.micro",
    keyName: "final1",
    imageId: "",
    securityGroup: "",
  })
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Welcome to EC2 Management! I can help you with:

1. Instance Selection
   - Choose the right instance type for your workload
   - Compare performance and pricing
   - Optimize for cost and performance

2. Instance Management
   - Launch new instances
   - Monitor running instances
   - Configure security groups
   - Manage storage and networking

3. Cost Optimization
   - Compare on-demand vs. spot instances
   - Use reserved instances for savings
   - Monitor and optimize costs

4. Security & Networking
   - Configure security groups
   - Set up VPC networking
   - Manage access controls

Popular Instance Types:
- t2.micro: Free tier eligible, 1 vCPU, 1GB RAM
- t3.small: 2 vCPU, 2GB RAM, good for development
- m5.large: 2 vCPU, 8GB RAM, general purpose
- c5.xlarge: 4 vCPU, 8GB RAM, compute optimized

What would you like to do?`,
    },
  ])
  const [url, setUrl] = useState("")
  const [uploadLink, setUploadLink] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [formattedMessages, setFormattedMessages] = useState<{ [key: number]: string }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [pricingParams, setPricingParams] = useState<PricingParams>({
    instanceType: "t2.micro",
    duration: 1,
    termType: "OnDemand",
    operatingSystem: "Linux",
    tenancy: "Shared",
    region: "us-east-1",
  })
  const [pricingEstimate, setPricingEstimate] = useState<PricingEstimate | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [activeTab, setActiveTab] = useState("deploy")

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
            // Extract AMI ID from ARN
            let amiId = ""
            if (data.credentials.amiArn) {
              console.log("Processing AMI ARN:", data.credentials.amiArn)

              // Handle different ARN formats
              if (data.credentials.amiArn.startsWith("arn:aws:ec2")) {
                // Standard ARN format: arn:aws:ec2:region:account:image/ami-id
                const arnParts = data.credentials.amiArn.split(":")
                if (arnParts.length >= 6) {
                  amiId = arnParts[5].split("/").pop() || ""
                  console.log("Extracted AMI ID from ARN:", amiId)
                }
              } else if (data.credentials.amiArn.startsWith("ami-")) {
                // Direct AMI ID format
                amiId = data.credentials.amiArn
                console.log("Using direct AMI ID:", amiId)
              }
            }

            // Extract security group ID
            const securityGroupId = data.credentials.securityGroupId || ""

            console.log("Setting form data with:", {
              amiId,
              securityGroupId,
            })

            setFormData((prev) => ({
              ...prev,
              imageId: amiId,
              securityGroup: securityGroupId,
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

  // Handle manual EC2 instance creation from form
  const handleDeploy = async () => {
    if (!formData.keyName || !formData.imageId || !formData.securityGroup) {
      toast({
        title: "Missing information",
        description: "Key Pair Name, AMI ID, and Security Group ID are required.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch("/api/ec2/deploy", {
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
          description: "EC2 instance deployed successfully",
        })
      } else {
        throw new Error(data.message || "Failed to deploy EC2 instance")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deploy EC2 instance",
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
      const response = await fetch("/api/ec2/chat", {
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
        throw new Error(errorData.message || "Failed to get response from EC2 assistant")
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
      const errorMsg = error.message || "Failed to get response from EC2 assistant"
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

  const calculatePricing = async () => {
    setIsCalculating(true)
    try {
      const response = await fetch("/api/ec2/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Calculate pricing for ${pricingParams.instanceType} with ${pricingParams.duration} months duration, ${pricingParams.termType} term, ${pricingParams.operatingSystem} OS, ${pricingParams.tenancy} tenancy in ${pricingParams.region}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to calculate pricing")
      }

      const data = await response.json()
      if (data.pricing) {
        setPricingEstimate({
          basePrice: data.pricing.basePrice,
          totalCost: data.pricing.totalCost,
          specs: data.pricing.specs,
          monthlyCost: data.pricing.monthlyCost,
        })
      } else if (data.response) {
        // If we can't parse the response, show the raw response
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
          },
        ])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate pricing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "URL copied to clipboard",
    })
  }

  const instanceTypes = [
    { value: "t2.micro", label: "t2.micro", specs: "1 vCPU, 1GB RAM", tier: "Free tier eligible" },
    { value: "t3.small", label: "t3.small", specs: "2 vCPU, 2GB RAM", tier: "General purpose" },
    { value: "m5.large", label: "m5.large", specs: "2 vCPU, 8GB RAM", tier: "General purpose" },
    { value: "c5.xlarge", label: "c5.xlarge", specs: "4 vCPU, 8GB RAM", tier: "Compute optimized" },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Server className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">EC2 Management</h1>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <span className="flex items-center text-xs font-medium">
              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
              AWS Connected
            </span>
          </Badge>
        </div>

        <Tabs defaultValue="deploy" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="deploy" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span>Deploy Instance</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>Pricing Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>EC2 Assistant</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2 border-border/50 shadow-lg p-6">
                <CardHeader>
                  <div className="flex items-center space-x-2 text-xl">
                    <Server className="h-5 w-5 text-primary" />
                    <CardTitle>EC2 Instance Deployment</CardTitle>
                  </div>
                  <CardDescription>Configure and deploy your EC2 instance using your AWS credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 text-lg">
                      <div className="space-y-2 text-large">
                        <Label htmlFor="instanceType">Instance Type</Label>
                        <Select
                          value={formData.instanceType}
                          onValueChange={(value) => setFormData({ ...formData, instanceType: value })}
                          
                        >
                          <SelectTrigger id="instanceType" className="h-12 text-base">
                            <SelectValue placeholder="Select instance type" />
                          </SelectTrigger>
                          <SelectContent>
                            {instanceTypes.map((type) => (
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
                        <Label htmlFor="keyName">
                          Key Pair Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                        className="h-12 text-base px-4"
                          id="keyName"
                          value={formData.keyName}
                          onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                          placeholder="Key pair name"
                          disabled={!!formData.keyName}
                        />
                        <p className="text-xs text-muted-foreground">
                          The key pair used for SSH access to your instance
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageId">
                          AMI ID <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="imageId"
                          value={formData.imageId}
                          onChange={(e) => setFormData({ ...formData, imageId: e.target.value })}
                          placeholder="ami-xxxxxxxxxxxxxxxxx"
                          disabled={!!formData.imageId}
                        />
                        <p className="text-xs text-muted-foreground">
                          Amazon Machine Image ID that defines your instance's OS and configuration
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="securityGroup">
                          Security Group ID <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="securityGroup"
                          value={formData.securityGroup}
                          onChange={(e) => setFormData({ ...formData, securityGroup: e.target.value })}
                          placeholder="sg-xxxxxxxxxxxxxxxxx"
                          disabled={!!formData.securityGroup}
                        />
                        <p className="text-xs text-muted-foreground">
                          Security group that controls inbound and outbound traffic
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
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Server className="mr-2 h-4 w-4" />
                        Deploy EC2 Instance
                      </>
                    )}
                  </Button>
                </CardContent>

                {uploadLink && (
                  <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                    <div className="w-full p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                      <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2 flex items-center">
                        <Server className="h-4 w-4 mr-2" />
                        Instance Deployed Successfully
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                        Your EC2 instance has been deployed and is now available.
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
                          onClick={() => window.open(url, "_blank")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Terminal className="mr-2 h-4 w-4" />
                          Connect to CLI
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

          <TabsContent value="pricing" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2 border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <CardTitle>EC2 Pricing Calculator</CardTitle>
                  </div>
                  <CardDescription>Calculate estimated costs for your EC2 instances</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="calc-instanceType">Instance Type</Label>
                        <Select
                          value={pricingParams.instanceType}
                          onValueChange={(value) => setPricingParams({ ...pricingParams, instanceType: value })}
                        >
                          <SelectTrigger id="calc-instanceType">
                            <SelectValue placeholder="Select instance type" />
                          </SelectTrigger>
                          <SelectContent>
                            {instanceTypes.map((type) => (
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
                        <div className="flex justify-between">
                          <Label htmlFor="duration">Duration (months)</Label>
                          <span className="text-sm text-muted-foreground">
                            {pricingParams.duration} month{pricingParams.duration > 1 ? "s" : ""}
                          </span>
                        </div>
                        <Slider
                          id="duration"
                          value={[pricingParams.duration]}
                          onValueChange={([value]) => setPricingParams({ ...pricingParams, duration: value })}
                          min={1}
                          max={36}
                          step={1}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 month</span>
                          <span>36 months</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="termType">Term Type</Label>
                        <Select
                          value={pricingParams.termType}
                          onValueChange={(value: "OnDemand" | "Reserved" | "Spot") =>
                            setPricingParams({ ...pricingParams, termType: value })
                          }
                        >
                          <SelectTrigger id="termType">
                            <SelectValue placeholder="Select term type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OnDemand">
                              <div className="flex flex-col">
                                <span>On-Demand</span>
                                <span className="text-xs text-muted-foreground">
                                  Pay by the hour with no commitments
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Reserved">
                              <div className="flex flex-col">
                                <span>Reserved</span>
                                <span className="text-xs text-muted-foreground">
                                  Lower prices with 1 or 3 year commitment
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Spot">
                              <div className="flex flex-col">
                                <span>Spot</span>
                                <span className="text-xs text-muted-foreground">
                                  Significant discounts with variable availability
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="operatingSystem">Operating System</Label>
                        <Select
                          value={pricingParams.operatingSystem}
                          onValueChange={(value: "Linux" | "Windows") =>
                            setPricingParams({ ...pricingParams, operatingSystem: value })
                          }
                        >
                          <SelectTrigger id="operatingSystem">
                            <SelectValue placeholder="Select OS" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Linux">Linux</SelectItem>
                            <SelectItem value="Windows">Windows</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tenancy">Tenancy</Label>
                        <Select
                          value={pricingParams.tenancy}
                          onValueChange={(value: "Shared" | "Dedicated") =>
                            setPricingParams({ ...pricingParams, tenancy: value })
                          }
                        >
                          <SelectTrigger id="tenancy">
                            <SelectValue placeholder="Select tenancy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Shared">
                              <div className="flex flex-col">
                                <span>Shared</span>
                                <span className="text-xs text-muted-foreground">Standard multi-tenant hardware</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Dedicated">
                              <div className="flex flex-col">
                                <span>Dedicated</span>
                                <span className="text-xs text-muted-foreground">
                                  Instance runs on single-tenant hardware
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select
                          value={pricingParams.region}
                          onValueChange={(value) => setPricingParams({ ...pricingParams, region: value })}
                        >
                          <SelectTrigger id="region">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                            <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                            <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                            <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button onClick={calculatePricing} disabled={isCalculating} className="w-full h-11">
                    {isCalculating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculate Pricing
                      </>
                    )}
                  </Button>

                  <AnimatePresence>
                    {pricingEstimate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900"
                      >
                        <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-4 flex items-center">
                          <Calculator className="h-4 w-4 mr-2" />
                          Estimated Cost
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-black/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Base Price</span>
                              </div>
                              <span className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                                ${pricingEstimate.basePrice.toFixed(4)}/hour
                              </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-white dark:bg-black/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                  Monthly Cost
                                </span>
                              </div>
                              <span className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                                ${pricingEstimate.monthlyCost.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-white dark:bg-black/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                  Total Cost ({pricingParams.duration} month
                                  {pricingParams.duration > 1 ? "s" : ""})
                                </span>
                              </div>
                              <span className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                                ${pricingEstimate.totalCost.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Specifications</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center p-3 bg-white dark:bg-black/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                <Cpu className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-blue-600 dark:text-blue-400">vCPUs</span>
                                  <span className="font-medium text-blue-800 dark:text-blue-300">
                                    {pricingEstimate.specs.vCPUs}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center p-3 bg-white dark:bg-black/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                <DatabaseIcon className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-blue-600 dark:text-blue-400">Memory</span>
                                  <span className="font-medium text-blue-800 dark:text-blue-300">
                                    {pricingEstimate.specs.memory} GB
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center p-3 bg-white dark:bg-black/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                <HardDrive className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-blue-600 dark:text-blue-400">Storage</span>
                                  <span className="font-medium text-blue-800 dark:text-blue-300">
                                    {pricingEstimate.specs.storage}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center p-3 bg-white dark:bg-black/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                <Network className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-blue-600 dark:text-blue-400">Network</span>
                                  <span className="font-medium text-blue-800 dark:text-blue-300">
                                    {pricingEstimate.specs.network}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
                    <CardTitle>EC2 Assistant</CardTitle>
                  </div>
                  <CardDescription>Ask me about EC2 or ask me to deploy an instance for you.</CardDescription>
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
                      placeholder="Ask about EC2 or say 'deploy an instance'..."
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
