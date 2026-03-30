import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card } from "@/app/components/ui/card";
import { VeridexLogo } from "@/app/components/VeridexLogo";
import { authAPI } from "@/services/api";
import { toast } from "sonner";
import type { User } from "@/app/App";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";

interface LoginPageProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
}

export function LoginPage({ onLogin, onSwitchToSignup }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set SEO for login page
  useSEO(SEO_CONFIGS.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sign in with Supabase
      await authAPI.signIn(email, password);
      
      // Wait for session to be fully persisted and available
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get user profile
      const userData = await authAPI.getMe();
      
      onLogin(userData);
      toast.success("Welcome back!");
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check if it's a server connectivity issue
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError("⚠️ Cannot connect to server. Please check if the backend is deployed.");
        toast.error("Server Connection Error", {
          description: "Make sure your Supabase Edge Function is deployed",
        });
      } else if (err.message?.includes('Invalid login credentials')) {
        setError("Incorrect email or password");
        toast.error("Login Failed", {
          description: "Please check your credentials",
        });
      } else {
        setError(err.message || "Login failed. Please try again.");
        toast.error("Login Error", {
          description: err.message || "An unexpected error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword("demo");
    setIsLoading(true);
    setError("");

    try {
      await authAPI.signIn(userEmail, "demo");
      
      // Wait for session to be fully persisted and available
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData = await authAPI.getMe();
      onLogin(userData);
      toast.success("Demo login successful!");
    } catch (err: any) {
      console.error('Demo login error:', err);
      
      // Provide detailed error message based on what failed
      if (err.message.includes('Invalid login credentials')) {
        setError("⚠️ Demo users haven't been created yet. Please follow the setup instructions in START_HERE.md to create demo users first.");
        toast.error("Demo Users Not Created", {
          description: "Follow setup guide to create demo users in Supabase",
          duration: 5000,
        });
      } else if (err.message.includes('Failed to fetch user')) {
        setError("⚠️ Demo user exists in Auth but not in database. Please run the user profile SQL from QUICK_START.md Step 2.2");
        toast.error("User Profile Missing", {
          description: "Run SQL to create user_profiles entries",
          duration: 5000,
        });
      } else {
        setError(`Demo login failed: ${err.message}. See setup documentation for help.`);
        toast.error("Demo login failed", {
          description: err.message,
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <VeridexLogo className="w-32 h-32" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Veridex</h1>
          <p className="text-lg text-muted-foreground font-medium">Scale what actually matters</p>
          <p className="text-sm text-muted-foreground mt-1">Turn Hustle Into Data</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-2xl border-border bg-card/50 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-input-background border-border text-foreground"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Enter Dashboard"}
            </Button>
          </form>

          {/* Demo Accounts */}
          {/*  <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 text-center">Demo Accounts:</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs bg-secondary/50 hover:bg-secondary border-border"
                onClick={() => handleDemoLogin("owner@olympus.com")}
              >
                <span className="font-semibold mr-2 text-primary">Owner:</span>
                owner@olympus.com / demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs bg-secondary/50 hover:bg-secondary border-border"
                onClick={() => handleDemoLogin("jake@olympus.com")}
              >
                <span className="font-semibold mr-2 text-primary">Rep:</span>
                jake@olympus.com / demo
              </Button>
            </div>
           </div> */}

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-primary hover:underline font-medium"
              >
                Create one now
              </button>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Built for Fuerza Concepts
        </p>
      </div>
    </div>
  );
}