"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cloud, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem("token", data.token);
      alert("Login Successful. Welcome back to AWS Automate!");
      router.push("/dashboard");
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
              <h1 className="text-2xl font-bold">Cloudinary</h1>
            </Link>
          </div>

          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-foreground/70 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded bg-white/5 border-white/10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-2 bg-primary text-white rounded"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-foreground/70">
            Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
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
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-medium mb-1">Infrastructure as Code</h3>
                <p className="text-sm text-white/80">Describe your needs in plain language</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-medium mb-1">Full AWS Integration</h3>
                <p className="text-sm text-white/80">Works with all major AWS services</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
