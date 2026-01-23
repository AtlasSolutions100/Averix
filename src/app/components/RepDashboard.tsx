import { Card } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { MyStores } from "@/app/components/MyStores";
import { MyProduction } from "@/app/components/MyProduction";
import { StoreHistory } from "@/app/components/StoreHistory";
import { TrendingUp, FileCheck, Store, Calendar } from "lucide-react";

// Mock data for rep view
const repStats = {
  myLOAs: 28,
  myProduction: 12450,
  storesVisited: 8,
  avgPerStore: 1556,
};

export function RepDashboard() {
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My LOAs (MTD)</p>
              <p className="text-3xl font-semibold mt-1">{repStats.myLOAs}</p>
              <p className="text-xs text-green-600 mt-1">+4 this week</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileCheck className="size-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Production</p>
              <p className="text-3xl font-semibold mt-1">${repStats.myProduction.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+15% vs last month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="size-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stores Visited</p>
              <p className="text-3xl font-semibold mt-1">{repStats.storesVisited}</p>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Store className="size-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Per Store</p>
              <p className="text-3xl font-semibold mt-1">${repStats.avgPerStore.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">Above target</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="size-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="stores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stores">My Current Stores</TabsTrigger>
          <TabsTrigger value="history">Store History</TabsTrigger>
          <TabsTrigger value="production">Production Details</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-4">
          <MyStores />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <StoreHistory />
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <MyProduction />
        </TabsContent>
      </Tabs>
    </div>
  );
}
