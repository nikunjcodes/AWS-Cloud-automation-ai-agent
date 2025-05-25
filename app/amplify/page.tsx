"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Github, ExternalLink, CheckCircle, CloudLightning } from "lucide-react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"

export default function AmplifyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [input1, setInput1] = useState("")
  const [input2, setInput2] = useState("")
  const [input3, setInput3] = useState("")
  const [selectedService, setSelectedService] = useState("amplify")
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!input1 || !input2 || !input3) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`https://p8j8jwxfa0.execute-api.us-east-1.amazonaws.com/prod/${selectedService}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "CloudGiniApp",
          repoUrl: input1,
          oauthToken: input2,
          branchName: input3,
        }),
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (response.ok) {
        const url = data.deployUrl || data.url || data.appUrl || data.websiteUrl
        if (url) {
          setDeploymentUrl(url)
          toast({
            title: "Deployment successful",
            description: "Your application has been deployed successfully!",
          })
        } else {
          console.error("No deployment URL in response:", data)
          toast({
            title: "Deployment completed",
            description: "Deployment completed but no URL was returned.",
            variant: "warning",
          })
        }
        setInput1("")
        setInput2("")
        setInput3("")
      } else {
        throw new Error(data.message || "Submission failed")
      }
    } catch (error: any) {
      console.error("Submission error:", error)
      toast({
        title: "Deployment failed",
        description: error.message || "Failed to submit data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const serviceOptions = [
    { value: "amplify", label: "AWS Amplify", description: "Deploy web apps with CI/CD" },
    { value: "ec2", label: "AWS EC2", description: "Virtual servers in the cloud" },
    { value: "lambda", label: "AWS Lambda", description: "Run code without servers" },
  ]

  const selectedServiceOption = serviceOptions.find((option) => option.value === selectedService)

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-6 border-b">
            <div className="flex items-center space-x-2">
              <CloudLightning className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Cloud Deployment Configuration</CardTitle>
            </div>
            <CardDescription className="text-base pt-1">
              Configure your GitHub repository details for deployment to {selectedServiceOption?.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-select">Deployment Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService} disabled={isSubmitting}>
                  <SelectTrigger id="service-select" className="w-full">
                    <SelectValue placeholder="Select deployment service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github-url">
                  GitHub Repository URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="github-url"
                    type="text"
                    placeholder="https://github.com/username/repository"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter the full URL to your GitHub repository</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oauth-token">
                  GitHub OAuth Token <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="oauth-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Your personal access token with repo and admin:repo_hook permissions
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch-name">
                  Branch Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="branch-name"
                  type="text"
                  placeholder="main"
                  value={input3}
                  onChange={(e) => setInput3(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">The branch you want to deploy (e.g., main, master, dev)</p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !input1 || !input2 || !input3}
                className="w-full h-11 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  "Deploy Application"
                )}
              </Button>
            </div>

            {isSubmitting && (
              <div className="flex flex-col items-center space-y-4 py-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
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
                      className="h-3 w-3 rounded-full bg-primary"
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
                      className="h-3 w-3 rounded-full bg-primary"
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
                      className="h-3 w-3 rounded-full bg-primary"
                    />
                  </div>
                  <span className="text-sm font-medium">Deploying your application...</span>
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-md">
                  This may take a few minutes. We're setting up your deployment environment, cloning your repository,
                  and building your application.
                </p>
              </div>
            )}

            {deploymentUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-6 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900"
              >
                <div className="flex items-center space-x-2 text-green-800 dark:text-green-400 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Deployment Successful!</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Your application has been deployed successfully and is now available online.
                </p>
                <div className="mb-4 p-3 bg-white dark:bg-black/20 rounded-md border border-green-200 dark:border-green-900/50">
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-300 break-all">
                    <span className="text-gray-500 dark:text-gray-400">URL: </span>
                    {deploymentUrl}
                  </p>
                </div>
                <Button
                  onClick={() => window.open(deploymentUrl, "_blank")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Deployed Application
                </Button>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="w-full pt-4 border-t text-xs text-muted-foreground">
              <p className="mb-1">
                <span className="font-semibold">Note:</span> Make sure your repository is accessible with the provided
                OAuth token.
              </p>
              <p>
                For more information on deployment options, refer to the{" "}
                <a href="#" className="text-primary hover:underline">
                  documentation
                </a>
                .
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
