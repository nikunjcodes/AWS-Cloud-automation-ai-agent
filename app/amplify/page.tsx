'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AmplifyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [selectedService, setSelectedService] = useState('amplify');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input1 || !input2 || !input3) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`https://p8j8jwxfa0.execute-api.us-east-1.amazonaws.com/prod/${selectedService}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "appName": "CloudGiniApp",
          "repoUrl": input1,
          "oauthToken": input2,
          "branchName": input3
        })
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        const url = data.deployUrl || data.url || data.appUrl || data.websiteUrl;
        if (url) {
          setDeploymentUrl(url);
          toast({
            title: "Success",
            description: "Application deployed successfully!",
          });
        } else {
          console.error('No deployment URL in response:', data);
          toast({
            title: "Warning",
            description: "Deployment completed but no URL was returned.",
            variant: "destructive"
          });
        }
        setInput1('');
        setInput2('');
        setInput3('');
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cloud Deployment Configuration</CardTitle>
          <CardDescription>Enter your GitHub repository details and select deployment service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Select
              value={selectedService}
              onValueChange={setSelectedService}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select deployment service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amplify">AWS Amplify</SelectItem>
                <SelectItem value="ec2">AWS EC2</SelectItem>
                <SelectItem value="lambda">AWS Lambda</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Enter github url"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              type="text"
              placeholder="Enter github OAuth token"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              type="text"
              placeholder="Enter github branch name"
              value={input3}
              onChange={(e) => setInput3(e.target.value)}
              disabled={isSubmitting}
            />
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !input1 || !input2 || !input3}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
          
          {isSubmitting && (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              <span className="text-sm text-muted-foreground">Submitting...</span>
            </div>
          )}

          {deploymentUrl && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Deployment Successful!</h3>
              <p className="text-sm text-green-600 mb-3">Your application has been deployed successfully.</p>
              <div className="mb-3 p-2 bg-white rounded border">
                <p className="text-sm text-gray-600 break-all">Deployment URL: {deploymentUrl}</p>
              </div>
              <Button
                onClick={() => window.open(deploymentUrl, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                View Deployed Application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}