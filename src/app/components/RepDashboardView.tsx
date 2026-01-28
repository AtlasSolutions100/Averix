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
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back, {user.name.split(' ')[0]}!</h2>
        <p className="text-gray-600">Here's your performance overview (Last 30 days)</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="size-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Contacts</p>
          <p className="text-2xl font-semibold">{stats.contacts}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="size-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Sales</p>
          <p className="text-2xl font-semibold">{stats.sales}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="size-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Revenue</p>
          <p className="text-2xl font-semibold">${stats.revenue.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="size-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Close Rate</p>
          <p className="text-2xl font-semibold">{stats.closeRate}%</p>
        </Card>
      </div>

      {/* Weekly Performance */}
      {weeklyData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
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
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your LOA Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Contacts per Sale</span>
                <span className="text-sm font-semibold">
                  {stats.sales > 0 ? (stats.contacts / stats.sales).toFixed(1) : 'N/A'}
                  {goals && <span className="text-xs text-gray-500 ml-1">(Goal: {goals.contactsPerSale})</span>}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Presentation to Sale</span>
                <span className="text-sm font-semibold">
                  {stats.sales > 0 ? (stats.presentations / stats.sales).toFixed(1) : 'N/A'}
                  {goals && <span className="text-xs text-gray-500 ml-1">(Goal: {goals.presentationsPerSale})</span>}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Revenue per Contact</span>
                <span className="text-sm font-semibold">${stats.revPerContact}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {goals ? (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Office Goals</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="text-xs font-semibold text-blue-900 mb-2">Daily Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-700">Contacts</p>
                    <p className="text-xl font-bold text-blue-900">{goals.dailyContacts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Sales</p>
                    <p className="text-xl font-bold text-blue-900">{goals.dailySales}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h4 className="text-xs font-semibold text-green-900 mb-2">Weekly Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-green-700">Contacts</p>
                    <p className="text-xl font-bold text-green-900">{goals.weeklyContacts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Sales</p>
                    <p className="text-xl font-bold text-green-900">{goals.weeklySales}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                <h4 className="text-xs font-semibold text-purple-900 mb-2">Monthly Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-purple-700">Contacts</p>
                    <p className="text-xl font-bold text-purple-900">{goals.monthlyContacts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">Sales</p>
                    <p className="text-xl font-bold text-purple-900">{goals.monthlySales}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Total Presentations</span>
                  <span className="text-2xl font-bold text-blue-700">{stats.presentations}</span>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Total Sales</span>
                  <span className="text-2xl font-bold text-green-700">{stats.sales}</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900">Avg Revenue/Sale</span>
                  <span className="text-2xl font-bold text-purple-700">
                    ${stats.sales > 0 ? (stats.revenue / stats.sales).toFixed(0) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {stats.contacts === 0 && (
        <Card className="p-8 text-center">
          <Target className="size-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-600">Start tracking your LOAs to see your performance metrics here!</p>
        </Card>
      )}
    </div>
  );
}