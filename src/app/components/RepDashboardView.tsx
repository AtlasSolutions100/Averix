import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, DollarSign, Target, Loader2 } from "lucide-react";
import { entriesAPI, goalsAPI } from "@/services/api";
import type { User } from "@/app/App";

interface RepDashboardViewProps {
  user: User;
}

export function RepDashboardView({ user }: RepDashboardViewProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    contacts: 0,
    presentations: 0,
    sales: 0,
    revenue: 0,
    closeRate: 0,
    revPerContact: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get last 30 days of data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const [entriesRes, goalsRes] = await Promise.all([
          entriesAPI.getUserEntries(user.id, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            limit: 100,
          }),
          goalsAPI.getGoals(user.officeId),
        ]);

        const { entries } = entriesRes;
        setGoals(goalsRes.goals);

        if (entries && entries.length > 0) {
          // Calculate totals
          const totals = entries.reduce((acc: any, entry: any) => ({
            contacts: acc.contacts + (entry.contacts || 0),
            presentations: acc.presentations + (entry.presentations || 0),
            sales: acc.sales + (entry.sales || 0),
            revenue: acc.revenue + parseFloat(entry.revenue || 0),
          }), { contacts: 0, presentations: 0, sales: 0, revenue: 0 });

          // Calculate rates
          const closeRate = totals.contacts > 0 
            ? ((totals.sales / totals.contacts) * 100) 
            : 0;
          const revPerContact = totals.contacts > 0 
            ? (totals.revenue / totals.contacts) 
            : 0;

          setStats({
            ...totals,
            closeRate: parseFloat(closeRate.toFixed(1)),
            revPerContact: parseFloat(revPerContact.toFixed(2)),
          });

          // Group by week for chart
          const last7Days = entries.slice(0, 7).reverse();
          const chartData = last7Days.map((entry: any) => {
            const date = new Date(entry.entry_date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            return {
              day: dayName,
              contacts: entry.contacts || 0,
              pres: entry.presentations || 0,
              sales: entry.sales || 0,
            };
          });
          setWeeklyData(chartData);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id, user.officeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">Welcome back, {user.name.split(' ')[0]}!</h2>
        <p className="text-muted-foreground">Here's your performance overview (Last 30 days)</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Target className="size-5 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Contacts</p>
          <p className="text-2xl font-semibold text-foreground">{stats.contacts}</p>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Calendar className="size-5 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Sales</p>
          <p className="text-2xl font-semibold text-foreground">{stats.sales}</p>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="size-5 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Revenue</p>
          <p className="text-2xl font-semibold text-foreground">${stats.revenue.toLocaleString()}</p>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="size-5 text-orange-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Close Rate</p>
          <p className="text-2xl font-semibold text-foreground">{stats.closeRate}%</p>
        </Card>
      </div>

      {/* Weekly Performance */}
      {weeklyData.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#13141f', border: '1px solid #2a2b3a', borderRadius: '8px' }} />
              <Bar dataKey="contacts" fill="#3b82f6" name="Contacts" />
              <Bar dataKey="pres" fill="#10b981" name="Presentations" />
              <Bar dataKey="sales" fill="#f59e0b" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your LOA Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Contacts per Sale</span>
                <span className="text-sm font-semibold text-foreground">
                  {stats.sales > 0 ? (stats.contacts / stats.sales).toFixed(1) : 'N/A'}
                  {goals && <span className="text-xs text-muted-foreground ml-1">(Goal: {goals.contactsPerSale})</span>}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Presentation to Sale</span>
                <span className="text-sm font-semibold text-foreground">
                  {stats.sales > 0 ? (stats.presentations / stats.sales).toFixed(1) : 'N/A'}
                  {goals && <span className="text-xs text-muted-foreground ml-1">(Goal: {goals.presentationsPerSale})</span>}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Revenue per Contact</span>
                <span className="text-sm font-semibold text-foreground">${stats.revPerContact}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {goals ? (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Office Goals</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-xs font-semibold text-blue-400 mb-2">Daily Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-400">Contacts</p>
                    <p className="text-xl font-bold text-foreground">{goals.dailyContacts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400">Sales</p>
                    <p className="text-xl font-bold text-foreground">{goals.dailySales}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="text-xs font-semibold text-green-400 mb-2">Weekly Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-green-400">Contacts</p>
                    <p className="text-xl font-bold text-foreground">{goals.weeklyContacts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-400">Sales</p>
                    <p className="text-xl font-bold text-foreground">{goals.weeklySales}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-xs font-semibold text-purple-400 mb-2">Monthly Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-purple-400">Contacts</p>
                    <p className="text-xl font-bold text-foreground">{goals.monthlyContacts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-400">Sales</p>
                    <p className="text-xl font-bold text-foreground">{goals.monthlySales}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-400">Total Presentations</span>
                  <span className="text-2xl font-bold text-foreground">{stats.presentations}</span>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-400">Total Sales</span>
                  <span className="text-2xl font-bold text-foreground">{stats.sales}</span>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-400">Avg Revenue/Sale</span>
                  <span className="text-2xl font-bold text-foreground">
                    ${stats.sales > 0 ? (stats.revenue / stats.sales).toFixed(0) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {stats.contacts === 0 && (
        <Card className="p-8 text-center bg-card border-border">
          <Target className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No data yet</h3>
          <p className="text-muted-foreground">Start tracking your LOAs to see your performance metrics here!</p>
        </Card>
      )}
    </div>
  );
}