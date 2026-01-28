import { ReactNode, useState, useEffect } from "react";
import { LogOut, LayoutDashboard, Store, Target, TrendingUp, Clock, History, Grid, Bell, Menu, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { VeridexLogo } from "@/app/components/VeridexLogo";
import { User } from "@/app/App";
import { RepDashboardView } from "@/app/components/RepDashboardView";
import { LiveTrackerView } from "@/app/components/LiveTrackerView";
import { DailyEntryView } from "@/app/components/DailyEntryView";
import { RepHistoryView } from "@/app/components/RepHistoryView";
import { ReportsView } from "@/app/components/ReportsView";
import { TrackerProvider } from "@/contexts/TrackerContext";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";

interface RepLayoutProps {
  user: User;
  onLogout: () => void;
}

type ViewType = "dashboard" | "liveTracker" | "dailyEntry" | "history" | "reports";

export function RepLayout({ user, onLogout }: RepLayoutProps) {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  // Update SEO based on current view
  useEffect(() => {
    const seoMap: Record<ViewType, typeof SEO_CONFIGS[keyof typeof SEO_CONFIGS]> = {
      dashboard: SEO_CONFIGS.repDashboard,
      liveTracker: SEO_CONFIGS.liveTracker,
      dailyEntry: SEO_CONFIGS.dailyEntry,
      history: SEO_CONFIGS.history,
      reports: SEO_CONFIGS.reports,
    };

    const seoConfig = seoMap[currentView] || SEO_CONFIGS.repDashboard;
    document.title = seoConfig.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDescription) {
      metaDescription.content = seoConfig.description;
    }
  }, [currentView]);

  const menuItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: LayoutDashboard },
    { id: "liveTracker" as ViewType, label: "Live Tracker", icon: Target },
    { id: "dailyEntry" as ViewType, label: "Daily Entry", icon: Clock },
    { id: "history" as ViewType, label: "History", icon: History },
    { id: "reports" as ViewType, label: "Reports", icon: Grid },
  ];

  return (
    <TrackerProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Mobile Header */}
        <div className="bg-card border-b border-border text-foreground px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VeridexLogo className="w-8 h-8" />
            <span className="text-lg font-semibold">Veridex</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-foreground hover:bg-secondary lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="lg:hidden bg-card border-b border-border shadow-lg">
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
                      ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-foreground hover:bg-secondary"}
                    `}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary"
              >
                <LogOut className="size-5" />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </nav>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8">
                  <VeridexLogo className="w-full h-full" />
                </div>
                <span className="text-lg font-semibold">Veridex</span>
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
                      ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-foreground hover:bg-secondary"}
                    `}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">{user.officeName}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="w-full justify-start bg-secondary/50 hover:bg-secondary border-border"
              >
                <LogOut className="size-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {currentView === "dashboard" && <RepDashboardView user={user} />}
            {currentView === "liveTracker" && <LiveTrackerView user={user} />}
            {currentView === "dailyEntry" && <DailyEntryView user={user} />}
            {currentView === "history" && <RepHistoryView user={user} />}
            {currentView === "reports" && <ReportsView user={user} />}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden bg-card border-t border-border px-4 py-2 flex items-center justify-around">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center py-2 px-4 rounded ${
                  isActive ? "text-primary" : "text-muted-foreground"
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