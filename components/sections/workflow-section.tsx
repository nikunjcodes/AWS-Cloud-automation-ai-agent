"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { CheckCircle, Cloud, Code2, Database, Server, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/enhanced-tabs"
import { Section, SectionBadge, SectionDescription, SectionHeader, SectionTitle } from "@/components/ui/section"
import { IntersectionObserver } from "@/components/ui/intersection-observer"
import { AnimatedText } from "@/components/ui/animated-text"

export function WorkflowSection() {
  const [activeTab, setActiveTab] = useState("requirements")
  const { ref: sectionRef, inView: isInView } = useInView({ threshold: 0.3, triggerOnce: false })

  // Workflow steps data
  const workflowSteps = [
    {
      id: "requirements",
      title: "Requirement Gathering",
      description:
        "Describe your business requirements to our AI agent using natural language. No need for technical specifications.",
      step: 1,
      color: "primary",
      icon: <Settings className="h-16 w-16" />,
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
      icon: <Database className="h-16 w-16" />,
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
      icon: <Code2 className="h-16 w-16" />,
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
      icon: <Settings className="h-16 w-16" />,
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
      icon: <Cloud className="h-16 w-16" />,
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
      icon: <Server className="h-16 w-16" />,
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

  return (
    <Section id="workflow" ref={sectionRef} className="w-full py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <SectionHeader>
          <SectionBadge>
            <AnimatedText text="Streamlined Process" animationType="fade" delay={0.1} duration={0.5} />
          </SectionBadge>
          <SectionTitle>
            <AnimatedText text="How It Works" animationType="slide-up" delay={0.2} duration={0.5} />
          </SectionTitle>
          <SectionDescription>
            <AnimatedText
              text="Our streamlined process makes cloud automation simple and efficient"
              animationType="slide-up"
              delay={0.3}
              duration={0.5}
            />
          </SectionDescription>
        </SectionHeader>

        <IntersectionObserver threshold={0.2} delay={0.2} duration={0.6} animationVariants="fade">
          <div className="mx-auto max-w-5xl items-center gap-6">
            <Tabs defaultValue="requirements" className="w-full" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 p-1 bg-background/80 backdrop-blur-sm border rounded-full shadow-sm">
                {workflowSteps.map((step) => (
                  <TabsTrigger
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
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="relative mt-8">
                <AnimatePresence mode="wait">
                  {workflowSteps.map(
                    (step) =>
                      activeTab === step.id && (
                        <TabsContent
                          key={step.id}
                          value={step.id}
                          className="relative rounded-2xl border bg-background/95 backdrop-blur-sm shadow-lg"
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br from-${step.color}/5 to-transparent pointer-events-none rounded-2xl`}
                          ></div>
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
                                  <span className={`text-${step.color}`}>{step.icon}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      ),
                  )}
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </IntersectionObserver>
      </div>
    </Section>
  )
}
