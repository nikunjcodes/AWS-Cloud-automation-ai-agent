"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Cloud,
  CloudOff,
  CreditCard,
  Database,
  DollarSign,
  Download,
  HelpCircle,
  RefreshCw,
  Server,
  Settings,
  Zap,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { NewDeploymentDialog } from "@/components/new-deployment-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)

    toast({
      title: "Dashboard refreshed",
      description: "All metrics and data have been updated.",
    })
  }

  const handleOptimize = () => {
    toast({
      title: "Optimization started",
      description: "We're analyzing your infrastructure for cost-saving opportunities.",
    })
  }

  const handleSupport = () => {
    toast({
      title: "Support request sent",
      description: "Our team will contact you shortly.",
    })
  }

  const handleBillingSettings = () => {
    toast({
      title: "Billing settings",
      description: "Redirecting to billing settings page.",
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="transition-all duration-300 data-[state=active]:scale-105">
            Overview
          </TabsTrigger>
          <TabsTrigger value="deployments" className="transition-all duration-300 data-[state=active]:scale-105">
            Deployments
          </TabsTrigger>
          <TabsTrigger value="resources" className="transition-all duration-300 data-[state=active]:scale-105">
            Resources
          </TabsTrigger>
          <TabsTrigger value="analytics" className="transition-all duration-300 data-[state=active]:scale-105">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
                <Cloud className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500 mr-1">+2</span> from last month
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resources</CardTitle>
                <Database className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500 mr-1">+8</span> from last month
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,350</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500 mr-1">-12%</span> from last month
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500 mr-1">+1</span> from last month
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle>Deployment Activity</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full rounded-md bg-card/30 border border-border flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 text-primary/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interactive deployment activity chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3 bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle>Recent Deployments</CardTitle>
                <CardDescription>Your most recent cloud deployments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center hover:bg-card/50 p-2 rounded-md transition-all duration-300 cursor-pointer">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Web Application Cluster</p>
                      <p className="text-sm text-muted-foreground">Deployed 2 hours ago</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center hover:bg-card/50 p-2 rounded-md transition-all duration-300 cursor-pointer">
                    <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Database Migration</p>
                      <p className="text-sm text-muted-foreground">Deployed 1 day ago</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center hover:bg-card/50 p-2 rounded-md transition-all duration-300 cursor-pointer">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Storage Expansion</p>
                      <p className="text-sm text-muted-foreground">Deployed 3 days ago</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center hover:bg-card/50 p-2 rounded-md transition-all duration-300 cursor-pointer">
                    <div className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">API Gateway</p>
                      <p className="text-sm text-muted-foreground">Failed 4 days ago</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CloudOff className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Current usage across your infrastructure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">CPU</div>
                      <div className="text-sm text-muted-foreground">65%</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[65%] rounded-full bg-primary transition-all duration-1000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Memory</div>
                      <div className="text-sm text-muted-foreground">48%</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[48%] rounded-full bg-primary transition-all duration-1000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Storage</div>
                      <div className="text-sm text-muted-foreground">72%</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[72%] rounded-full bg-primary transition-all duration-1000" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full transition-all duration-300 hover:bg-primary/10">
                  <Server className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Monthly cost by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full rounded-md bg-card/30 border border-border flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-10 w-10 text-primary/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interactive cost breakdown chart</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full transition-all duration-300 hover:bg-primary/10">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <NewDeploymentDialog />
                  <Button
                    variant="outline"
                    className="w-full justify-start transition-all duration-300 hover:bg-primary/10"
                    onClick={handleOptimize}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Run Optimization
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start transition-all duration-300 hover:bg-primary/10"
                    onClick={handleSupport}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Get Support
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start transition-all duration-300 hover:bg-primary/10"
                    onClick={handleBillingSettings}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Deployments</CardTitle>
                <CardDescription>Manage your current cloud deployments</CardDescription>
              </div>
              <NewDeploymentDialog />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="flex flex-col space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium leading-none">Web Application Cluster</p>
                          <p className="text-sm text-muted-foreground">Production</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Healthy</span>
                        </div>
                        <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-110">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium">Resources</p>
                        <p className="text-sm">12 instances</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Region</p>
                        <p className="text-sm">us-west-2</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Monthly Cost</p>
                        <p className="text-sm">$1,240</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="flex flex-col space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium leading-none">Database Cluster</p>
                          <p className="text-sm text-muted-foreground">Production</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Warning</span>
                        </div>
                        <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-110">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium">Resources</p>
                        <p className="text-sm">3 instances</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Region</p>
                        <p className="text-sm">us-east-1</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Monthly Cost</p>
                        <p className="text-sm">$680</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle>Resource Management</CardTitle>
              <CardDescription>View and manage your cloud resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full rounded-md bg-card/30 border border-border flex items-center justify-center mb-4">
                <div className="text-center">
                  <Server className="h-10 w-10 text-primary/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Interactive resource visualization</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Compute Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">EC2 Instances</span>
                          <span className="text-sm font-medium">24</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Lambda Functions</span>
                          <span className="text-sm font-medium">36</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">ECS Containers</span>
                          <span className="text-sm font-medium">12</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Storage Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">S3 Buckets</span>
                          <span className="text-sm font-medium">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">EBS Volumes</span>
                          <span className="text-sm font-medium">16</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">RDS Instances</span>
                          <span className="text-sm font-medium">4</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="transition-all duration-300 hover:bg-primary/10">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button className="transition-all duration-300 hover:scale-105">
                <Settings className="mr-2 h-4 w-4" />
                Manage Resources
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Monitor your cloud infrastructure performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full rounded-md bg-card/30 border border-border flex items-center justify-center mb-4">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 text-primary/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Interactive performance analytics chart</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">CPU Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">65%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">+5%</span> from last week
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[65%] rounded-full bg-primary transition-all duration-1000" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">48%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">-3%</span> from last week
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[48%] rounded-full bg-primary transition-all duration-1000" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Network Traffic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.2 TB</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">+12%</span> from last week
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[72%] rounded-full bg-primary transition-all duration-1000" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="transition-all duration-300 hover:bg-primary/10">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button className="transition-all duration-300 hover:scale-105">
                <BarChart3 className="mr-2 h-4 w-4" />
                Detailed Analytics
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

