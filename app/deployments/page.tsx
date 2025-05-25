"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Code2,
  Filter,
  RefreshCw,
  Search,
  Settings,
  Trash2,
} from "lucide-react"
import { NewDeploymentDialog } from "@/components/new-deployment-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function DeploymentsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)

    toast({
      title: "Deployments refreshed",
      description: "All deployment data has been updated.",
    })
  }

  const handleManage = (name: string) => {
    toast({
      title: "Managing deployment",
      description: `Opening management console for ${name}`,
    })
  }

  const handleViewDetails = (name: string) => {
    toast({
      title: "Viewing details",
      description: `Loading detailed information for ${name}`,
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Deployments</h2>
        <div className="flex items-center space-x-2">
          <NewDeploymentDialog />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex w-full md:w-auto items-center space-x-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search deployments..."
              className="w-full pl-8 transition-all duration-300 focus:border-primary"
            />
          </div>
          <Button variant="outline" size="icon" className="transition-all duration-300 hover:bg-primary/10">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="transition-all duration-300 hover:bg-primary/10"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <div className="flex w-full md:w-auto items-center space-x-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px] transition-all duration-300 focus:border-primary">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px] transition-all duration-300 focus:border-primary">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
              <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
              <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
              <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="transition-all duration-300 data-[state=active]:scale-105">
            All Deployments
          </TabsTrigger>
          <TabsTrigger value="active" className="transition-all duration-300 data-[state=active]:scale-105">
            Active
          </TabsTrigger>
          <TabsTrigger value="warning" className="transition-all duration-300 data-[state=active]:scale-105">
            Warning
          </TabsTrigger>
          <TabsTrigger value="error" className="transition-all duration-300 data-[state=active]:scale-105">
            Error
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle>Deployment List</CardTitle>
              <CardDescription>Manage and monitor your cloud deployments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Region</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Resources
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Last Updated
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted hover:scale-[1.01] duration-300">
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium">Web Application Cluster</span>
                            <span className="text-xs text-muted-foreground">Production</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            <span>Healthy</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">us-west-2</td>
                        <td className="p-4 align-middle">12 instances</td>
                        <td className="p-4 align-middle">2 hours ago</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleManage("Web Application Cluster")}
                              className="transition-all duration-300 hover:scale-110"
                            >
                              <Settings className="h-4 w-4" />
                              <span className="sr-only">Settings</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="transition-all duration-300 hover:scale-110 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted hover:scale-[1.01] duration-300">
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium">Database Cluster</span>
                            <span className="text-xs text-muted-foreground">Production</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                            <span>Warning</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">us-east-1</td>
                        <td className="p-4 align-middle">3 instances</td>
                        <td className="p-4 align-middle">1 day ago</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleManage("Database Cluster")}
                              className="transition-all duration-300 hover:scale-110"
                            >
                              <Settings className="h-4 w-4" />
                              <span className="sr-only">Settings</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="transition-all duration-300 hover:scale-110 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted hover:scale-[1.01] duration-300">
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium">API Gateway</span>
                            <span className="text-xs text-muted-foreground">Production</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                            <span>Error</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">us-west-2</td>
                        <td className="p-4 align-middle">4 instances</td>
                        <td className="p-4 align-middle">4 days ago</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleManage("API Gateway")}
                              className="transition-all duration-300 hover:scale-110"
                            >
                              <Settings className="h-4 w-4" />
                              <span className="sr-only">Settings</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="transition-all duration-300 hover:scale-110 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted hover:scale-[1.01] duration-300">
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium">Storage Buckets</span>
                            <span className="text-xs text-muted-foreground">Production</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            <span>Healthy</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">us-west-2</td>
                        <td className="p-4 align-middle">5 buckets</td>
                        <td className="p-4 align-middle">3 days ago</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleManage("Storage Buckets")}
                              className="transition-all duration-300 hover:scale-110"
                            >
                              <Settings className="h-4 w-4" />
                              <span className="sr-only">Settings</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="transition-all duration-300 hover:scale-110 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4">
              <div className="text-xs text-muted-foreground">Showing 4 of 4 deployments</div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled className="transition-all duration-300">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled className="transition-all duration-300">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle>Active Deployments</CardTitle>
              <CardDescription>Healthy and operational deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Web Application Cluster</h3>
                        <p className="text-sm text-muted-foreground">Production • us-west-2</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                    >
                      Healthy
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Resources</p>
                      <p className="font-medium">12 instances</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">99.98%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Cost</p>
                      <p className="font-medium">$1,240</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManage("Web Application Cluster")}
                      className="transition-all duration-300 hover:bg-primary/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails("Web Application Cluster")}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      <Cloud className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border p-4 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Storage Buckets</h3>
                        <p className="text-sm text-muted-foreground">Production • us-west-2</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                    >
                      Healthy
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Resources</p>
                      <p className="font-medium">5 buckets</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">100%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Cost</p>
                      <p className="font-medium">$430</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManage("Storage Buckets")}
                      className="transition-all duration-300 hover:bg-primary/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails("Storage Buckets")}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      <Cloud className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warning" className="space-y-4">
          <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle>Warning Deployments</CardTitle>
              <CardDescription>Deployments with potential issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Database Cluster</h3>
                        <p className="text-sm text-muted-foreground">Production • us-east-1</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                    >
                      Warning
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Resources</p>
                      <p className="font-medium">3 instances</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">98.5%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Cost</p>
                      <p className="font-medium">$680</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="inline-block h-4 w-4 mr-1" />
                      High CPU utilization detected. Consider scaling up resources.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManage("Database Cluster")}
                      className="transition-all duration-300 hover:bg-primary/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails("Database Cluster")}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      <Cloud className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error" className="space-y-4">
          <Card className="bg-card/60 border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle>Error Deployments</CardTitle>
              <CardDescription>Deployments with critical issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <CloudOff className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">API Gateway</h3>
                        <p className="text-sm text-muted-foreground">Production • us-west-2</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      Error
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Resources</p>
                      <p className="font-medium">4 instances</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">76.2%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Cost</p>
                      <p className="font-medium">$520</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      <CloudOff className="inline-block h-4 w-4 mr-1" />
                      Service unavailable. Network connectivity issues detected.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" className="transition-all duration-300 hover:bg-primary/10">
                      <Code2 className="mr-2 h-4 w-4" />
                      View Logs
                    </Button>
                    <Button size="sm" variant="destructive" className="transition-all duration-300 hover:scale-105">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restart Service
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

