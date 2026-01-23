import { Card } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useState } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const weeklyData = [
  { week: "Week 1", dallas: 9800, houston: 13200, austin: 7400, sanAntonio: 6200 },
  { week: "Week 2", dallas: 10500, houston: 14100, austin: 7800, sanAntonio: 6800 },
  { week: "Week 3", dallas: 11200, houston: 14800, austin: 8200, sanAntonio: 7200 },
  { week: "Week 4", dallas: 10800, houston: 14400, austin: 8400, sanAntonio: 7600 },
];

const dailyData = [
  { day: "Mon", production: 5200, loas: 12 },
  { day: "Tue", production: 6100, loas: 14 },
  { day: "Wed", production: 5800, loas: 13 },
  { day: "Thu", production: 6400, loas: 15 },
  { day: "Fri", production: 7200, loas: 18 },
  { day: "Sat", production: 4800, loas: 11 },
  { day: "Sun", production: 3900, loas: 9 },
];

export function ProductionChart() {
  const [chartType, setChartType] = useState("weekly");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Production Trends by Office</h3>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {chartType === "weekly" ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="houston" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Houston" />
              <Area type="monotone" dataKey="dallas" stackId="1" stroke="#10b981" fill="#10b981" name="Dallas" />
              <Area type="monotone" dataKey="austin" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Austin" />
              <Area type="monotone" dataKey="sanAntonio" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="San Antonio" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="production" stroke="#3b82f6" strokeWidth={2} name="Production ($)" />
              <Line yAxisId="right" type="monotone" dataKey="loas" stroke="#10b981" strokeWidth={2} name="LOAs" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-3">Top Performing Days</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="text-sm">Friday</span>
              <span className="font-semibold text-green-600">$7,200 / 18 LOAs</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <span className="text-sm">Thursday</span>
              <span className="font-semibold text-blue-600">$6,400 / 15 LOAs</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
              <span className="text-sm">Tuesday</span>
              <span className="font-semibold text-purple-600">$6,100 / 14 LOAs</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-3">Office Rankings (This Week)</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-600">#1</span>
                <span className="text-sm">Houston Office</span>
              </div>
              <span className="font-semibold">$14,400</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">#2</span>
                <span className="text-sm">Dallas Office</span>
              </div>
              <span className="font-semibold">$10,800</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-orange-600">#3</span>
                <span className="text-sm">Austin Office</span>
              </div>
              <span className="font-semibold">$8,400</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
