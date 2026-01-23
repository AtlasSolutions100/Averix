import { Card } from "@/app/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const dailyProductionData = [
  { date: "Jan 15", loas: 2, production: 945 },
  { date: "Jan 16", loas: 3, production: 1425 },
  { date: "Jan 17", loas: 2, production: 890 },
  { date: "Jan 18", loas: 4, production: 1860 },
  { date: "Jan 19", loas: 3, production: 1320 },
  { date: "Jan 20", loas: 2, production: 980 },
  { date: "Jan 21", loas: 3, production: 1380 },
  { date: "Jan 22", loas: 5, production: 2265 },
];

const monthlyComparison = [
  { month: "Aug", loas: 24, production: 10890 },
  { month: "Sep", loas: 26, production: 11560 },
  { month: "Oct", loas: 25, production: 11250 },
  { month: "Nov", loas: 27, production: 12180 },
  { month: "Dec", loas: 28, production: 12450 },
];

const bestStores = [
  { store: "Target - Westgate", production: 11250, loas: 24 },
  { store: "Costco - Gateway", production: 10340, loas: 22 },
  { store: "Sam's Club - East End", production: 9870, loas: 21 },
];

export function MyProduction() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Production (Last 8 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyProductionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip />
            <Legend />
            <Line yAxisId="right" type="monotone" dataKey="loas" stroke="#3b82f6" strokeWidth={2} name="LOAs" />
            <Line yAxisId="left" type="monotone" dataKey="production" stroke="#10b981" strokeWidth={2} name="Production ($)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="right" dataKey="loas" fill="#3b82f6" name="LOAs" />
            <Bar yAxisId="left" dataKey="production" fill="#10b981" name="Production ($)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">My Best Stores</h3>
          <div className="space-y-3">
            {bestStores.map((store, index) => (
              <div key={store.store} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    index === 0 ? "bg-yellow-400 text-yellow-900" :
                    index === 1 ? "bg-gray-300 text-gray-700" :
                    "bg-orange-300 text-orange-900"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{store.store}</p>
                    <p className="text-xs text-gray-600">{store.loas} LOAs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${store.production.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800 mb-1">Strong Upward Trend</p>
              <p className="text-sm text-green-700">Your production has increased 15% over the last month. Keep up the great work!</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800 mb-1">Best Performance Day</p>
              <p className="text-sm text-blue-700">Friday, Jan 22: 5 LOAs, $2,265 production</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="font-semibold text-purple-800 mb-1">Average Per LOA</p>
              <p className="text-sm text-purple-700">$445 - Above office average of $420</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
