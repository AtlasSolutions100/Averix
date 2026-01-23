import { Card } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { OfficeOverview } from "@/app/components/OfficeOverview";
import { RepPerformance } from "@/app/components/RepPerformance";
import { LOATracking } from "@/app/components/LOATracking";
import { ProductionChart } from "@/app/components/ProductionChart";
import { Building2, Users, TrendingUp, FileText } from "lucide-react";

// Mock data for owner view
const officeStats = {
  totalLOAs: 342,
  totalProduction: 156780,
  activeReps: 24,
  avgProductionPerRep: 6532,
};

export function OwnerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total LOAs</p>
              <p className="text-3xl font-semibold mt-1">{officeStats.totalLOAs}</p>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="size-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Production</p>
              <p className="text-3xl font-semibold mt-1">${officeStats.totalProduction.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+8% from last month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="size-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Reps</p>
              <p className="text-3xl font-semibold mt-1">{officeStats.activeReps}</p>
              <p className="text-xs text-gray-600 mt-1">Across all offices</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="size-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Per Rep</p>
              <p className="text-3xl font-semibold mt-1">${officeStats.avgProductionPerRep.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+5% from last month</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Building2 className="size-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reps">Rep Performance</TabsTrigger>
          <TabsTrigger value="loa">LOA Tracking</TabsTrigger>
          <TabsTrigger value="production">Production Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OfficeOverview />
        </TabsContent>

        <TabsContent value="reps" className="space-y-4">
          <RepPerformance />
        </TabsContent>

        <TabsContent value="loa" className="space-y-4">
          <LOATracking />
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <ProductionChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
