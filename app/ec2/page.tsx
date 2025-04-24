"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Server, Bot, User, Send, Calculator } from "lucide-react"
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PricingParams {
  instanceType: string;
  duration: number;
  termType: 'OnDemand' | 'Reserved' | 'Spot';
  operatingSystem: 'Linux' | 'Windows';
  tenancy: 'Shared' | 'Dedicated';
  region: string;
}

interface PricingEstimate {
  basePrice: number;
  totalCost: number;
  specs: {
    vCPUs: number;
    memory: number;
    storage: string;
    network: string;
  };
  monthlyCost: number;
}

export default function EC2Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isConfirmationPending, setIsConfirmationPending] = useState(false)
  const [formData, setFormData] = useState({
    instanceType: "t2.micro",
    keyName: "final1",
    imageId: "",
    securityGroup: ""
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

What would you like to do?`
    }
  ]);
  const [url, setUrl] = useState("")
  const [uploadLink, setUploadLink] = useState(false)
  const [chatInput, setChatInput] = useState("");
  const [formattedMessages, setFormattedMessages] = useState<{ [key: number]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast()
  const [pricingParams, setPricingParams] = useState<PricingParams>({
    instanceType: 't2.micro',
    duration: 1,
    termType: 'OnDemand',
    operatingSystem: 'Linux',
    tenancy: 'Shared',
    region: 'us-east-1'
  });
  const [pricingEstimate, setPricingEstimate] = useState<PricingEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch user's AWS credentials and set default values
  useEffect(() => {
    const fetchUserCredentials = async () => {
      try {
        console.log('Fetching user credentials...');
        const response = await fetch('/api/user/credentials', {
          credentials: 'include'
        });
        
        console.log('Credentials response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received credentials data:', data);
          
          if (data.credentials) {
            // Extract AMI ID from ARN
            let amiId = '';
            if (data.credentials.amiArn) {
              console.log('Processing AMI ARN:', data.credentials.amiArn);
              
              // Handle different ARN formats
              if (data.credentials.amiArn.startsWith('arn:aws:ec2')) {
                // Standard ARN format: arn:aws:ec2:region:account:image/ami-id
                const arnParts = data.credentials.amiArn.split(':');
                if (arnParts.length >= 6) {
                  amiId = arnParts[5].split('/').pop() || '';
                  console.log('Extracted AMI ID from ARN:', amiId);
                }
              } else if (data.credentials.amiArn.startsWith('ami-')) {
                // Direct AMI ID format
                amiId = data.credentials.amiArn;
                console.log('Using direct AMI ID:', amiId);
              }
            }

            // Extract security group ID
            const securityGroupId = data.credentials.securityGroupId || '';

            console.log('Setting form data with:', {
              amiId,
              securityGroupId
            });

            setFormData(prev => ({
              ...prev,
              imageId: amiId,
              securityGroup: securityGroupId
            }));
          } else {
            console.log('No credentials found in response');
          }
        } else {
          const errorData = await response.json();
          console.error('Error fetching credentials:', errorData);
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch AWS credentials",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching user credentials:', error);
        toast({
          title: "Error",
          description: "Failed to fetch AWS credentials. Please check your setup.",
          variant: "destructive"
        });
      }
    };

    fetchUserCredentials();
  }, [toast]);

  // Format messages using marked and DOMPurify
  useEffect(() => {
    const formatMessages = async () => {
      const formatted: { [key: number]: string } = {};
      for (let i = 0; i < messages.length; i++) {
        const html = await marked(messages[i].content);
        formatted[i] = DOMPurify.sanitize(html);
      }
      setFormattedMessages(formatted);
    };
    formatMessages();
  }, [messages]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [formattedMessages]);

  // Handle manual EC2 instance creation from form
  const handleDeploy = async () => {
    if (!formData.keyName || !formData.imageId || !formData.securityGroup) {
        toast({ title: "Error", description: "Key Pair Name, AMI ID, and Security Group ID are required.", variant: "destructive" });
        return;
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/ec2/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        setUploadLink(true);
        setUrl(data.url);
        toast({
          title: "Success",
          description: "EC2 instance deployed successfully",
        })
      } else {
        throw new Error(data.message || 'Failed to deploy EC2 instance')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to deploy EC2 instance',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sending chat messages
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = { role: "user", content: chatInput };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");
    setIsChatLoading(true);
    setIsConfirmationPending(false);

    try {
      console.log('Sending request...'); // Debug log
      const response = await fetch('/api/ec2/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // This is important for sending cookies
        body: JSON.stringify({ message: currentInput })
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to get response from EC2 assistant');
      }

      const data = await response.json();
      if (data.response) {
        const aiMessage: Message = { role: "assistant", content: data.response };
        setMessages(prev => [...prev, aiMessage]);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Chat Error:', error); // Debug log
      const errorMsg = error.message || 'Failed to get response from EC2 assistant';
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${errorMsg}` }]);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsChatLoading(false);
    }
  }

  const calculatePricing = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/ec2/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Calculate pricing for ${pricingParams.instanceType} with ${pricingParams.duration} months duration, ${pricingParams.termType} term, ${pricingParams.operatingSystem} OS, ${pricingParams.tenancy} tenancy in ${pricingParams.region}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate pricing');
      }

      const data = await response.json();
      if (data.pricing) {
        setPricingEstimate({
          basePrice: data.pricing.basePrice,
          totalCost: data.pricing.totalCost,
          specs: data.pricing.specs,
          monthlyCost: data.pricing.monthlyCost
        });
      } else if (data.response) {
        // If we can't parse the response, show the raw response
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.response
        }]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate pricing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deployment Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              EC2 Instance Deployment
            </CardTitle>
            <CardDescription>
              Configure and deploy your EC2 instance using your AWS credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instanceType">Instance Type</Label>
                <Select
                  value={formData.instanceType}
                  onValueChange={(value) => setFormData({ ...formData, instanceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t2.micro">t2.micro (1 vCPU, 1GB RAM)</SelectItem>
                    <SelectItem value="t3.small">t3.small (2 vCPU, 2GB RAM)</SelectItem>
                    <SelectItem value="m5.large">m5.large (2 vCPU, 8GB RAM)</SelectItem>
                    <SelectItem value="c5.xlarge">c5.xlarge (4 vCPU, 8GB RAM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Pair Name</Label>
                <Input
                  id="keyName"
                  value={formData.keyName}
                  onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                  placeholder="Key pair name"
                  disabled={!!formData.keyName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageId">AMI ID</Label>
                <Input
                  id="imageId"
                  value={formData.imageId}
                  onChange={(e) => setFormData({ ...formData, imageId: e.target.value })}
                  placeholder="AMI ID"
                  disabled={!!formData.imageId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityGroup">Security Group ID</Label>
                <Input
                  id="securityGroup"
                  value={formData.securityGroup}
                  onChange={(e) => setFormData({ ...formData, securityGroup: e.target.value })}
                  placeholder="Security group ID"
                  disabled={!!formData.securityGroup}
                />
              </div>
            </div>
            <Button 
              onClick={handleDeploy}
              disabled={isLoading || isChatLoading || isConfirmationPending}
              className="w-full"
              title={isConfirmationPending ? "Please confirm or deny deployment via chat" : ""}
            >
              {isLoading ? "Deploying..." : "Deploy EC2 Instance"}
            </Button>
            {
              uploadLink && (
                <>
                  <Button 
                    onClick={() => window.open(url, '_blank')}
                    className="mt-4 w-full"
                  >
                    Connect to CLI
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Open the URL in AWS account Owner's account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Copy URL: {url}
                  </p>
                </>
              )
            }
          </CardContent>
        </Card>

        {/* Pricing Calculator Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              EC2 Pricing Calculator
            </CardTitle>
            <CardDescription>
              Calculate estimated costs for your EC2 instances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instanceType">Instance Type</Label>
                <Select
                  value={pricingParams.instanceType}
                  onValueChange={(value) => setPricingParams({ ...pricingParams, instanceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t2.micro">t2.micro (1 vCPU, 1GB RAM)</SelectItem>
                    <SelectItem value="t3.small">t3.small (2 vCPU, 2GB RAM)</SelectItem>
                    <SelectItem value="m5.large">m5.large (2 vCPU, 8GB RAM)</SelectItem>
                    <SelectItem value="c5.xlarge">c5.xlarge (4 vCPU, 8GB RAM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (months)</Label>
                <Slider
                  value={[pricingParams.duration]}
                  onValueChange={([value]) => setPricingParams({ ...pricingParams, duration: value })}
                  min={1}
                  max={36}
                  step={1}
                />
                <div className="text-sm text-muted-foreground">
                  {pricingParams.duration} month{pricingParams.duration > 1 ? 's' : ''}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="termType">Term Type</Label>
                <Select
                  value={pricingParams.termType}
                  onValueChange={(value: 'OnDemand' | 'Reserved' | 'Spot') => 
                    setPricingParams({ ...pricingParams, termType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OnDemand">On-Demand</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Spot">Spot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operatingSystem">Operating System</Label>
                <Select
                  value={pricingParams.operatingSystem}
                  onValueChange={(value: 'Linux' | 'Windows') => 
                    setPricingParams({ ...pricingParams, operatingSystem: value })}
                >
                  <SelectTrigger>
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
                  onValueChange={(value: 'Shared' | 'Dedicated') => 
                    setPricingParams({ ...pricingParams, tenancy: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenancy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shared">Shared</SelectItem>
                    <SelectItem value="Dedicated">Dedicated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={pricingParams.region}
                  onValueChange={(value) => setPricingParams({ ...pricingParams, region: value })}
                >
                  <SelectTrigger>
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
            <Button 
             
            >
              {isCalculating ? "Calculating..." : "Calculate Pricing"}
            </Button>

            {pricingEstimate && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Estimated Cost</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>${pricingEstimate.basePrice.toFixed(4)}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Cost:</span>
                    <span>${pricingEstimate.monthlyCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost ({pricingParams.duration} month{pricingParams.duration > 1 ? 's' : ''}):</span>
                    <span className="font-bold">${pricingEstimate.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Specifications</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>vCPUs: {pricingEstimate.specs.vCPUs}</div>
                      <div>Memory: {pricingEstimate.specs.memory} GB</div>
                      <div>Storage: {pricingEstimate.specs.storage}</div>
                      <div>Network: {pricingEstimate.specs.network}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface Card */}
        <Card className="flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="flex-none">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              EC2 Assistant
            </CardTitle>
            <CardDescription>
              Ask me about EC2 or ask me to deploy an instance for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 min-h-full">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === 'assistant' && <Bot className="h-5 w-5 shrink-0" />}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm prose prose-sm dark:prose-invert max-w-none [&>pre]:bg-muted [&>pre]:p-2 [&>pre]:rounded [&>pre]:overflow-x-auto [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-4 [&>ol]:ml-4 [&>p]:my-2 [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base [&>code]:bg-muted [&>code]:px-1 [&>code]:rounded ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      dangerouslySetInnerHTML={{ __html: formattedMessages[index] || '' }}
                    />
                    {message.role === 'user' && <User className="h-5 w-5 shrink-0" />}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[80%] bg-muted rounded-lg p-3 shadow-sm border border-border">
                      <Bot className="h-5 w-5 shrink-0" />
                      <div className="flex space-x-1 items-center">
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="flex-none p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about EC2 or say 'deploy an instance'..."
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                  disabled={isChatLoading}
                />
                <Button onClick={handleChatSend} disabled={isChatLoading || !chatInput.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 