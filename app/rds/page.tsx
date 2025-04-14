"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Database, Bot, User, Send } from "lucide-react"
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
});

interface Message {
  role: "user" | "assistant";
  content: string;
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
    vpcSecurityGroupId: ""
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

What would you like to do?`
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [formattedMessages, setFormattedMessages] = useState<{ [key: number]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast()

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
            // Extract security group ID from credentials
            const securityGroupId = data.credentials.securityGroupId || '';

            console.log('Setting form data with:', {
              securityGroupId
            });

            setFormData(prev => ({
              ...prev,
              vpcSecurityGroupId: securityGroupId
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

  // Handle manual RDS instance creation from form
  const handleDeploy = async () => {
    if (!formData.dbName || !formData.masterPassword || !formData.vpcSecurityGroupId) {
        toast({ title: "Error", description: "Database Name, Master Password, and Security Group ID are required.", variant: "destructive" });
        return;
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/rds/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "RDS instance created successfully",
        })
      } else {
        throw new Error(data.message || 'Failed to create RDS instance')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to create RDS instance',
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
      const response = await fetch('/api/rds/chat', {
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
        throw new Error(errorData.message || 'Failed to get response from RDS assistant');
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
      const errorMsg = error.message || 'Failed to get response from RDS assistant';
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deployment Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              RDS Instance Deployment
            </CardTitle>
            <CardDescription>
              Configure and deploy your RDS instance using your AWS credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbInstanceClass">Instance Class</Label>
                <Select
                  value={formData.dbInstanceClass}
                  onValueChange={(value) => setFormData({ ...formData, dbInstanceClass: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instance class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="db.t2.micro">db.t2.micro (1 vCPU, 1GB RAM)</SelectItem>
                    <SelectItem value="db.t3.small">db.t3.small (2 vCPU, 2GB RAM)</SelectItem>
                    <SelectItem value="db.m5.large">db.m5.large (2 vCPU, 8GB RAM)</SelectItem>
                    <SelectItem value="db.r5.xlarge">db.r5.xlarge (4 vCPU, 32GB RAM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="engine">Database Engine</Label>
                <Select
                  value={formData.engine}
                  onValueChange={(value) => setFormData({ ...formData, engine: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select database engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                    <SelectItem value="mariadb">MariaDB</SelectItem>
                    <SelectItem value="oracle-se2">Oracle</SelectItem>
                    <SelectItem value="sqlserver-ex">SQL Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbName">Database Name</Label>
                <Input
                  id="dbName"
                  value={formData.dbName}
                  onChange={(e) => setFormData({ ...formData, dbName: e.target.value })}
                  placeholder="Enter database name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="masterUsername">Master Username</Label>
                <Input
                  id="masterUsername"
                  value={formData.masterUsername}
                  onChange={(e) => setFormData({ ...formData, masterUsername: e.target.value })}
                  placeholder="Enter master username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="masterPassword">Master Password</Label>
                <Input
                  id="masterPassword"
                  type="password"
                  value={formData.masterPassword}
                  onChange={(e) => setFormData({ ...formData, masterPassword: e.target.value })}
                  placeholder="Enter master password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocatedStorage">Allocated Storage (GB)</Label>
                <Input
                  id="allocatedStorage"
                  type="number"
                  value={formData.allocatedStorage}
                  onChange={(e) => setFormData({ ...formData, allocatedStorage: parseInt(e.target.value) })}
                  min="20"
                  max="65536"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vpcSecurityGroupId">Security Group ID</Label>
                <Input
                  id="vpcSecurityGroupId"
                  value={formData.vpcSecurityGroupId}
                  onChange={(e) => setFormData({ ...formData, vpcSecurityGroupId: e.target.value })}
                  placeholder="Security group ID"
                  disabled={!!formData.vpcSecurityGroupId}
                />
              </div>
            </div>
            <Button 
              onClick={handleDeploy}
              disabled={isLoading || isChatLoading || isConfirmationPending}
              className="w-full"
              title={isConfirmationPending ? "Please confirm or deny deployment via chat" : ""}
            >
              {isLoading ? "Creating..." : "Create RDS Instance"}
            </Button>
          </CardContent>
        </Card>

        {/* Chat Interface Card */}
        <Card className="flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="flex-none">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              RDS Assistant
            </CardTitle>
            <CardDescription>
              Ask me about RDS or ask me to create a database for you.
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
                  placeholder="Ask about RDS or say 'create a database'..."
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