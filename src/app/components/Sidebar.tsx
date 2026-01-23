import { LayoutDashboard, Users, Store, BarChart3, FileText, Settings } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: "dashboard" | "reps" | "stores" | "loa") => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "reps", label: "Reps", icon: Users },
    { id: "stores", label: "Stores", icon: Store },
    { id: "loa", label: "LOA Analyzer", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "admin", label: "Admin", icon: Settings },
  ];

  return (
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
          const isDisabled = item.id === "reports" || item.id === "admin";
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onNavigate(item.id as any)}
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">OM</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Olympus</p>
            <p className="text-xs text-gray-400">Marketing Group</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Phoenix, AZ</p>
      </div>
    </div>
  );
}
