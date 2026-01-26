import { useState, useEffect } from "react";
import { LoginPage } from "@/app/components/LoginPage";
import { OwnerLayout } from "@/app/components/OwnerLayout";
import { RepLayout } from "@/app/components/RepLayout";
import { Toaster } from "@/app/components/ui/sonner";

export type UserRole = "owner" | "rep" | "cydcor";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  officeId: string;
  officeName: string;
  avatar?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("averix_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("averix_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("averix_user");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Route based on user role
  if (user.role === "owner" || user.role === "cydcor") {
    return (
      <>
        <OwnerLayout user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <RepLayout user={user} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}