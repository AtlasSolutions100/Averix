import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Store } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { analyticsAPI } from "@/services/api";
import type { User } from "@/app/App";

interface StorePerformanceViewProps {
  user: User;
}

type TimeFilter = "week" | "month" | "quarter";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function StorePerformanceView({ user }: StorePerformanceViewProps) {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [storeStats, setStoreStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.officeId) return;
      
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        
        // Calculate start date based on filter
        if (timeFilter === "week") {
          startDate.setDate(startDate.getDate() - 7);
        } else if (timeFilter === "month") {
          startDate.setMonth(startDate.getMonth() - 1);
        } else {
          startDate.setMonth(startDate.getMonth() - 3);
        }

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
  }, [user?.officeId, timeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (storeStats.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center bg-card border-border">
          <Store className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No store data yet</h3>
          <p className="text-muted-foreground">Store performance metrics will appear once data is tracked</p>
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
        <h2 className="text-2xl font-semibold text-foreground">Store Performance</h2>
        <p className="text-muted-foreground">Last 30 days performance by store</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-foreground">{totalSales}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Contacts</p>
          <p className="text-2xl font-bold text-foreground">{totalContacts}</p>
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
              <Card key={store.storeId} className="p-5 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{store.storeName}</h3>
                    <p className="text-sm text-muted-foreground">{store.storeLocation || 'No location'}</p>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contacts</p>
                    <p className="text-2xl font-bold text-foreground">{store.totalContacts || 0}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sales</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-primary">{store.totalSales || 0}</p>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        {closeRate}% close
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-foreground">${(store.totalRevenue || 0).toLocaleString()}</p>
                      <span className="text-xs text-muted-foreground">${revenuePerSale}/sale</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Active Reps</span>
                    <span className="font-semibold text-foreground">{store.activeReps || 0}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Revenue Distribution Chart */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Distribution</h3>
          
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
                  <Tooltip 
                    formatter={(value: any) => `$${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#13141f', border: '1px solid #2a2b3a', borderRadius: '8px' }}
                  />
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
                      <span className="text-foreground truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Revenue/Store</span>
              <span className="font-semibold text-foreground">
                ${storeStats.length > 0 ? (totalRevenue / storeStats.length).toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Sales/Store</span>
              <span className="font-semibold text-foreground">
                {storeStats.length > 0 ? (totalSales / storeStats.length).toFixed(1) : '0'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}