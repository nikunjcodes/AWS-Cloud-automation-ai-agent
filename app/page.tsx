"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, BarChart3, Cloud, Code2, Database, Server, Settings, Zap } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Home() {

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-10 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Cloud className="h-5 w-5 text-primary" />
            <span>CloudAI Platform</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#workflow" className="text-sm font-medium hover:text-primary">
              Workflow
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="default" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      setIsAuthenticated(false);
                      router.push('/login');
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign up
                </Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    AI-Driven Cloud Automation
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Automate resource provisioning, deployment, and service management with our intelligent cloud
                    orchestration platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-1.5 bg-primary hover:bg-primary/90">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/learn">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full overflow-hidden border-0 bg-card/60">
                  <CardContent className="p-0">
                    <video autoPlay loop muted playsInline className="w-full h-auto rounded-lg">
                      <source
                        src="https://cdn.dribbble.com/userupload/4165281/file/original-f6d1f9c7a3fbe2a84bd7c1c49c6af98f.mp4"
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card/30">
          <div className="container space-y-12 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Intelligent Cloud Orchestration
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform leverages LLMs and Infrastructure-as-Code to optimize your cloud deployments
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <Cloud className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Automated Provisioning</CardTitle>
                  <CardDescription>Intelligent resource allocation based on your requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes your needs and automatically provisions the optimal AWS resources for your workload.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <Code2 className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Infrastructure as Code</CardTitle>
                  <CardDescription>Terraform-based deployments with version control</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All infrastructure changes are managed through code, ensuring consistency and reproducibility.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Cost Optimization</CardTitle>
                  <CardDescription>Continuous monitoring and resource optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our platform constantly analyzes your usage patterns to recommend cost-saving measures.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="workflow" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our streamlined process makes cloud automation simple and efficient
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl items-center gap-6 py-12">
              <Tabs defaultValue="requirements" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                  <TabsTrigger value="confirmation">Confirmation</TabsTrigger>
                  <TabsTrigger value="deployment">Deployment</TabsTrigger>
                  <TabsTrigger value="management">Management</TabsTrigger>
                </TabsList>
                <TabsContent value="requirements" className="p-6 border rounded-md mt-4 bg-card/30">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Requirement Gathering</h3>
                      <p className="text-muted-foreground">
                        Describe your business requirements to our AI agent using natural language. No need for
                        technical specifications.
                      </p>
                      <div className="mt-4 p-4 bg-card rounded-md border border-border">
                        <p className="text-sm font-mono">
                          "I need a scalable web application with a database backend that can handle 10,000 concurrent
                          users."
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <Settings className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="analysis" className="p-6 border rounded-md mt-4 bg-card/30">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Requirement Analysis</h3>
                      <p className="text-muted-foreground">
                        Our AI analyzes your requirements and selects the appropriate AWS services to meet your needs.
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <p className="text-sm">EC2 Auto Scaling Group for web servers</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <p className="text-sm">RDS Aurora for database</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <p className="text-sm">Elastic Load Balancer for traffic distribution</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Database className="h-12 w-12 text-green-500" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="plan" className="p-6 border rounded-md mt-4 bg-card/30">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Deployment Plan</h3>
                      <p className="text-muted-foreground">
                        The AI creates a structured deployment plan with detailed resource specifications and cost
                        estimates.
                      </p>
                      <div className="mt-4 p-4 bg-card rounded-md border border-border">
                        <pre className="text-xs overflow-auto">
                          <code>
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
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Code2 className="h-12 w-12 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="confirmation" className="p-6 border rounded-md mt-4 bg-card/30">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">User Confirmation</h3>
                      <p className="text-muted-foreground">
                        Review and approve the deployment plan. Set up your AWS account credentials securely.
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button variant="default" size="sm">
                          Approve Plan
                        </Button>
                        <Button variant="outline" size="sm">
                          Request Changes
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Settings className="h-12 w-12 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="deployment" className="p-6 border rounded-md mt-4 bg-card/30">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Automated Deployment</h3>
                      <p className="text-muted-foreground">
                        The AI automates the deployment process using AWS tools and Infrastructure as Code.
                      </p>
                      <div className="mt-4 w-full bg-card rounded-md border border-border p-2">
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-primary rounded-full"></div>
                        </div>
                        <p className="text-xs text-center mt-1">Deployment in progress (75%)</p>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Cloud className="h-12 w-12 text-orange-500" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="management" className="p-6 border rounded-md mt-4 bg-card/30">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Data Management</h3>
                      <p className="text-muted-foreground">
                        Securely upload and manage your data in AWS with automated backups and monitoring.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="p-2 bg-card rounded-md border border-border text-center">
                          <p className="text-xs text-muted-foreground">CPU Usage</p>
                          <p className="text-lg font-bold">24%</p>
                        </div>
                        <div className="p-2 bg-card rounded-md border border-border text-center">
                          <p className="text-xs text-muted-foreground">Memory</p>
                          <p className="text-lg font-bold">1.2 GB</p>
                        </div>
                        <div className="p-2 bg-card rounded-md border border-border text-center">
                          <p className="text-xs text-muted-foreground">Storage</p>
                          <p className="text-lg font-bold">42 GB</p>
                        </div>
                        <div className="p-2 bg-card rounded-md border border-border text-center">
                          <p className="text-xs text-muted-foreground">Network</p>
                          <p className="text-lg font-bold">156 Mbps</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Server className="h-12 w-12 text-red-500" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-card/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Automate Your Cloud Infrastructure?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get started with our AI-driven cloud automation platform today
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-10 mt-8">
                <Card className="relative overflow-hidden border-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 pointer-events-none"></div>
                  <CardHeader>
                    <CardTitle>Starter</CardTitle>
                    <CardDescription>For small projects and teams</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">$49</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Up to 5 deployments
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Basic AI assistance
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Standard support
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-muted-foreground mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Cost optimization
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Get Started</Button>
                  </CardFooter>
                </Card>
                <Card className="relative overflow-hidden border-primary">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 pointer-events-none"></div>
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                    Popular
                  </div>
                  <CardHeader>
                    <CardTitle>Professional</CardTitle>
                    <CardDescription>For growing businesses</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">$149</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Up to 20 deployments
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Advanced AI assistance
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Priority support
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Cost optimization
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Get Started</Button>
                  </CardFooter>
                </Card>
                <Card className="relative overflow-hidden border-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 pointer-events-none"></div>
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                    <CardDescription>For large organizations</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">$499</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Unlimited deployments
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Premium AI assistance
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        24/7 dedicated support
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-primary mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Advanced cost optimization
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Contact Sales</Button>
                  </CardFooter>
                </Card>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-1.5">
                    Start Now
                    <Zap className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-card/80">
        <div className="container flex flex-col sm:flex-row py-6 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">CloudAI © {new Date().getFullYear()}</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:text-primary">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs hover:text-primary">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}