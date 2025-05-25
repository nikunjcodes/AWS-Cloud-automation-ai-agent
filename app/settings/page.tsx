"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud, User, Key, Trash2 } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  awsCredentials: {
    accessKey: string | null;
    secretKey: string | null;
    region: string;
  };
}

export default function Settings() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        const data = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user data");
        }

        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/auth/delete", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }

      router.push("/login");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid gap-8">
          {/* Profile Section */}
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Name
                </label>
                <div className="p-3 bg-background rounded-lg border border-border">
                  {userData?.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Email
                </label>
                <div className="p-3 bg-background rounded-lg border border-border">
                  {userData?.email}
                </div>
              </div>
            </div>
          </div>

          {/* AWS Credentials Section */}
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">AWS Credentials</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Access Key
                </label>
                <div className="p-3 bg-background rounded-lg border border-border">
                  {userData?.awsCredentials.accessKey || "Not set"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Secret Key
                </label>
                <div className="p-3 bg-background rounded-lg border border-border flex items-center justify-between">
                  <span>
                    {showSecretKey
                      ? userData?.awsCredentials.secretKey || "Not set"
                      : "••••••••••••••••"}
                  </span>
                  <button
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {showSecretKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Region
                </label>
                <div className="p-3 bg-background rounded-lg border border-border">
                  {userData?.awsCredentials.region}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
            </div>
            <p className="text-foreground/70 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 