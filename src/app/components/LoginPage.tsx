import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { authAPI } from "@/services/api";
import type { User } from "@/app/App";

interface LoginPageProps {
  onLogin: (user: User) => void;
  onShowDebug?: () => void;
}

export function LoginPage({ onLogin, onShowDebug }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sign in with Supabase
      await authAPI.signIn(email, password);
      
      // Get user profile
      const userData = await authAPI.getMe();
      
      onLogin(userData);
      toast.success("Welcome back!");
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Invalid email or password");
      toast.error("Login failed", {
        description: err.message || "Please check your credentials"
      });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Averix</h1>
          <p className="text-gray-600 font-medium">Turn Hustle Into Math</p>
          <p className="text-sm text-gray-500 mt-1">Scale What Actually Works</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-xl">
          {/* Setup Warning Banner */}
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-amber-900 text-sm mb-1">First Time Setup Required</h3>
                <p className="text-xs text-amber-800 mb-2">
                  Demo users need to be created before login will work.
                </p>
                <p className="text-xs text-amber-700 font-mono">
                  See <strong>START_HERE.md</strong> for 5-minute setup
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-600">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Enter Dashboard"}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-600 mb-3 text-center">Demo Accounts:</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => handleDemoLogin("owner@olympus.com")}
              >
                <span className="font-semibold mr-2">Owner:</span>
                owner@olympus.com / demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => handleDemoLogin("jake@olympus.com")}
              >
                <span className="font-semibold mr-2">Rep:</span>
                jake@olympus.com / demo
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Built for Cydcor owners and retail sales teams
        </p>

        {/* Debug Button */}
        {onShowDebug && (
          <div className="mt-4 text-center">
            <button
              onClick={onShowDebug}
              className="text-xs text-gray-500 hover:text-blue-600 underline"
            >
              🔍 Debug Authentication Issues
            </button>
          </div>
        )}
      </div>
    </div>
  );
}