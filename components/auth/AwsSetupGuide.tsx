"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Info, Copy } from 'lucide-react';
import { ArnManager } from '@/components/ArnManager';

interface AwsSetupGuideProps {
  onArnSaved: () => void; // Callback function when ARN is successfully saved
}

export function AwsSetupGuide({ onArnSaved }: AwsSetupGuideProps) {
  const [roleArn, setRoleArn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // **IMPORTANT**: Replace this placeholder with your actual AWS Account ID
  // It's best to fetch this from an environment variable
  const appAwsAccountId = process.env.NEXT_PUBLIC_APP_AWS_ACCOUNT_ID || '[YOUR_APP_AWS_ACCOUNT_ID]';

  const handleSaveArn = async () => {
    if (!roleArn.trim() || !roleArn.startsWith('arn:aws:iam::')) {
      toast({
        title: 'Invalid ARN', 
        description: 'Please enter a valid AWS IAM Role ARN.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/save-arn', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // This is important for sending cookies
        body: JSON.stringify({ 
          arn: roleArn.trim(),
          service: 'iam',
          description: 'Cross-account IAM role for AWS automation'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save ARN');
      }

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Success!', description: 'AWS Role ARN saved successfully.' });
        onArnSaved();
      } else {
        throw new Error(data.error || 'Failed to save ARN');
      }
    } catch (error: any) {
      toast({
        title: 'Error Saving ARN', 
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ description: 'Account ID copied to clipboard!' });
    }, (err) => {
      toast({ description: 'Failed to copy Account ID.', variant: 'destructive'});
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="border-yellow-500 border-2">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Connect Your AWS Account</CardTitle>
          <CardDescription className="text-center text-lg">
            To allow CloudAI Assistant to manage resources, please create an IAM Role in your AWS account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Follow these steps carefully in your <strong>own</strong> AWS Management Console.
              This allows our application (running in AWS account{' '}
              <code className="bg-muted px-1 rounded font-mono text-sm">{appAwsAccountId}</code>
              <Button variant="ghost" size="sm" className="ml-1 h-6 px-1" onClick={() => copyToClipboard(appAwsAccountId)} title="Copy Account ID">
                <Copy className="h-3 w-3" />
              </Button>
              ) to automate tasks on your behalf.
            </p>
            
            <ol className="space-y-4 list-decimal list-inside">
              <li>
                <strong>Sign in to your AWS Account:</strong> Go to the{' '}
                <a href="https://aws.amazon.com/console/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  AWS Management Console
                </a> and sign in.
              </li>
              <li>
                <strong>Navigate to IAM:</strong> In the search bar at the top, type <strong>IAM</strong> and select it from the results.
              </li>
              <li>
                <strong>Start Role Creation:</strong> In the IAM dashboard, click on <strong>Roles</strong> in the left-hand navigation menu, then click the <strong>Create role</strong> button.
              </li>
              <li>
                <strong>Select Trusted Entity:</strong>
                <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                  <li>For 'Trusted entity type', select <strong>AWS account</strong>.</li>
                  <li>Below that, choose <strong>Another AWS account</strong>.</li>
                  <li>
                    In the 'Account ID' field, enter <strong>our application's AWS Account ID</strong>:
                    <div className="my-2 p-2 bg-muted rounded inline-flex items-center"> 
                      <code className="font-mono text-sm">{appAwsAccountId}</code>
                      <Button variant="ghost" size="sm" className="ml-2 h-6 px-1" onClick={() => copyToClipboard(appAwsAccountId)} title="Copy Account ID">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <br/>
                    <span className="text-xs text-muted-foreground"> (Please double-check this ID carefully!)</span>
                  </li>
                </ul>
                 Click <strong>Next</strong>.
              </li>
              <li>
                <strong>Attach Permissions Policy:</strong>
                <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                  <li>In the 'Permissions policies' search bar, type <strong>AdministratorAccess</strong>.</li>
                  <li>Check the box next to the policy named `AdministratorAccess`.</li>
                  <li>
                     <span className="text-xs text-muted-foreground">
                       (<Info className="inline h-3 w-3 mr-1"/>This grants broad permissions initially. You can refine this later with more specific policies if needed for enhanced security.)
                     </span>
                  </li>
                </ul>
                 Click <strong>Next</strong>.
              </li>
              <li>
                <strong>Name the Role:</strong>
                 <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                    <li>For 'Role name', enter exactly: <code className="bg-muted px-1 rounded font-mono text-sm">AutomationCrossAccountRole</code></li>
                    <li>You can add an optional description if you like.</li>
                 </ul>
              </li>
              <li>
                <strong>Review and Create:</strong> Scroll down, review the details (especially the Trusted entities and Permissions), and click <strong>Create role</strong>.
              </li>
              <li>
                <strong>Find and Copy the Role ARN:</strong>
                 <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                    <li>After creation, you'll see a success message. Click on <strong>View role</strong> or find the role named `AutomationCrossAccountRole` in your roles list.</li>
                    <li>On the role's summary page, find the <strong>ARN</strong> at the top. It looks like: <code className="bg-muted px-1 rounded font-mono text-sm">arn:aws:iam::[Your_Account_ID]:role/AutomationCrossAccountRole</code>.</li>
                    <li>Click the copy icon next to the ARN.</li>
                 </ul>
              </li>
              <li>
                <strong>Paste the ARN Below:</strong> Come back to this page and paste the copied ARN into the input field below.
              </li>
            </ol>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="aspect-video w-full max-w-2xl mx-auto">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/ubrE4xq9_9c?si=rR_NeUEcJ7T6vXmv" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>

            <div className="space-y-2">
              <label htmlFor="roleArn" className="text-lg font-semibold">Paste your Role ARN here:</label>
              <div className="flex gap-2">
                 <Input
                   id="roleArn"
                   type="text"
                   value={roleArn}
                   onChange={(e) => setRoleArn(e.target.value)}
                   placeholder="arn:aws:iam::123456789012:role/AutomationCrossAccountRole"
                   className="font-mono"
                   disabled={isLoading}
                 />
                 <Button onClick={handleSaveArn} disabled={isLoading || !roleArn.trim()}>
                   {isLoading ? 'Saving...' : 'Save & Connect AWS'}
                 </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ensure you paste the full ARN copied from your AWS account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <ArnManager />
    </div>
  );
} 