"use client"

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export default function AwsAccountCheckPage() {
  const router = useRouter();
  const [showCreateInstructions, setShowCreateInstructions] = useState(false);

  const handleYes = () => {
    router.push('/onboarding/create-role');
  };

  const handleNo = () => {
    setShowCreateInstructions(true);
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">AWS Account Check</CardTitle>
          <CardDescription className="text-center text-lg">
            To connect CloudAI Assistant, we need an AWS account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showCreateInstructions ? (
            <div className="text-center space-y-4">
              <p>Do you already have an AWS account?</p>
              <div className="flex justify-center gap-4">
                <Button onClick={handleYes} size="lg">Yes, I have an account</Button>
                <Button onClick={handleNo} variant="outline" size="lg">No, I need to create one</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold">Creating an AWS Account</h3>
              <p>
                To use CloudAI Assistant's deployment features, you'll need an AWS account. AWS offers a generous Free Tier for new users.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Go to the <a href="https://aws.amazon.com/free/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AWS Free Tier page</a>.
                </li>
                <li>Click on "Create a Free Account".</li>
                <li>Follow the on-screen instructions. You will need to provide contact information and a payment method (it won't be charged unless you exceed Free Tier limits).</li>
                <li>Choose a support plan (the "Basic Support - Free" option is recommended to start).</li>
                <li>Once your account is created and verified (this might take a few minutes), sign in to the AWS Management Console.</li>
              </ol>
              <p className="font-semibold">
                After creating your account, please come back and click the button below.
              </p>
              <div className="text-center pt-4">
                <Button onClick={handleYes} size="lg">
                  Okay, I have created my AWS account
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 