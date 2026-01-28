import { ReactNode, useState, useEffect } from "react";
import { LogOut, LayoutDashboard, Users, Store, Target, TrendingUp, Settings, Grid, Bell, UsersRound, Building2, ClipboardList, PieChart } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { VeridexLogo } from "@/app/components/VeridexLogo";
import { User } from "@/app/App";
import { OwnerDashboardView } from "@/app/components/OwnerDashboardView";
import { RepsView } from "@/app/components/RepsView";
import { StoresView } from "@/app/components/StoresView";
import { LOAAnalyzerView } from "@/app/components/LOAAnalyzerView";
import { GoalsView } from "@/app/components/GoalsView";
import { TeamManagement } from "@/app/components/TeamManagement";
import { StoreManagementView } from "@/app/components/StoreManagementView";
import { OfficeSettingsView } from "@/app/components/OfficeSettingsView";
import { EntriesView } from "@/app/components/EntriesView";
import { StorePerformanceView } from "@/app/components/StorePerformanceView";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";

interface OwnerLayoutProps {
  user: User;
  onLogout: () => void;
}

type ViewType = "dashboard" | "reps" | "stores" | "loa" | "goals" | "team" | "storeManagement" | "officeSettings" | "entries" | "storePerformance";

export function OwnerLayout({ user, onLogout }: OwnerLayoutProps) {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  // Update SEO based on current view
  useEffect(() => {
    const seoMap: Record<ViewType, typeof SEO_CONFIGS[keyof typeof SEO_CONFIGS]> = {
      dashboard: SEO_CONFIGS.ownerDashboard,
      reps: SEO_CONFIGS.reps,
      stores: SEO_CONFIGS.stores,
      loa: SEO_CONFIGS.loaAnalyzer,
      goals: SEO_CONFIGS.goals,
      team: SEO_CONFIGS.teamManagement,
      storeManagement: SEO_CONFIGS.storeManagement,
      officeSettings: SEO_CONFIGS.officeSettings,
      entries: SEO_CONFIGS.entries,
      storePerformance: SEO_CONFIGS.storePerformance,
    };

    const seoConfig = seoMap[currentView] || SEO_CONFIGS.ownerDashboard;
    document.title = seoConfig.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDescription) {
      metaDescription.content = seoConfig.description;
    }
  }, [currentView]);

  const menuItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: LayoutDashboard },
    { id: "reps" as ViewType, label: "Reps", icon: Users },
    { id: "storeManagement" as ViewType, label: "Stores", icon: Store },
    { id: "loa" as ViewType, label: "LOA Analyzer", icon: TrendingUp },
    { id: "goals" as ViewType, label: "Goals", icon: Target },
    { id: "team" as ViewType, label: "Team", icon: UsersRound },
    { id: "officeSettings" as ViewType, label: "Settings", icon: Settings },
    { id: "entries" as ViewType, label: "Entries", icon: ClipboardList },
    { id: "storePerformance" as ViewType, label: "Store Performance", icon: PieChart },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border text-foreground flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <VeridexLogo />
          <span className="text-xl font-semibold">Veridex</span>
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
                  ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-foreground hover:bg-secondary"}
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
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-sm font-semibold text-white">{user.avatar || user.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role === "owner" ? "Owner" : "Admin"}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{user.officeName}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-foreground hover:text-foreground hover:bg-secondary"
          >
            <LogOut className="size-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {menuItems.find(m => m.id === currentView)?.label}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {currentView === "dashboard" && "Office-wide performance clarity"}
              {currentView === "reps" && "Volume vs efficiency — who scales, who doesn't"}
              {currentView === "storeManagement" && "Manage retail locations and performance tracking"}
              {currentView === "loa" && "Math-based coaching instead of 'try harder'"}
              {currentView === "goals" && "Set and track your goals"}
              {currentView === "team" && "Create and manage team member accounts"}
              {currentView === "officeSettings" && "Configure your office and preferences"}
              {currentView === "entries" && "Review all daily performance submissions"}
              {currentView === "storePerformance" && "Analyze store performance metrics"}
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
          {currentView === "storeManagement" && <StoreManagementView user={user} />}
          {currentView === "loa" && <LOAAnalyzerView user={user} />}
          {currentView === "goals" && <GoalsView user={user} />}
          {currentView === "team" && <TeamManagement user={user} />}
          {currentView === "officeSettings" && <OfficeSettingsView user={user} />}
          {currentView === "entries" && <EntriesView user={user} />}
          {currentView === "storePerformance" && <StorePerformanceView user={user} />}
        </div>
      </div>
    </div>
  );
}