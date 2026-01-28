import { useState } from "react";
import { Home, TrendingUp, Calendar, LogOut, Menu, X, Activity } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { RepDashboardView } from "@/app/components/RepDashboardView";
import { DailyEntryView } from "@/app/components/DailyEntryView";
import { RepHistoryView } from "@/app/components/RepHistoryView";
import { LiveTrackerView } from "@/app/components/LiveTrackerView";
import { TrackerProvider } from "@/contexts/TrackerContext";
import type { User } from "@/app/App";

interface RepLayoutProps {
  user: User;
  onLogout: () => void;
}

type ViewType = "dashboard" | "tracker" | "entry" | "history";

export function RepLayout({ user, onLogout }: RepLayoutProps) {
  const [currentView, setCurrentView] = useState<ViewType>("tracker");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: Home },
    { id: "tracker" as ViewType, label: "Live Tracker", icon: Activity },
    { id: "entry" as ViewType, label: "Daily Entry", icon: Calendar },
    { id: "history" as ViewType, label: "My Performance", icon: TrendingUp },
  ];

  return (
    <TrackerProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-[#2c3e5c] text-white px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white">
              A
            </div>
            <span className="text-lg font-semibold">Averix</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white hover:bg-[#3d5070] lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-b shadow-lg">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="size-5" />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </nav>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex w-64 bg-white border-r flex-col">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">{user.avatar || user.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">Sales Rep</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors
                      ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <p className="text-xs text-gray-600 mb-2">{user.officeName}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="w-full justify-start"
              >
                <LogOut className="size-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {currentView === "dashboard" && <RepDashboardView user={user} />}
            {currentView === "tracker" && <LiveTrackerView user={user} />}
            {currentView === "entry" && <DailyEntryView user={user} />}
            {currentView === "history" && <RepHistoryView user={user} />}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden bg-white border-t px-4 py-2 flex items-center justify-around">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center py-2 px-4 rounded ${
                  isActive ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <Icon className="size-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </TrackerProvider>
  );
}