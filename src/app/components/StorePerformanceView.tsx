import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Store } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { analyticsAPI } from "@/services/api";
import type { User } from "@/app/App";

interface StorePerformanceViewProps {
  user: User;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function StorePerformanceView({ user }: StorePerformanceViewProps) {
  const [loading, setLoading] = useState(true);
  const [storeStats, setStoreStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.officeId) return;
      
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        const { storePerformance } = await analyticsAPI.getStorePerformance(user.officeId, {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });

        setStoreStats(storePerformance || []);
        
        // Format for pie chart
        const pieData = (storePerformance || []).map((store: any, idx: number) => ({
          name: store.storeName,
          value: parseFloat(store.totalRevenue || 0),
          color: COLORS[idx % COLORS.length],
        }));
        setChartData(pieData);
      } catch (error) {
        console.error('Failed to load store performance:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.officeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (storeStats.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <Store className="size-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No store data yet</h3>
          <p className="text-gray-600">Store performance metrics will appear once data is tracked</p>
        </Card>
      </div>
    );
  }

  const totalRevenue = storeStats.reduce((sum, store) => sum + parseFloat(store.totalRevenue || 0), 0);
  const totalSales = storeStats.reduce((sum, store) => sum + (store.totalSales || 0), 0);
  const totalContacts = storeStats.reduce((sum, store) => sum + (store.totalContacts || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Store Performance</h2>
        <p className="text-gray-600">Last 30 days performance by store</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-1">Total Contacts</p>
          <p className="text-2xl font-bold text-gray-900">{totalContacts}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeStats.map((store, idx) => {
            const closeRate = store.totalContacts > 0 
              ? ((store.totalSales / store.totalContacts) * 100).toFixed(1)
              : '0.0';
            const revenuePerSale = store.totalSales > 0
              ? (store.totalRevenue / store.totalSales).toFixed(0)
              : '0';

            return (
              <Card key={store.storeId} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{store.storeName}</h3>
                    <p className="text-sm text-gray-600">{store.storeLocation || 'No location'}</p>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Contacts</p>
                    <p className="text-2xl font-bold">{store.totalContacts || 0}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Sales</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-blue-600">{store.totalSales || 0}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {closeRate}% close
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Revenue</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold">${(store.totalRevenue || 0).toLocaleString()}</p>
                      <span className="text-xs text-gray-600">${revenuePerSale}/sale</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Active Reps</span>
                    <span className="font-semibold">{store.activeReps || 0}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Revenue Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
          
          {chartData.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-4">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg Revenue/Store</span>
              <span className="font-semibold">
                ${storeStats.length > 0 ? (totalRevenue / storeStats.length).toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg Sales/Store</span>
              <span className="font-semibold">
                {storeStats.length > 0 ? (totalSales / storeStats.length).toFixed(1) : '0'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
