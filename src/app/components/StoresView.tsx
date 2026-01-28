import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Store, MapPin } from "lucide-react";
import { StoreVisitsView } from "@/app/components/StoreVisitsView";
import { StorePerformanceView } from "@/app/components/StorePerformanceView";
import type { User } from "@/app/App";

interface StoresViewProps {
  user: User;
}

type TabType = "visits" | "performance";

export function StoresView({ user }: StoresViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("visits");

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("visits")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "visits"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              Store Visits
            </div>
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "performance"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Store className="size-4" />
              Store Performance
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "visits" && <StoreVisitsView user={user} />}
        {activeTab === "performance" && <StorePerformanceView user={user} />}
      </div>
    </div>
  );
}
