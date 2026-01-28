import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Calendar, Loader2 } from "lucide-react";
import { entriesAPI } from "@/services/api";
import type { User } from "@/app/App";

interface RepHistoryViewProps {
  user: User;
}

export function RepHistoryView({ user }: RepHistoryViewProps) {
  const [loading, setLoading] = useState(true);
  const [dailyHistory, setDailyHistory] = useState<any[]>([]);
  const [storeBreakdown, setStoreBreakdown] = useState<any[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Get last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const { entries } = await entriesAPI.getUserEntries(user.id, {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          limit: 30,
        });

        if (entries && entries.length > 0) {
          // Set daily history
          const history = entries.map((entry: any) => ({
            date: entry.entry_date,
            store: entry.stores?.name || 'Unknown Store',
            stops: entry.stops || 0,
            contacts: entry.contacts || 0,
            pres: entry.presentations || 0,
            sales: entry.sales || 0,
            revenue: parseFloat(entry.revenue || 0),
            hours: parseFloat(entry.hours_worked || 0),
          }));
          setDailyHistory(history);

          // Calculate store breakdown
          const storeMap = new Map();
          entries.forEach((entry: any) => {
            const storeName = entry.stores?.name || 'Unknown Store';
            if (!storeMap.has(storeName)) {
              storeMap.set(storeName, {
                store: storeName,
                days: 0,
                contacts: 0,
                sales: 0,
                revenue: 0,
              });
            }
            const store = storeMap.get(storeName);
            store.days += 1;
            store.contacts += entry.contacts || 0;
            store.sales += entry.sales || 0;
            store.revenue += parseFloat(entry.revenue || 0);
          });

          const breakdown = Array.from(storeMap.values()).map(store => ({
            ...store,
            avgSales: store.days > 0 ? (store.sales / store.days).toFixed(1) : '0.0',
          }));
          setStoreBreakdown(breakdown);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (dailyHistory.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <Calendar className="size-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No history yet</h3>
          <p className="text-gray-600">Start tracking your daily entries to see your performance history</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Performance History</h2>
        <p className="text-gray-600">Track your progress and trends (Last 30 days)</p>
      </div>

      {/* Store Performance */}
      {storeBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Store Performance Summary</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Days Worked</TableHead>
                <TableHead className="text-right">Total Contacts</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Sales/Day</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeBreakdown.map((store) => (
                <TableRow key={store.store}>
                  <TableCell className="font-medium">{store.store}</TableCell>
                  <TableCell className="text-right">{store.days}</TableCell>
                  <TableCell className="text-right">{store.contacts}</TableCell>
                  <TableCell className="text-right font-semibold text-blue-600">{store.sales}</TableCell>
                  <TableCell className="text-right font-semibold">${store.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {store.avgSales}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Daily History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Daily Performance</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Stops</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
                <TableHead className="text-right">Pres</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">$/Hour</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyHistory.map((day, idx) => {
                const revenuePerHour = day.hours > 0 ? (day.revenue / day.hours).toFixed(2) : '0.00';
                const closeRate = day.contacts > 0 ? ((day.sales / day.contacts) * 100).toFixed(1) : '0.0';
                
                return (
                  <TableRow key={`${day.date}-${idx}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <span className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{day.store}</TableCell>
                    <TableCell className="text-right">{day.stops}</TableCell>
                    <TableCell className="text-right">{day.contacts}</TableCell>
                    <TableCell className="text-right">{day.pres}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-blue-600">{day.sales}</span>
                      <span className="text-xs text-gray-500 ml-1">({closeRate}%)</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">${day.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{day.hours || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        ${revenuePerHour}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Insights */}
      {dailyHistory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-1">Best Day</p>
            <p className="text-2xl font-bold text-blue-600">
              {new Date(dailyHistory.reduce((best, day) => 
                day.sales > best.sales ? day : best
              ).date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-blue-700">
              {dailyHistory.reduce((best, day) => day.sales > best.sales ? day : best).sales} sales
            </p>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-sm font-semibold text-green-900 mb-1">Top Store</p>
            <p className="text-2xl font-bold text-green-600">
              {storeBreakdown.reduce((best, store) => 
                parseFloat(store.avgSales) > parseFloat(best.avgSales) ? store : best, storeBreakdown[0]
              )?.store}
            </p>
            <p className="text-xs text-green-700">
              {storeBreakdown.reduce((best, store) => 
                parseFloat(store.avgSales) > parseFloat(best.avgSales) ? store : best, storeBreakdown[0]
              )?.avgSales} avg sales/day
            </p>
          </Card>

          <Card className="p-4 bg-purple-50 border-purple-200">
            <p className="text-sm font-semibold text-purple-900 mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-purple-600">
              {dailyHistory.reduce((sum, day) => sum + day.sales, 0)}
            </p>
            <p className="text-xs text-purple-700">Last 30 days</p>
          </Card>
        </div>
      )}
    </div>
  );
}
