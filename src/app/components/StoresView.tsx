import { Card } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft, ChevronRight, Grid, Bell, MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const storeData = [
  {
    name: "Best Buy NFW",
    location: "North Fort Worth",
    contacts: 310,
    contactChange: 12,
    sales: 33,
    salesChange: -6,
    revenue: 3960,
    topRep: { name: "Jake R.", avatar: "JR", closes: "12%", value: 123 },
    color: "#3b82f6"
  },
  {
    name: "Best Buy SFW",
    location: "South Fort Worth",
    contacts: 276,
    contactChange: 18,
    sales: 29,
    salesChange: 12,
    revenue: 3480,
    topRep: { name: "Marcus L.", avatar: "ML", rate: "16%", value: 1830 },
    color: "#3b82f6"
  },
  {
    name: "Target Terhama",
    location: "Terhama",
    contacts: 198,
    contactChange: 6,
    sales: 27,
    salesChange: -2,
    revenue: 3240,
    topRep: { name: "Sarah K.", avatar: "SK", rate: "16%", value: 123 },
    color: "#dc2626"
  },
  {
    name: "Target Terhama Ridge",
    location: "Terhama Ridge",
    contacts: 188,
    contactChange: 11,
    sales: 22,
    salesChange: 7,
    revenue: 2840,
    topRep: { name: "Tony D.", avatar: "TD", revContact: "$150", value: 30 },
    color: "#dc2626"
  },
];

const calendarData = [
  { day: "Mon", date: "Mon 5", rep: "Jake R.", store: "Best Buy NFW", color: "#1e40af" },
  { day: "Tue", date: "Tue 6", rep: "Best Buy NFW", store: "Best Buy NFW", value: "$3960", color: "#1e40af" },
  { day: "Wed", date: "Wed 7", rep: "Best Buy SFW", store: "Best Buy SFW", value: "$3480", color: "#1e40af" },
  { day: "Thu", date: "Thu 8", rep: "Best Buy SFW", store: "Best Buy SFW", value: "", color: "#1e40af" },
  { day: "Fri", date: "Fri 8", rep: "Target Brandon", store: "Target", value: "", color: "#dc2626" },
];

const calendarRows = [
  { day: "Mon", rep: "Jake R.", values: ["Jake R.", "Best Buy NFW", "Best Buy SFW", "Best Buy SFW", "Target Brandon", "Target Arlington", "Target Barington"] },
  { day: "Tue", rep: "Jake R.", values: ["27", "33", "28", "62", "36", "64", ""] },
  { day: "Wed", rep: "Marcus L.", values: ["26", "27", "42", "88", "47", "$150", ""] },
  { day: "Thu", rep: "Sarah K.", values: ["16", "26", "Sarah K.", "51", "32", "$128", ""] },
  { day: "Sat", rep: "Alex P.", values: ["30", "$100", "+3", "66", "30", "$80", ""] },
  { day: "Sat", rep: "Tony D.", values: ["80", "36", "43", "$123", "36", "$260", ""] },
];

const pieData = [
  { name: "Best Buy NFW", value: 3960, color: "#1e40af" },
  { name: "Best Buy SFW", value: 3480, color: "#3b82f6" },
  { name: "Best Buy Burl.", value: 3120, color: "#60a5fa" },
  { name: "Target Arlington", value: 2640, color: "#dc2626" },
  { name: "Target Overton", value: 2280, color: "#ef4444" },
];

export function StoresView() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#2c3e5c] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white">
              A
            </div>
            <span className="text-lg font-semibold">Averix</span>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button className="text-sm font-medium text-white border-b-2 border-white pb-1">
              Dashboard
            </button>
            <button className="text-sm text-gray-300 hover:text-white">
              Anmerisation
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-[#3d5070]">
            <Grid className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-[#3d5070]">
            <Bell className="size-5" />
          </Button>
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">OM</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Rep Store Tracking</h1>
            <Select defaultValue="7days">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18M7 12h10M10 18h4" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Filters
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="size-5" />
            </Button>
          </div>
        </div>

        {/* Store Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {storeData.map((store) => (
            <Card key={store.name} className="overflow-hidden">
              <div 
                className="h-2"
                style={{ backgroundColor: store.color }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{store.name.split(' ')[0]} {store.name.split(' ')[1]}</h3>
                    <p className="text-xs text-gray-600">{store.name.split(' ').slice(2).join(' ')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Contacts:</span>
                      <div className="flex items-center gap-1">
                        {store.contactChange > 0 ? (
                          <TrendingUp className="size-3 text-green-600" />
                        ) : (
                          <TrendingDown className="size-3 text-red-600" />
                        )}
                        <span className={`text-xs ${store.contactChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {store.contactChange}%
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-semibold">{store.contacts}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Sales:</span>
                      <div className="flex items-center gap-1">
                        {store.salesChange > 0 ? (
                          <TrendingUp className="size-3 text-green-600" />
                        ) : (
                          <TrendingDown className="size-3 text-red-600" />
                        )}
                        <span className={`text-xs ${store.salesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {store.salesChange > 0 ? '+' : ''}{store.salesChange}%
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-semibold">{store.sales}</p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-600">Revenue:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-semibold">${store.revenue.toLocaleString()}</p>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: store.color,
                            width: `${(store.revenue / 4000) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Top Rep:</p>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: store.color }}
                    >
                      {store.topRep.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{store.topRep.name}</p>
                      <p className="text-xs text-gray-600">
                        {store.topRep.closes && `Esp Closes: ${store.topRep.closes}`}
                        {store.topRep.rate && `Close Rate: ${store.topRep.rate}`}
                        {store.topRep.revContact && `Rev Contact: ${store.topRep.revContact}`}
                        {" • "}${store.topRep.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Calendar and Performance */}
        <div className="grid grid-cols-3 gap-6">
          {/* Store Calendar */}
          <Card className="col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Store Calendar</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="size-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600"></th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Mon 5</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Tue 6</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Wed 7</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Thu 8</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Fri 8</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Sat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3 text-sm font-medium">Mon</td>
                    <td className="py-2 px-3">
                      <div className="text-center py-2 px-2 bg-[#1e40af] text-white rounded text-xs font-medium">
                        Jake R.
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-center py-2 px-2 bg-[#1e40af] text-white rounded text-xs font-medium">
                        Best Buy NFW
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-center py-2 px-2 bg-[#1e40af] text-white rounded text-xs font-medium">
                        Best Buy SFW
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-center py-2 px-2 bg-[#1e40af] text-white rounded text-xs font-medium">
                        Best Buy SFW
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-center py-2 px-2 bg-[#dc2626] text-white rounded text-xs font-medium">
                        Target Brandon
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-center py-2 px-2 bg-[#dc2626] text-white rounded text-xs font-medium">
                        Target Arlington
                      </div>
                    </td>
                  </tr>
                  {calendarRows.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-3 text-sm font-medium">{row.day}</td>
                      {row.values.map((value, valueIdx) => (
                        <td key={valueIdx} className="py-2 px-3 text-center text-sm">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Store Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Store Performance</h3>
            <p className="text-xs text-gray-600 mb-4">Last 7 Days</p>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Contacts</span>
                <span className="font-semibold">1.63</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Sales</span>
                <span className="font-semibold">157</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-semibold">$18,720</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
