import { Card } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, DollarSign, Target } from "lucide-react";
import type { User } from "@/app/App";

interface RepDashboardViewProps {
  user: User;
}

const weeklyData = [
  { day: "Mon", contacts: 45, pres: 18, sales: 7 },
  { day: "Tue", contacts: 52, pres: 22, sales: 8 },
  { day: "Wed", contacts: 48, pres: 20, sales: 7 },
  { day: "Thu", contacts: 56, pres: 24, sales: 9 },
  { day: "Fri", contacts: 61, pres: 26, sales: 11 },
];

const myStats = {
  contacts: 812,
  presentations: 342,
  sales: 42,
  revenue: 14600,
  closeRate: 12.3,
  revPerContact: 18.0,
};

export function RepDashboardView({ user }: RepDashboardViewProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back, {user.name.split(' ')[0]}!</h2>
        <p className="text-gray-600">Here's your performance overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="size-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="size-3" />
              +12%
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Contacts (MTD)</p>
          <p className="text-2xl font-semibold">{myStats.contacts}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="size-5 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="size-3" />
              +8%
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Sales (MTD)</p>
          <p className="text-2xl font-semibold">{myStats.sales}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="size-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="size-3" />
              +15%
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Revenue (MTD)</p>
          <p className="text-2xl font-semibold">${myStats.revenue.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="size-5 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="size-3" />
              +2.3%
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Close Rate</p>
          <p className="text-2xl font-semibold">{myStats.closeRate}%</p>
        </Card>
      </div>

      {/* Weekly Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">This Week's Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="contacts" fill="#3b82f6" name="Contacts" />
            <Bar dataKey="pres" fill="#10b981" name="Presentations" />
            <Bar dataKey="sales" fill="#f59e0b" name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your LOA Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Contacts per Sale</span>
                <span className="text-sm font-semibold">19.3</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <span className="text-xs text-green-600">Above avg</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Presentation to Sale</span>
                <span className="text-sm font-semibold">8.1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <span className="text-xs text-green-600">Excellent</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Revenue per Contact</span>
                <span className="text-sm font-semibold">${myStats.revPerContact}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-xs text-green-600">Above avg</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Goals & Targets</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Monthly Sales Goal</span>
                <span className="text-sm font-semibold text-green-700">{myStats.sales} / 50</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <p className="text-xs text-green-700 mt-1">84% complete - 8 sales to go!</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Revenue Target</span>
                <span className="text-sm font-semibold text-blue-700">${myStats.revenue.toLocaleString()} / $18,000</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '81%' }}></div>
              </div>
              <p className="text-xs text-blue-700 mt-1">81% complete - $3,400 to go!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
