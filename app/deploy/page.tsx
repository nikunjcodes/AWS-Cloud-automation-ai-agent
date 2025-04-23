'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function DeployPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Step 1: Get pre-signed POST data from Lambda
      const res = await fetch('https://p8j8jwxfa0.execute-api.us-east-1.amazonaws.com/prod/LOCAL_TO_S3');
      if (!res.ok) {
        throw new Error('Failed to get upload URL');
      }
      const { uploadUrl, filePublicUrl } = await res.json();

      // Step 2: Use FormData for S3 POST
      const formData = new FormData();
      Object.entries(uploadUrl.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', selectedFile);

      // Step 3: Upload the file to S3
      const uploadRes = await fetch(uploadUrl.url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (uploadRes.ok) {
        setFileUrl(filePublicUrl);
        toast({
          title: "Success",
          description: "File uploaded successfully!",
        });
      } else {
        const errorText = await uploadRes.text();
        console.error('Upload error:', errorText);
        throw new Error('Upload failed: ' + errorText);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload HTML File</CardTitle>
          <CardDescription>Select and upload your HTML file to S3</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".html"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button 
              onClick={handleSubmit}
              disabled={isUploading || !selectedFile}
              className="w-full"
            >
              {isUploading ? "Submitting..." : "Submit File"}
            </Button>
          </div>
          
          {isUploading && (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </div>
          )}

          {fileUrl && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Upload Successful!</h3>
              <p className="text-sm break-all">Public File URL: {fileUrl}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
