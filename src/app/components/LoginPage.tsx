import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import type { User } from "@/app/App";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Mock users for demo
const DEMO_USERS = [
  {
    id: "1",
    email: "owner@olympus.com",
    password: "demo",
    name: "Olympus Marketing",
    role: "owner" as const,
    officeId: "office-1",
    officeName: "Olympus Marketing Group",
    avatar: "OM"
  },
  {
    id: "2",
    email: "jake@olympus.com",
    password: "demo",
    name: "Jake Reynolds",
    role: "rep" as const,
    officeId: "office-1",
    officeName: "Olympus Marketing Group",
    avatar: "JR"
  },
  {
    id: "3",
    email: "sarah@olympus.com",
    password: "demo",
    name: "Sarah Kim",
    role: "rep" as const,
    officeId: "office-1",
    officeName: "Olympus Marketing Group",
    avatar: "SK"
  }
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userData } = user;
        onLogin(userData);
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 500);
  };

  const handleDemoLogin = (userEmail: string) => {
    const user = DEMO_USERS.find(u => u.email === userEmail);
    if (user) {
      const { password: _, ...userData } = user;
      onLogin(userData);
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
      </div>
    </div>
  );
}
