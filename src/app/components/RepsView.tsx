import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { TrendingUp, Users, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { usersAPI, analyticsAPI } from "@/services/api";
import type { User } from "@/app/App";

interface RepsViewProps {
  user: User;
}

export function RepsView({ user }: RepsViewProps) {
  const [loading, setLoading] = useState(true);
  const [reps, setReps] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.officeId) return;
      
      try {
        // Get reps for this office
        const { users: officeUsers } = await usersAPI.getUsers({ officeId: user.officeId });
        
        // Get performance data for last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        const { leaderboard } = await analyticsAPI.getLeaderboard(user.officeId, {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });

        setReps(leaderboard || []);
        
        // Format for chart
        const chart = (leaderboard || []).map((rep: any) => ({
          name: rep.name.split(' ')[0],
          contacts: rep.contacts,
          presentations: rep.presentations,
          sales: rep.sales,
        }));
        setChartData(chart);
      } catch (error) {
        console.error('Failed to load reps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.officeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reps.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center bg-card border-border">
          <Users className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No reps yet</h3>
          <p className="text-muted-foreground">Add reps to your office to see performance data</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Rep Performance</h2>
          <p className="text-muted-foreground">Last 30 days overview</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-1">Active Reps</p>
            <p className="text-2xl font-bold text-foreground">{reps.length}</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Contacts</p>
            <p className="text-2xl font-bold text-foreground">
              {reps.reduce((sum, rep) => sum + rep.contacts, 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-foreground">
              {reps.reduce((sum, rep) => sum + rep.sales, 0)}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground">
              ${reps.reduce((sum, rep) => sum + rep.revenue, 0).toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Rep Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="contacts" fill="#3b82f6" name="Contacts" />
                <Bar dataKey="presentations" fill="#10b981" name="Presentations" />
                <Bar dataKey="sales" fill="#f59e0b" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Rep Performance Table */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Performance</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Rep</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                  <TableHead className="text-right">Presentations</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Close %</TableHead>
                  <TableHead className="text-right">$/Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reps.map((rep, idx) => {
                  const initials = rep.name.split(' ').map((n: string) => n[0]).join('');
                  return (
                    <TableRow key={rep.userId}>
                      <TableCell>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          idx === 0 ? "bg-yellow-100 text-yellow-700" :
                          idx === 1 ? "bg-gray-200 text-gray-700" :
                          idx === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {idx + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-primary/20">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{rep.name}</p>
                            {idx === 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse"></div>
                                <span className="text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                  Top Performer
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">{rep.contacts}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{rep.presentations}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{rep.sales}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">${rep.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="size-3 text-green-400" />
                          <span className="text-green-400 font-medium">{rep.closeRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ${rep.revenuePerContact}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-blue-500/10 border-blue-500/20">
            <p className="text-sm font-semibold text-blue-400 mb-1">Top Closer</p>
            <p className="text-2xl font-bold text-foreground">
              {reps[0]?.name.split(' ')[0] || 'N/A'}
            </p>
            <p className="text-xs text-blue-400">{reps[0]?.closeRate}% close rate</p>
          </Card>

          <Card className="p-4 bg-green-500/10 border-green-500/20">
            <p className="text-sm font-semibold text-green-400 mb-1">Most Active</p>
            <p className="text-2xl font-bold text-foreground">
              {reps.reduce((max, rep) => rep.contacts > max.contacts ? rep : max, reps[0])?.name.split(' ')[0] || 'N/A'}
            </p>
            <p className="text-xs text-green-400">
              {reps.reduce((max, rep) => rep.contacts > max.contacts ? rep : max, reps[0])?.contacts} contacts
            </p>
          </Card>

          <Card className="p-4 bg-purple-500/10 border-purple-500/20">
            <p className="text-sm font-semibold text-purple-400 mb-1">Highest Revenue</p>
            <p className="text-2xl font-bold text-foreground">
              {reps.reduce((max, rep) => rep.revenue > max.revenue ? rep : max, reps[0])?.name.split(' ')[0] || 'N/A'}
            </p>
            <p className="text-xs text-purple-400">
              ${reps.reduce((max, rep) => rep.revenue > max.revenue ? rep : max, reps[0])?.revenue.toLocaleString()}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}