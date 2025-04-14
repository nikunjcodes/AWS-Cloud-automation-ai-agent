"use client"

import { AwsSetupGuide } from '@/components/auth/AwsSetupGuide';
import { useRouter } from 'next/navigation';

export default function CreateRolePage() {
  const router = useRouter();

  const handleArnSuccessfullySaved = () => {
    // Redirect to the main chat/dashboard page after ARN is saved
    router.push('/chat'); 
  };

  return (
    // Optional: Add some padding or centering if needed
    <div className="py-8">
      <AwsSetupGuide onArnSaved={handleArnSuccessfullySaved} />
    </div>
  );
} 