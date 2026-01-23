import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const repData = [
  { 
    name: "Jake R.", 
    avatar: "JR",
    contacts: 812, 
    pres: 42, 
    sales: 3, 
    revenue: 14600, 
    close: 11.2, 
    trend: "up",
    revContact: 120,
    topPerformer: true,
    internet: 30
  },
  { 
    name: "Marcus L.", 
    avatar: "ML",
    contacts: 312, 
    pres: 33, 
    sales: 4, 
    revenue: 12000, 
    close: 1.5, 
    trend: "up",
    revContact: 110,
    internet: 0
  },
  { 
    name: "Sarah K.", 
    avatar: "SK",
    contacts: 322, 
    pres: 12, 
    sales: 3, 
    revenue: 11200, 
    close: 0.6, 
    trend: "up",
    revContact: 100,
    internet: 0
  },
  { 
    name: "Alex P.", 
    avatar: "AP",
    contacts: 225, 
    pres: 18, 
    sales: 3, 
    revenue: 13000, 
    close: 4.5, 
    trend: "down",
    revContact: 90,
    internet: 0
  },
  { 
    name: "Tony D.", 
    avatar: "TD",
    contacts: 225, 
    pres: 11, 
    sales: 3, 
    revenue: 13200, 
    close: 0.6, 
    trend: "up",
    revContact: 85,
    internet: 0
  },
];

const performanceData = [
  { name: "Jake R.", externalRevenue: 13160, internetRevenue: 1440 },
  { name: "Marcus L.", externalRevenue: 12000, internetRevenue: 0 },
  { name: "Sarah K.", externalRevenue: 11200, internetRevenue: 0 },
  { name: "Alex P.", externalRevenue: 13000, internetRevenue: 0 },
  { name: "Tony D.", externalRevenue: 13200, internetRevenue: 0 },
];

export function RepsView() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Rep Performance</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Rep Performance Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rep Performance Overview</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rep</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
                <TableHead className="text-right">Pres</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Close %</TableHead>
                <TableHead className="text-right">Rev/Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repData.map((rep) => (
                <TableRow key={rep.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {rep.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        {rep.topPerformer && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Top Performer</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{rep.contacts}</TableCell>
                  <TableCell className="text-right">{rep.pres}</TableCell>
                  <TableCell className="text-right">{rep.sales}</TableCell>
                  <TableCell className="text-right font-medium">${rep.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {rep.trend === "up" ? (
                        <TrendingUp className="size-4 text-green-600" />
                      ) : (
                        <TrendingDown className="size-4 text-red-600" />
                      )}
                      <span className={rep.trend === "up" ? "text-green-600" : "text-red-600"}>
                        {rep.close}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">${rep.revContact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Revenue Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Rep</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="externalRevenue" stackId="a" fill="#3b82f6" name="External" />
                <Bar dataKey="internetRevenue" stackId="a" fill="#10b981" name="Internet" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Store Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Store Comparison</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Best Buy</span>
                    <span className="text-sm text-gray-600">52%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '52%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-semibold">$3,720</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Best Buy SFW</span>
                    <span className="text-sm text-gray-600">48%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-semibold">$3,420</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Target Arlington</span>
                    <span className="text-sm text-gray-600">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-600 h-3 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-semibold">$2,640</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Target Overton</span>
                    <span className="text-sm text-gray-600">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-500 h-3 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <span className="text-sm font-semibold">$2,280</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Individual Rep Cards */}
        <div className="grid grid-cols-3 gap-4">
          {repData.slice(0, 3).map((rep) => (
            <Card key={rep.name} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {rep.avatar}
                </div>
                <div>
                  <p className="font-semibold">{rep.name}</p>
                  <p className="text-xs text-gray-600">Performance Overview</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Contacts/Hour</span>
                  <span className="font-semibold">7.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Sales/Day</span>
                  <span className="font-semibold">5.4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Close Rate</span>
                  <span className="font-semibold text-green-600">{rep.close}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
