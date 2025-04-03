"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cloud } from "lucide-react";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">AWS Automate</h1>
            </Link>
          </div>

          <h2 className="text-3xl font-bold mb-2">Create your account</h2>
          <p className="text-foreground/70 mb-8">Sign up to get started</p>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded bg-white/5 border-white/10" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded bg-white/5 border-white/10" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded bg-white/5 border-white/10" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="w-full p-2 border rounded bg-white/5 border-white/10" />
            </div>

            <button type="submit" className="w-full p-2 bg-primary text-white rounded" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-foreground/70">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-aws-blue relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-0"></div>
        <div className="absolute inset-0 bg-hero-pattern opacity-10 z-0"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-12">
          <div className="w-full max-w-lg text-center">
            <h2 className="text-4xl font-bold mb-6">AWS Cloud Automation</h2>
            <p className="text-lg mb-8">
              Deploy cloud infrastructure with the power of AI. Simply describe what you need,
              and our assistant will handle the rest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
