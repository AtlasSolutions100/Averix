import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Target, TrendingUp, Loader2, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { goalsAPI } from "@/services/api";
import { toast } from "sonner";
import type { User } from "@/app/App";

interface GoalsViewProps {
  user: User;
}

export function GoalsView({ user }: GoalsViewProps) {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    metric: "sales",
    target: "",
    period: "weekly",
  });

  useEffect(() => {
    loadGoals();
  }, [user.officeId]);

  const loadGoals = async () => {
    if (!user?.officeId) return;
    
    try {
      const { goals: goalsData } = await goalsAPI.getGoals(user.officeId);
      setGoals(goalsData || []);
    } catch (error) {
      console.error('Failed to load goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
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
      
      toast.success('Goal added successfully');
      setShowAddForm(false);
      setNewGoal({ metric: "sales", target: "", period: "weekly" });
      loadGoals();
    } catch (error) {
      console.error('Failed to add goal:', error);
      toast.error('Failed to add goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await goalsAPI.deleteGoal(goalId);
      toast.success('Goal deleted');
      loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Goals & Targets</h2>
          <p className="text-muted-foreground">Set and track office performance goals</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="size-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Add New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Metric</label>
              <select
                value={newGoal.metric}
                onChange={(e) => setNewGoal({ ...newGoal, metric: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              >
                <option value="sales">Sales</option>
                <option value="contacts">Contacts</option>
                <option value="presentations">Presentations</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Target</label>
              <Input
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                placeholder="Enter target value"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Period</label>
              <select
                value={newGoal.period}
                onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddGoal}>Save Goal</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid gap-4">
        {goals.length === 0 ? (
          <Card className="p-8 text-center bg-card border-border">
            <Target className="size-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No goals set</h3>
            <p className="text-muted-foreground mb-4">Create goals to track office performance</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="size-4 mr-2" />
              Add Your First Goal
            </Button>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = goal.current && goal.target ? (goal.current / goal.target) * 100 : 0;
            const isComplete = progress >= 100;

            return (
              <Card key={goal.id} className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${isComplete ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                      {isComplete ? (
                        <CheckCircle2 className={`size-6 text-green-400`} />
                      ) : (
                        <Target className={`size-6 text-primary`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground capitalize">
                        {goal.metric} Goal
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">{goal.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isComplete ? "default" : "secondary"}>
                      {Math.round(progress)}%
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">
                      {goal.current || 0} / {goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isComplete ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
