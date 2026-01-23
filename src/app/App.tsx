import { useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardView } from "@/app/components/DashboardView";
import { RepsView } from "@/app/components/RepsView";
import { StoresView } from "@/app/components/StoresView";
import { LOAAnalyzerView } from "@/app/components/LOAAnalyzerView";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "reps" | "stores" | "loa">("stores");

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      
      <div className="flex-1 overflow-auto">
        {currentView === "dashboard" && <DashboardView />}
        {currentView === "reps" && <RepsView />}
        {currentView === "stores" && <StoresView />}
        {currentView === "loa" && <LOAAnalyzerView />}
      </div>
    </div>
  );
}
