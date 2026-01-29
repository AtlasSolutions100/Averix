import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, DollarSign, Target, Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { entriesAPI, goalsAPI } from "@/services/api";
import { toast } from "sonner";
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
  const [goalsTab, setGoalsTab] = useState<"office" | "personal">("office");
  const [personalGoals, setPersonalGoals] = useState<any[]>([]);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    metric: "sales",
    target: "",
    period: "weekly",
  });

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
        
        // Handle the new response format with both array goals and loaTargets
        const arrayGoals = goalsRes?.goals || [];
        const loaTargets = goalsRes?.loaTargets || null;
        
        console.log('🔍 RepDashboard - Array goals:', arrayGoals);
        console.log('🔍 RepDashboard - LOA targets:', loaTargets);
        console.log('🔍 RepDashboard - User ID:', user.id);
        
        // Filter array goals
        const officeGoals = Array.isArray(arrayGoals) ? arrayGoals.filter((g: any) => !g.userId) : [];
        const myPersonalGoals = Array.isArray(arrayGoals) ? arrayGoals.filter((g: any) => g.userId === user.id) : [];
        
        console.log('✅ Office goals (userId=null):', officeGoals);
        console.log('✅ Personal goals (userId=' + user.id + '):', myPersonalGoals);
        
        // Set goals: use LOA targets if they exist (for office goals tab), otherwise use array office goals
        setGoals(loaTargets || officeGoals);
        setPersonalGoals(myPersonalGoals);

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
          <GoalsCard
            goals={goals}
            goalsTab={goalsTab}
            setGoalsTab={setGoalsTab}
            personalGoals={personalGoals}
            showAddGoalForm={showAddGoalForm}
            setShowAddGoalForm={setShowAddGoalForm}
            newGoal={newGoal}
            setNewGoal={setNewGoal}
            user={user}
            onPersonalGoalsUpdate={() => {
              // Reload all goals and re-filter
              goalsAPI.getGoals(user.officeId).then(res => {
                const rawGoals = res?.goals || res;
                
                // Handle both structures
                if (rawGoals && !Array.isArray(rawGoals) && typeof rawGoals === 'object') {
                  setGoals(rawGoals);
                  setPersonalGoals([]);
                } else {
                  const allGoals = Array.isArray(rawGoals) ? rawGoals : [];
                  const officeGoals = allGoals.filter((g: any) => !g.userId);
                  const myPersonalGoals = allGoals.filter((g: any) => g.userId === user.id);
                  setGoals(officeGoals);
                  setPersonalGoals(myPersonalGoals);
                }
              });
            }}
          />
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

// GoalsCard Component with Tabs
interface GoalsCardProps {
  goals: any;
  goalsTab: "office" | "personal";
  setGoalsTab: (tab: "office" | "personal") => void;
  personalGoals: any[];
  showAddGoalForm: boolean;
  setShowAddGoalForm: (show: boolean) => void;
  newGoal: { metric: string; target: string; period: string };
  setNewGoal: (goal: { metric: string; target: string; period: string }) => void;
  user: User;
  onPersonalGoalsUpdate: () => void;
}

function GoalsCard({
  goals,
  goalsTab,
  setGoalsTab,
  personalGoals,
  showAddGoalForm,
  setShowAddGoalForm,
  newGoal,
  setNewGoal,
  user,
  onPersonalGoalsUpdate,
}: GoalsCardProps) {
  const handleAddPersonalGoal = async () => {
    if (!newGoal.target) {
      toast.error('Please enter a target value');
      return;
    }

    try {
      await goalsAPI.createGoal({
        officeId: user.officeId,
        metric: newGoal.metric,
        target: parseFloat(newGoal.target),
        period: newGoal.period,
      });
      
      toast.success('Personal goal added!');
      setShowAddGoalForm(false);
      setNewGoal({ metric: "sales", target: "", period: "weekly" });
      onPersonalGoalsUpdate();
    } catch (error) {
      console.error('Failed to add goal:', error);
      toast.error('Failed to add goal');
    }
  };

  const handleDeletePersonalGoal = async (goalId: string) => {
    try {
      await goalsAPI.deleteGoal(goalId);
      toast.success('Goal deleted');
      onPersonalGoalsUpdate();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-border">
        <button
          onClick={() => setGoalsTab("office")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            goalsTab === "office"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Office Goals
          {goalsTab === "office" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setGoalsTab("personal")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            goalsTab === "personal"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Personal Goals
          {goalsTab === "personal" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Office Goals Tab */}
      {goalsTab === "office" && (
        <div className="space-y-4">
          {/* Check if goals is an object (old structure) or array (new structure) */}
          {!Array.isArray(goals) ? (
            // Old structure: single object with dailyContacts, weeklySales, etc.
            <>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-xs font-semibold text-blue-400 mb-2">Daily Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-400">Contacts</p>
                    <p className="text-xl font-bold text-foreground">{goals.dailyContacts || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400">Sales</p>
                    <p className="text-xl font-bold text-foreground">{goals.dailySales || 0}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="text-xs font-semibold text-green-400 mb-2">Weekly Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-green-400">Contacts</p>
                    <p className="text-xl font-bold text-foreground">{goals.weeklyContacts || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-400">Sales</p>
                    <p className="text-xl font-bold text-foreground">{goals.weeklySales || 0}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-xs font-semibold text-purple-400 mb-2">Monthly Targets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-purple-400">Contacts</p>
                    <p className="text-xl font-bold text-foreground">{goals.monthlyContacts || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-400">Sales</p>
                    <p className="text-xl font-bold text-foreground">{goals.monthlySales || 0}</p>
                  </div>
                </div>
              </div>
            </>
          ) : goals.length > 0 ? (
            // New structure: array of goal objects
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Office-wide performance targets</p>
              {goals.map((goal: any) => (
                <div key={goal.id} className="p-3 bg-secondary/30 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="size-4 text-primary" />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {goal.metric}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {goal.period}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target</span>
                      <span className="font-medium text-foreground">
                        {goal.target}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No office goals yet
            <div className="text-center py-8">
              <Target className="size-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No office goals set yet</p>
              <p className="text-xs text-muted-foreground mt-1">Ask your owner to set office-wide goals</p>
            </div>
          )}
        </div>
      )}

      {/* Personal Goals Tab */}
      {goalsTab === "personal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Track your own custom goals</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddGoalForm(!showAddGoalForm)}
            >
              <Plus className="size-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Add Goal Form */}
          {showAddGoalForm && (
            <div className="p-4 bg-secondary/30 border border-border rounded-lg space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Metric</label>
                <select
                  value={newGoal.metric}
                  onChange={(e) => setNewGoal({ ...newGoal, metric: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
                >
                  <option value="sales">Sales</option>
                  <option value="contacts">Contacts</option>
                  <option value="presentations">Presentations</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Target</label>
                  <Input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    placeholder="100"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Period</label>
                  <select
                    value={newGoal.period}
                    onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddPersonalGoal}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddGoalForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Personal Goals List */}
          {personalGoals.length === 0 && !showAddGoalForm ? (
            <div className="text-center py-8">
              <Target className="size-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No personal goals yet</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => setShowAddGoalForm(true)}
              >
                <Plus className="size-4 mr-1" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {personalGoals.map((goal) => {
                const progress = goal.current && goal.target ? (goal.current / goal.target) * 100 : 0;
                const isComplete = progress >= 100;

                return (
                  <div key={goal.id} className="p-3 bg-secondary/30 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isComplete ? (
                          <CheckCircle2 className="size-4 text-green-400" />
                        ) : (
                          <Target className="size-4 text-primary" />
                        )}
                        <span className="text-sm font-medium text-foreground capitalize">
                          {goal.metric}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {goal.period}
                        </Badge>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        onClick={() => handleDeletePersonalGoal(goal.id)}
                      >
                        <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-medium text-foreground">
                          {goal.current || 0} / {goal.target}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isComplete ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}