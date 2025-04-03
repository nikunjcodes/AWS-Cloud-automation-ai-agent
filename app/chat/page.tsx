"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, Bot, Cloud, Code2, Database, FileText, Send, Server, User, LogOut, Plus, Trash2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Chat {
  _id: string;
  title: string;
  updatedAt: string;
}

interface Message {
  role: "user" | "system";
  content: string;
  timestamp?: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Welcome to CloudAI Assistant. How can I help you with your cloud infrastructure today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.chat.messages);
        setCurrentChat(chatId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Conversation' }),
      });
      const data = await response.json();
      if (data.success) {
        setChats([data.chat, ...chats]);
        setCurrentChat(data.chat._id);
        setMessages([{
          role: "system",
          content: "Welcome to CloudAI Assistant. How can I help you with your cloud infrastructure today?",
        }]);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setChats(chats.filter(chat => chat._id !== chatId));
        if (currentChat === chatId) {
          setCurrentChat(null);
          setMessages([{
            role: "system",
            content: "Welcome to CloudAI Assistant. How can I help you with your cloud infrastructure today?",
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      let chatId = currentChat;
      
      // If no chat is selected, create a new one
      if (!chatId) {
        const newChatResponse = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'New Conversation' }),
        });
        const newChatData = await newChatResponse.json();
        if (newChatData.success) {
          chatId = newChatData.chat._id;
          setChats([newChatData.chat, ...chats]);
          setCurrentChat(chatId);
        } else {
          throw new Error('Failed to create new chat');
        }
      }

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: input }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        
        // Update chat list with new title if this is the first message
        if (messages.length === 1) {
          const updatedChats = chats.map(chat =>
            chat._id === chatId ? { ...chat, title: data.title } : chat
          );
          setChats(updatedChats);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
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
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chat History Sidebar */}
      <div className="w-64 bg-card border-r">
        <div className="p-4">
          <Button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-card/50 ${
                currentChat === chat._id ? 'bg-card/50' : ''
              }`}
              onClick={() => loadMessages(chat._id)}
            >
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{chat.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat._id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-3xl font-bold tracking-tight">AI Assistant</h2>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="destructive"
              size="sm"
              className="transition-all duration-300 hover:bg-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <Card className="h-[calc(100vh-220px)] bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Cloud Automation Assistant</CardTitle>
              <CardDescription>
                Ask me anything about cloud infrastructure, deployments, and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`flex items-start gap-3 max-w-[80%] ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                        } rounded-lg p-3 shadow-sm ${
                          message.role === "user" ? "" : "border border-border"
                        } transition-all duration-300 hover:scale-[1.01]`}
                      >
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                            message.role === "user" ? "bg-primary-foreground/20" : "bg-primary/20"
                          }`}
                        >
                          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className="text-sm">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3 max-w-[80%] bg-card rounded-lg p-3 shadow-sm border border-border">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                          <div
                            className="h-2 w-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="h-2 w-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 transition-all duration-300 focus:border-primary"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="transition-all duration-300 hover:scale-110"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

