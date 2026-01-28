import { useState } from "react";
import { LayoutDashboard, Users, Store, BarChart3, FileText, Settings, LogOut, Bell, Grid } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { OwnerDashboardView } from "@/app/components/OwnerDashboardView";
import { RepsView } from "@/app/components/RepsView";
import { StoresView } from "@/app/components/StoresView";
import { LOAAnalyzerView } from "@/app/components/LOAAnalyzerView";
import { ReportsView } from "@/app/components/ReportsView";
import type { User } from "@/app/App";

interface OwnerLayoutProps {
  user: User;
  onLogout: () => void;
}

type ViewType = "dashboard" | "reps" | "stores" | "loa" | "reports" | "admin";

export function OwnerLayout({ user, onLogout }: OwnerLayoutProps) {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  const menuItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: LayoutDashboard },
    { id: "reps" as ViewType, label: "Reps", icon: Users },
    { id: "stores" as ViewType, label: "Stores", icon: Store },
    { id: "loa" as ViewType, label: "LOA Analyzer", icon: BarChart3 },
    { id: "reports" as ViewType, label: "Reports", icon: FileText },
    { id: "admin" as ViewType, label: "Admin", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-52 bg-[#2c3e5c] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white">
            A
          </div>
          <span className="text-xl font-semibold">Averix</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isDisabled = item.id === "admin";
            
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setCurrentView(item.id)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors
                  ${isActive ? "bg-[#3d5070] text-white" : "text-gray-300 hover:bg-[#3d5070] hover:text-white"}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <Icon className="size-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">{user.avatar || user.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role === "owner" ? "Owner" : "Admin"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3">{user.officeName}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-[#3d5070]"
          >
            <LogOut className="size-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {menuItems.find(m => m.id === currentView)?.label}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {currentView === "dashboard" && "Office-wide performance clarity"}
              {currentView === "reps" && "Volume vs efficiency — who scales, who doesn't"}
              {currentView === "stores" && "Which retail locations actually convert"}
              {currentView === "loa" && "Math-based coaching instead of 'try harder'"}
              {currentView === "reports" && "See growth, stagnation, and ramp curves"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Grid className="size-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="size-5" />
            </Button>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-auto">
          {currentView === "dashboard" && <OwnerDashboardView user={user} />}
          {currentView === "reps" && <RepsView user={user} />}
          {currentView === "stores" && <StoresView user={user} />}
          {currentView === "loa" && <LOAAnalyzerView user={user} />}
          {currentView === "reports" && <ReportsView user={user} />}
          {currentView === "admin" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Admin settings coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}