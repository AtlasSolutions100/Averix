import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, MapPin } from "lucide-react";
import { analyticsAPI } from "@/services/api";
import type { User } from "@/app/App";

interface StoreVisitsViewProps {
  user: User;
}

type TimeFilter = "week" | "month" | "quarter";

export function StoreVisitsView({ user }: StoreVisitsViewProps) {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [storeVisits, setStoreVisits] = useState<any[]>([]);

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

        const { storeVisits: visits } = await analyticsAPI.getStoreVisits(user.officeId, {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });

        // Group by store, then by rep
        const storeMap = new Map();
        
        visits?.forEach((visit: any) => {
          const storeKey = visit.storeName || 'Unknown Store';
          if (!storeMap.has(storeKey)) {
            storeMap.set(storeKey, {
              storeName: storeKey,
              storeLocation: visit.storeLocation || '',
              reps: new Map(),
            });
          }
          
          const store = storeMap.get(storeKey);
          const repName = visit.repName || 'Unknown Rep';
          
          if (!store.reps.has(repName)) {
            store.reps.set(repName, {
              repName,
              visits: 0,
              totalSales: 0,
              totalRevenue: 0,
            });
          }
          
          const rep = store.reps.get(repName);
          rep.visits += 1;
          rep.totalSales += visit.sales || 0;
          rep.totalRevenue += parseFloat(visit.revenue || 0);
        });

        // Convert to array format
        const formattedData = Array.from(storeMap.values()).map(store => ({
          ...store,
          reps: Array.from(store.reps.values()).sort((a, b) => b.visits - a.visits),
        }));

        setStoreVisits(formattedData);
      } catch (error) {
        console.error('Failed to load store visits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.officeId, timeFilter]);

  const getVisitColor = (visits: number) => {
    if (visits >= 15) return "bg-green-600";
    if (visits >= 10) return "bg-green-500";
    if (visits >= 5) return "bg-blue-500";
    if (visits >= 3) return "bg-blue-400";
    return "bg-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Store Visit Tracker</h2>
          <p className="text-muted-foreground">Visualize rep coverage across all stores</p>
        </div>
        
        {/* Time Filter */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={timeFilter === "week" ? "default" : "outline"}
            onClick={() => setTimeFilter("week")}
          >
            1 Week
          </Button>
          <Button
            size="sm"
            variant={timeFilter === "month" ? "default" : "outline"}
            onClick={() => setTimeFilter("month")}
          >
            1 Month
          </Button>
          <Button
            size="sm"
            variant={timeFilter === "quarter" ? "default" : "outline"}
            onClick={() => setTimeFilter("quarter")}
          >
            3 Months
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4 bg-card border-border">
        <p className="text-sm font-medium text-foreground mb-3">Visit Frequency Legend:</p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-400"></div>
            <span>1-2 visits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-400"></div>
            <span>3-4 visits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500"></div>
            <span>5-9 visits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500"></div>
            <span>10-14 visits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-600"></div>
            <span>15+ visits</span>
          </div>
        </div>
      </Card>

      {/* Store Grid */}
      {storeVisits.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <MapPin className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No store visits yet</h3>
          <p className="text-muted-foreground">Store visit data will appear once reps start tracking</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {storeVisits.map((store) => (
            <Card key={store.storeName} className="p-5 bg-card border-border">
              {/* Store Header */}
              <div className="mb-4 pb-3 border-b border-border">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-lg text-foreground">{store.storeName}</h3>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    {store.reps.reduce((sum: number, rep: any) => sum + rep.visits, 0)} visits
                  </Badge>
                </div>
                {store.storeLocation && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" />
                    {store.storeLocation}
                  </p>
                )}
              </div>

              {/* Reps */}
              <div className="space-y-2">
                {store.reps.map((rep: any) => (
                  <div key={rep.repName} className="flex items-center gap-3">
                    {/* Visit Counter Visual */}
                    <div className={`w-12 h-12 rounded-lg ${getVisitColor(rep.visits)} flex items-center justify-center text-white font-bold`}>
                      {rep.visits}
                    </div>
                    
                    {/* Rep Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{rep.repName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">{rep.totalSales} sales</span>
                        <span className="font-semibold text-foreground">${rep.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Store Summary */}
              <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Sales</p>
                  <p className="font-semibold text-primary text-base">
                    {store.reps.reduce((sum: number, rep: any) => sum + rep.totalSales, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Revenue</p>
                  <p className="font-semibold text-green-400 text-base">
                    ${store.reps.reduce((sum: number, rep: any) => sum + rep.totalRevenue, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {storeVisits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Stores</p>
            <p className="text-2xl font-bold text-foreground">{storeVisits.length}</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-1">Active Reps</p>
            <p className="text-2xl font-bold text-foreground">
              {new Set(storeVisits.flatMap(s => s.reps.map((r: any) => r.repName))).size}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Visits</p>
            <p className="text-2xl font-bold text-foreground">
              {storeVisits.reduce((sum, s) => sum + s.reps.reduce((rSum: number, r: any) => rSum + r.visits, 0), 0)}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-1">Avg Visits/Store</p>
            <p className="text-2xl font-bold text-foreground">
              {(storeVisits.reduce((sum, s) => sum + s.reps.reduce((rSum: number, r: any) => rSum + r.visits, 0), 0) / storeVisits.length).toFixed(1)}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}