import { Card } from "@/app/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Users, Store, DollarSign, Target, Activity, Zap } from "lucide-react";

const statsData = [
  { label: "Contacts", value: "2,140", change: "+12%", trend: "up", icon: Users, color: "blue" },
  { label: "Presentations", value: "897", change: "+8%", trend: "up", icon: Activity, color: "green" },
  { label: "Sales", value: "342", change: "-3%", trend: "down", icon: Target, color: "orange" },
  { label: "Revenue", value: "$42,840", change: "+15%", trend: "up", icon: DollarSign, color: "purple" },
  { label: "Close Rate", value: "38.1%", change: "+2.3%", trend: "up", icon: Zap, color: "pink" },
  { label: "Rev/Contact", value: "$20.02", change: "+4%", trend: "up", icon: Store, color: "indigo" },
];

const productionData = [
  { week: "W1", contacts: 1850, pres: 780, sales: 295 },
  { week: "W2", contacts: 1920, pres: 812, sales: 310 },
  { week: "W3", contacts: 2050, pres: 860, sales: 330 },
  { week: "W4", contacts: 1980, pres: 835, sales: 318 },
  { week: "W5", contacts: 2140, pres: 897, sales: 342 },
];

const repLeaderboard = [
  { name: "Jake R.", avatar: "JR", contacts: 812, pres: 342, sales: 42, revenue: 14600, close: 12.3, revContact: 18.0 },
  { name: "Marcus L.", avatar: "ML", contacts: 756, pres: 320, sales: 38, revenue: 13200, close: 11.9, revContact: 17.5 },
  { name: "Sarah K.", avatar: "SK", contacts: 698, pres: 295, sales: 35, revenue: 12100, close: 11.9, revContact: 17.3 },
  { name: "Alex P.", avatar: "AP", contacts: 645, pres: 280, sales: 32, revenue: 11800, close: 11.4, revContact: 18.3 },
  { name: "Tony D.", avatar: "TD", contacts: 612, pres: 268, sales: 30, revenue: 10900, close: 11.2, revContact: 17.8 },
];

const funnelSteps = [
  { label: "Stops", value: 5620, rate: 100, color: "#3b82f6" },
  { label: "Contacts", value: 2140, rate: 38, color: "#3b82f6" },
  { label: "Presentations", value: 897, rate: 42, color: "#10b981" },
  { label: "Sales", value: 342, rate: 38, color: "#f59e0b" },
];

export function OwnerDashboardView() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string }> = {
      blue: { bg: "bg-blue-100", icon: "text-blue-600" },
      green: { bg: "bg-green-100", icon: "text-green-600" },
      orange: { bg: "bg-orange-100", icon: "text-orange-600" },
      purple: { bg: "bg-purple-100", icon: "text-purple-600" },
      pink: { bg: "bg-pink-100", icon: "text-pink-600" },
      indigo: { bg: "bg-indigo-100", icon: "text-indigo-600" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Stats - 6 across */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`size-5 ${colors.icon}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Over Time */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Production Over Time</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">By Rep</button>
              <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">By Store</button>
              <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">By Product</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="contacts" stroke="#3b82f6" strokeWidth={2} name="Contacts" />
              <Line type="monotone" dataKey="pres" stroke="#10b981" strokeWidth={2} name="Presentations" />
              <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2} name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* LOA Funnel */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">LOA Funnel</h3>
          <div className="space-y-3">
            {funnelSteps.map((step, idx) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{step.label}</span>
                  <span className="text-sm font-semibold">{step.value.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all"
                      style={{ 
                        backgroundColor: step.color,
                        width: `${step.rate}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 ml-2">{step.rate}%</span>
                </div>
                {idx < funnelSteps.length - 1 && (
                  <div className="flex items-center justify-center py-1">
                    <TrendingDown className="size-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Conversion</span>
              <span className="font-semibold">6.1%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg Sale Value</span>
              <span className="font-semibold">$125</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Rep Leaderboard */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rep Performance Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-gray-600">
                <th className="text-left py-3 px-2">Rank</th>
                <th className="text-left py-3 px-2">Rep</th>
                <th className="text-right py-3 px-2">Contacts</th>
                <th className="text-right py-3 px-2">Pres</th>
                <th className="text-right py-3 px-2">Sales</th>
                <th className="text-right py-3 px-2">Revenue</th>
                <th className="text-right py-3 px-2">Close %</th>
                <th className="text-right py-3 px-2">$/Contact</th>
              </tr>
            </thead>
            <tbody>
              {repLeaderboard.map((rep, idx) => (
                <tr key={rep.name} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      idx === 0 ? "bg-yellow-100 text-yellow-700" :
                      idx === 1 ? "bg-gray-200 text-gray-700" :
                      idx === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {rep.avatar}
                      </div>
                      <span className="font-medium">{rep.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 font-medium">{rep.contacts}</td>
                  <td className="text-right py-3 px-2">{rep.pres}</td>
                  <td className="text-right py-3 px-2 font-semibold text-blue-600">{rep.sales}</td>
                  <td className="text-right py-3 px-2 font-semibold">${rep.revenue.toLocaleString()}</td>
                  <td className="text-right py-3 px-2">
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <TrendingUp className="size-3" />
                      {rep.close}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-2 font-medium">${rep.revContact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}