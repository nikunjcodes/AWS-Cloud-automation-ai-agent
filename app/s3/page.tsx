"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Bot, User, Send } from "lucide-react"
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function S3Page() {
  
  const [isLoading, setIsLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isConfirmationPending, setIsConfirmationPending] = useState(false)
  const [formData, setFormData] = useState({
    bucketName: `my-bucket-${Date.now()}`
  })
  const [url, setUrl] = useState("")
  const [uploadLink, setUploadLink] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to S3 Management! I can help you create and manage S3 buckets. What would you like to do?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [formattedMessages, setFormattedMessages] = useState<{ [key: number]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast()

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

  // Handle manual S3 bucket creation from form
  const handleDeploy = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/s3/deploy', {
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
          description: "S3 bucket created successfully",
        })
      } else {
        throw new Error(data.message || 'Failed to create S3 bucket')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to create S3 bucket',
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
    setIsConfirmationPending(false); // Reset confirmation pending state

    const confirmationKeywords = ["yes", "go ahead", "proceed"];
    const isConfirmationAttempt = confirmationKeywords.some(keyword => 
      currentInput.toLowerCase().includes(keyword)
    );

    // Check if user is confirming a pending deployment
    if (isConfirmationAttempt && isConfirmationPending) {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: "assistant", content: "Deploying your S3 bucket..." }]);
      try {
        // Use form data for parameters in this example
        const response = await fetch('/api/s3/deploy', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
             // NO Authorization header needed - uses cookie
          },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (data.success) {
          setMessages(prev => [...prev, { role: "assistant", content: `✅ S3 bucket created successfully: ${JSON.stringify(data)}` }]);
          toast({ title: "Success", description: "S3 bucket deployed via chat confirmation." });
        } else {
          throw new Error(data.message || 'Deployment failed via chat confirmation.')
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Deployment failed via chat confirmation.';
        setMessages(prev => [...prev, { role: "assistant", content: `❌ ${errorMsg}` }]);
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
      } finally {
        setIsLoading(false);
        setIsChatLoading(false);
        setIsConfirmationPending(false); // Reset confirmation
      }
      return; // Stop further processing for this message
    }

    // If not confirming, send message to chat API
    try {
      const response = await fetch('/api/s3/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
           // NO Authorization header needed - uses cookie
        },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await response.json();
      if (response.ok && data.response) {
        const aiMessage: Message = { role: "assistant", content: data.response };
        setMessages(prev => [...prev, aiMessage]);
        // Check if AI response asks for confirmation
        if (data.response.toLowerCase().includes("would you like me to proceed")) {
          setIsConfirmationPending(true);
        }
      } else {
         throw new Error(data.error || 'Failed to get response from S3 assistant');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to get response from S3 assistant';
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${errorMsg}` }]);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsChatLoading(false)
    }
  }

  // Handle file upload to S3
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Step 1: Get pre-signed POST data from Lambda
      const res = await fetch('https://p8j8jwxfa0.execute-api.us-east-1.amazonaws.com/prod/LOCAL_TO_S3');
      if (!res.ok) {
        throw new Error('Failed to get upload URL');
      }
      const { uploadUrl, filePublicUrl } = await res.json();

      // Step 2: Use FormData for S3 POST
      const formData = new FormData();
      Object.entries(uploadUrl.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', selectedFile);

      // Step 3: Upload the file to S3
      const uploadRes = await fetch(uploadUrl.url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (uploadRes.ok) {
        setFileUrl(filePublicUrl);
        toast({
          title: "Success",
          description: "File uploaded successfully!",
        });
      } else {
        const errorText = await uploadRes.text();
        console.error('Upload error:', errorText);
        throw new Error('Upload failed: ' + errorText);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deployment Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              S3 Bucket Creation
            </CardTitle>
            <CardDescription>
              Manually configure and create your S3 bucket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bucketName">Bucket Name</Label>
              <Input
                id="bucketName"
                value={formData.bucketName}
                onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                placeholder="Enter a unique bucket name"
              />
              <p className="text-xs text-muted-foreground">
                Must be globally unique. Example: my-unique-app-bucket-123
              </p>
            </div>
            <Button 
              onClick={handleDeploy}
              disabled={isLoading || isChatLoading || isConfirmationPending}
              className="w-full"
              title={isConfirmationPending ? "Please confirm or deny deployment via chat" : ""}
            >
              {isLoading ? "Creating..." : "Create S3 Bucket"}
            </Button>
            {
              uploadLink && (
                <>
                <Button 
                  onClick={() => window.open(url, '_blank')}
                  className="mt-4 w-full"
                >
                  Upload Data
                </Button>
                   <p className="text-xs text-muted-foreground">
                  Open the url in AWS account Owner's account 
                 </p>
                 <p className="text-xs text-muted-foreground">
                 copy url : ${url}
                 </p>
                 </>
              )
            }
          </CardContent>
        </Card>

        {/* File Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload HTML File
            </CardTitle>
            <CardDescription>
              Select and upload your HTML file to S3
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".html"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <Button 
                onClick={handleFileUpload}
                disabled={isUploading || !selectedFile}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Upload File"}
              </Button>
            </div>
            
            {isUploading && (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            )}

            {fileUrl && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Upload Successful!</h3>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-red-600">Live link</a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface Card */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              S3 Assistant
            </CardTitle>
            <CardDescription>
              Ask me about S3 or ask me to create a bucket for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4" ref={messagesEndRef}>
                {messages.map((message, index) => {
                  const isConfirmationRequest = message.role === 'assistant' && message.content.toLowerCase().includes("would you like me to proceed");
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === 'assistant' && <Bot className="h-5 w-5 shrink-0" />}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 text-sm prose prose-sm dark:prose-invert max-w-none [&>pre]:bg-muted [&>pre]:p-2 [&>pre]:rounded [&>pre]:overflow-x-auto [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-4 [&>ol]:ml-4 [&>p]:my-2 [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base [&>code]:bg-muted [&>code]:px-1 [&>code]:rounded ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"} ${isConfirmationRequest ? 'ring-2 ring-yellow-500 ring-offset-2 dark:ring-offset-background' : ''}`}
                        dangerouslySetInnerHTML={{ __html: formattedMessages[index] || '' }}
                      />
                      {message.role === 'user' && <User className="h-5 w-5 shrink-0" />}
                    </div>
                  );
                })}
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
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              {isConfirmationPending && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2 text-center">
                  Waiting for confirmation. Type "yes" to deploy using the current form values, or describe changes.
                </p>
              )}
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isConfirmationPending ? "Type 'yes' to confirm or describe changes..." : "Ask about S3 or say 'create a bucket'..."}
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