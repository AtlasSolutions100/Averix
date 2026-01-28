import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Users, Store, DollarSign, Target, Activity, Zap, Loader2 } from "lucide-react";
import { analyticsAPI } from "@/services/api";
import type { User } from "@/app/App";

interface OwnerDashboardViewProps {
  user: User;
}

export function OwnerDashboardView({ user }: OwnerDashboardViewProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.officeId) {
        console.warn('No officeId available for user');
        setLoading(false);
        return;
      }
      
      try {
        // Get last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const [analyticsData, leaderboardData] = await Promise.all([
          analyticsAPI.getOfficeAnalytics(user.officeId, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }),
          analyticsAPI.getLeaderboard(user.officeId, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }),
        ]);

        setMetrics(analyticsData.metrics);
        setLeaderboard(leaderboardData.leaderboard || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.officeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <Target className="size-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Start tracking data to see office metrics</p>
        </Card>
      </div>
    );
  }

  const statsData = [
    { label: "Contacts", value: metrics.contacts.toLocaleString(), change: "+12%", trend: "up", icon: Users, color: "blue" },
    { label: "Presentations", value: metrics.presentations.toLocaleString(), change: "+8%", trend: "up", icon: Activity, color: "green" },
    { label: "Sales", value: metrics.sales.toLocaleString(), change: "-3%", trend: "down", icon: Target, color: "orange" },
    { label: "Revenue", value: `$${metrics.revenue.toLocaleString()}`, change: "+15%", trend: "up", icon: DollarSign, color: "purple" },
    { label: "Close Rate", value: `${metrics.closeRate}%`, change: "+2.3%", trend: "up", icon: Zap, color: "pink" },
    { label: "Rev/Contact", value: `$${metrics.revenuePerContact}`, change: "+4%", trend: "up", icon: Store, color: "indigo" },
  ];

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
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Office Dashboard</h2>
        <p className="text-gray-600">Last 30 days performance overview</p>
      </div>

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

      {/* LOA Funnel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">LOA Funnel (Last 30 Days)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 mb-1">Stops</p>
            <p className="text-3xl font-bold text-blue-900">{metrics.stops?.toLocaleString() || 'N/A'}</p>
            <p className="text-xs text-blue-600 mt-1">100%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 mb-1">Contacts</p>
            <p className="text-3xl font-bold text-blue-900">{metrics.contacts.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">{metrics.contactRate}%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700 mb-1">Presentations</p>
            <p className="text-3xl font-bold text-green-900">{metrics.presentations.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">{metrics.presentationRate}%</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-700 mb-1">Sales</p>
            <p className="text-3xl font-bold text-orange-900">{metrics.sales.toLocaleString()}</p>
            <p className="text-xs text-orange-600 mt-1">{metrics.closeRate}%</p>
          </div>
        </div>
      </Card>

      {/* Rep Leaderboard */}
      {leaderboard.length > 0 && (
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
                {leaderboard.map((rep, idx) => {
                  const initials = rep.name.split(' ').map((n: string) => n[0]).join('');
                  return (
                    <tr key={rep.userId} className="border-b hover:bg-gray-50">
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
                            {initials}
                          </div>
                          <span className="font-medium">{rep.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 font-medium">{rep.contacts}</td>
                      <td className="text-right py-3 px-2">{rep.presentations}</td>
                      <td className="text-right py-3 px-2 font-semibold text-blue-600">{rep.sales}</td>
                      <td className="text-right py-3 px-2 font-semibold">${rep.revenue.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <TrendingUp className="size-3" />
                          {rep.closeRate}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-2 font-medium">${rep.revenuePerContact}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {leaderboard.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="size-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rep data yet</h3>
          <p className="text-gray-600">Reps need to start tracking their LOAs to appear on the leaderboard</p>
        </Card>
      )}
    </div>
  );
}