import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Users, Store, DollarSign, Target, Activity, Zap, Loader2 } from "lucide-react";
import { analyticsAPI } from "@/services/api";
import type { User } from "@/app/App";

interface OwnerDashboardViewProps {
  user: User;
}

type TimeFilter = "week" | "month" | "quarter";

export function OwnerDashboardView({ user }: OwnerDashboardViewProps) {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [metrics, setMetrics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.officeId) {
        console.warn('No officeId available for user');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        
        // Calculate start date based on filter
        if (timeFilter === "week") {
          startDate.setDate(startDate.getDate() - 7);
        } else if (timeFilter === "month") {
          startDate.setDate(startDate.getDate() - 30);
        } else {
          startDate.setMonth(startDate.getMonth() - 3);
        }

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
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        // If it's an auth error, the user will be logged out automatically
        if (error.message?.includes('No active session')) {
          console.error('Session expired, user needs to log in again');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.officeId, timeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center bg-card border-border">
          <Target className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No data available</h3>
          <p className="text-muted-foreground">Start tracking data to see office metrics</p>
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
      blue: { bg: "bg-blue-500/10", icon: "text-blue-400" },
      green: { bg: "bg-green-500/10", icon: "text-green-400" },
      orange: { bg: "bg-orange-500/10", icon: "text-orange-400" },
      purple: { bg: "bg-purple-500/10", icon: "text-purple-400" },
      pink: { bg: "bg-pink-500/10", icon: "text-pink-400" },
      indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-400" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Office Dashboard</h2>
          <p className="text-muted-foreground">
            {timeFilter === "week" ? "Last 7 days" : timeFilter === "month" ? "Last 30 days" : "Last 3 months"} performance overview
          </p>
        </div>
        
        {/* Time Filter Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={timeFilter === "week" ? "default" : "outline"}
            onClick={() => setTimeFilter("week")}
          >
            7 Days
          </Button>
          <Button
            size="sm"
            variant={timeFilter === "month" ? "default" : "outline"}
            onClick={() => setTimeFilter("month")}
          >
            30 Days
          </Button>
          <Button
            size="sm"
            variant={timeFilter === "quarter" ? "default" : "outline"}
            onClick={() => setTimeFilter("quarter")}
          >
            3 Months
          </Button>
        </div>
      </div>

      {/* Top Stats - 6 across */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          
          return (
            <Card key={stat.label} className="p-4 bg-card border-border">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`size-5 ${colors.icon}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                  {stat.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* LOA Funnel */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">LOA Funnel (Last 30 Days)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-400 mb-1">Stops</p>
            <p className="text-3xl font-bold text-foreground">{metrics.stops?.toLocaleString() || 'N/A'}</p>
            <p className="text-xs text-blue-400 mt-1">100%</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-400 mb-1">Contacts</p>
            <p className="text-3xl font-bold text-foreground">{metrics.contacts.toLocaleString()}</p>
            <p className="text-xs text-blue-400 mt-1">{metrics.contactRate}%</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-xs text-green-400 mb-1">Presentations</p>
            <p className="text-3xl font-bold text-foreground">{metrics.presentations.toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-1">{metrics.presentationRate}%</p>
          </div>
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <p className="text-xs text-orange-400 mb-1">Sales</p>
            <p className="text-3xl font-bold text-foreground">{metrics.sales.toLocaleString()}</p>
            <p className="text-xs text-orange-400 mt-1">{metrics.closeRate}%</p>
          </div>
        </div>
      </Card>

      {/* Rep Leaderboard */}
      {leaderboard.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Rep Performance Leaderboard</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
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
                    <tr key={rep.userId} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          idx === 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          idx === 1 ? "bg-gray-500/20 text-gray-400 border border-gray-500/30" :
                          idx === 2 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-primary/20">
                            {initials}
                          </div>
                          <span className="font-medium text-foreground">{rep.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 font-medium text-foreground">{rep.contacts}</td>
                      <td className="text-right py-3 px-2 text-muted-foreground">{rep.presentations}</td>
                      <td className="text-right py-3 px-2 font-semibold text-primary">{rep.sales}</td>
                      <td className="text-right py-3 px-2 font-semibold text-foreground">${rep.revenue.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <TrendingUp className="size-3" />
                          {rep.closeRate}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-2 font-medium text-foreground">${rep.revenuePerContact}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {leaderboard.length === 0 && (
        <Card className="p-8 text-center bg-card border-border">
          <Users className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No rep data yet</h3>
          <p className="text-muted-foreground">Reps need to start tracking their LOAs to appear on the leaderboard</p>
        </Card>
      )}
    </div>
  );
}