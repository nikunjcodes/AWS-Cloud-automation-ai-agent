"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Server, Database, Cloud } from "lucide-react"

export function NewDeploymentDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deploymentType, setDeploymentType] = useState("web-app")
  const [name, setName] = useState("")
  const [region, setRegion] = useState("us-west-2")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a deployment name",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Deployment created",
      description: `${name} is now being provisioned in ${region}`,
    })

    setIsLoading(false)
    setOpen(false)
    setName("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 transition-all duration-300 hover:scale-105">
          <Plus className="h-4 w-4" />
          New Deployment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Deployment</DialogTitle>
            <DialogDescription>Configure your new cloud deployment. Click deploy when you're ready.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="My Web Application"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={deploymentType} onValueChange={setDeploymentType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select deployment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-app">
                    <div className="flex items-center">
                      <Server className="mr-2 h-4 w-4 text-primary" />
                      <span>Web Application</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="database">
                    <div className="flex items-center">
                      <Database className="mr-2 h-4 w-4 text-primary" />
                      <span>Database Cluster</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="storage">
                    <div className="flex items-center">
                      <Cloud className="mr-2 h-4 w-4 text-primary" />
                      <span>Storage Buckets</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Region
              </Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                  <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="environment" className="text-right">
                Environment
              </Label>
              <Select defaultValue="production">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="transition-all duration-300 hover:scale-105">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>Deploy</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

