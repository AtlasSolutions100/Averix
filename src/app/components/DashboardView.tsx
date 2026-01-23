import { Card } from "@/app/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

const productionData = [
  { week: "W1", contacts: 180, presents: 72, sales: 28 },
  { week: "W2", contacts: 195, presents: 78, sales: 32 },
  { week: "W3", contacts: 210, presents: 84, sales: 36 },
  { week: "W4", contacts: 188, presents: 75, sales: 30 },
  { week: "W5", contacts: 220, presents: 88, sales: 38 },
];

const repPerformance = [
  { name: "Jake R.", contacts: 42, pres: 42, sales: 3, revenue: 14600, close: 11.2, revContact: 120 },
  { name: "Marcus L.", contacts: 312, pres: 20, sales: 4, revenue: 12530, close: 10.3, revContact: 110 },
  { name: "Sarah K.", contacts: 331, pres: 12, sales: 5, revenue: 10200, close: 9.2, revContact: 100 },
];

export function DashboardView() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Top Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Contacts</p>
            <p className="text-3xl font-semibold mb-1">812</p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-600">Today</span>
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-green-600">12%</span>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Presentations</p>
            <p className="text-3xl font-semibold mb-1">342</p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-600">Today</span>
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-green-600">8%</span>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Sales</p>
            <p className="text-3xl font-semibold mb-1">118</p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-600">Today</span>
              <TrendingUp className="size-3 text-red-600" />
              <span className="text-red-600">-5%</span>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Revenue</p>
            <p className="text-3xl font-semibold mb-1">$14,620</p>
            <div className="text-xs text-gray-600">This Week</div>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Close Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-semibold">14.5%</p>
              <TrendingUp className="size-4 text-green-600" />
            </div>
            <div className="text-xs text-green-600">+12%</div>
          </Card>
        </div>

        {/* Production Chart */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Production Over Time</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">By Rep</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">By Store</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">By Product</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="contacts" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="presents" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Rep Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rep Performance</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-gray-600">
                  <th className="text-left py-2">Rep</th>
                  <th className="text-right py-2">Contacts</th>
                  <th className="text-right py-2">Pres</th>
                  <th className="text-right py-2">Sales</th>
                  <th className="text-right py-2">Revenue</th>
                  <th className="text-right py-2">Close %</th>
                </tr>
              </thead>
              <tbody>
                {repPerformance.map((rep) => (
                  <tr key={rep.name} className="border-b">
                    <td className="py-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {rep.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium">{rep.name}</span>
                    </td>
                    <td className="text-right text-sm">{rep.contacts}</td>
                    <td className="text-right text-sm">{rep.pres}</td>
                    <td className="text-right text-sm">{rep.sales}</td>
                    <td className="text-right text-sm">${rep.revenue.toLocaleString()}</td>
                    <td className="text-right">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <TrendingUp className="size-3 text-green-600" />
                        <span className="text-green-600">{rep.close}%</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* LOA Funnel */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">LOA Funnel</h3>
            <div className="flex flex-col items-center gap-2">
              <div className="w-full bg-blue-600 text-white text-center py-4 rounded-t-lg" style={{ clipPath: "polygon(10% 0%, 90% 0%, 85% 100%, 15% 100%)" }}>
                <div className="text-2xl font-bold">38%</div>
              </div>
              <div className="w-11/12 bg-blue-500 text-white text-center py-4" style={{ clipPath: "polygon(12% 0%, 88% 0%, 83% 100%, 17% 100%)" }}>
                <div className="text-2xl font-bold">42%</div>
              </div>
              <div className="w-10/12 bg-orange-500 text-white text-center py-4 rounded-b-lg" style={{ clipPath: "polygon(15% 0%, 85% 0%, 80% 100%, 20% 100%)" }}>
                <div className="text-2xl font-bold">34%</div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Stops</span>
                <span className="font-semibold">2,140</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Contacts</span>
                <span className="font-semibold">812</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Presentations</span>
                <span className="font-semibold">342</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sales</span>
                <span className="font-semibold">118</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
