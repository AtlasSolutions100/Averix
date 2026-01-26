import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Calendar } from "lucide-react";
import type { User } from "@/app/App";

interface RepHistoryViewProps {
  user: User;
}

const dailyHistory = [
  { date: "2024-01-22", store: "Best Buy NFW", stops: 125, contacts: 48, pres: 20, sales: 8, revenue: 960, hours: 8 },
  { date: "2024-01-21", store: "Best Buy NFW", stops: 118, contacts: 45, pres: 18, sales: 7, revenue: 840, hours: 8 },
  { date: "2024-01-20", store: "Target Arlington", stops: 132, contacts: 52, pres: 22, sales: 9, revenue: 1080, hours: 8.5 },
  { date: "2024-01-19", store: "Best Buy SFW", stops: 128, contacts: 50, pres: 21, sales: 8, revenue: 960, hours: 8 },
  { date: "2024-01-18", store: "Best Buy SFW", stops: 115, contacts: 44, pres: 18, sales: 7, revenue: 840, hours: 7.5 },
];

const storeBreakdown = [
  { store: "Best Buy NFW", days: 8, contacts: 386, sales: 32, revenue: 3840, avgSales: 4.0 },
  { store: "Best Buy SFW", days: 6, contacts: 294, sales: 24, revenue: 2880, avgSales: 4.0 },
  { store: "Target Arlington", days: 4, contacts: 198, sales: 18, revenue: 2160, avgSales: 4.5 },
];

export function RepHistoryView({ user }: RepHistoryViewProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Performance History</h2>
        <p className="text-gray-600">Track your progress and trends</p>
      </div>

      {/* Store Performance */}
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
              {dailyHistory.map((day) => {
                const revenuePerHour = (day.revenue / day.hours).toFixed(2);
                const closeRate = ((day.sales / day.contacts) * 100).toFixed(1);
                
                return (
                  <TableRow key={day.date}>
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
                    <TableCell className="text-right font-semibold">${day.revenue}</TableCell>
                    <TableCell className="text-right">{day.hours}</TableCell>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-1">Best Day</p>
          <p className="text-2xl font-bold text-blue-600">Jan 20</p>
          <p className="text-xs text-blue-700">9 sales • $1,080 revenue</p>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-1">Top Store</p>
          <p className="text-2xl font-bold text-green-600">Target Arlington</p>
          <p className="text-xs text-green-700">4.5 avg sales per day</p>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-sm font-semibold text-purple-900 mb-1">This Month</p>
          <p className="text-2xl font-bold text-purple-600">+15%</p>
          <p className="text-xs text-purple-700">vs. last month's performance</p>
        </Card>
      </div>
    </div>
  );
}
