import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, Target, TrendingUp, Save, CheckCircle2 } from "lucide-react";
import { analyticsAPI, goalsAPI } from "@/services/api";
import type { User } from "@/app/App";

interface LOAAnalyzerViewProps {
  user: User;
}

export function LOAAnalyzerView({ user }: LOAAnalyzerViewProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [goals, setGoals] = useState<any>({
    dailyContacts: 50,
    dailySales: 3,
    dailyRevenue: 360,
    weeklyContacts: 250,
    weeklySales: 15,
    weeklyRevenue: 1800,
    monthlyContacts: 1000,
    monthlySales: 60,
    monthlyRevenue: 7200,
    contactsPerSale: 7,
    presentationsPerSale: 3,
    stopsPerContact: 2,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user?.officeId) return;
      
      try {
        // Load last 30 days analytics
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        const [analyticsRes, goalsRes] = await Promise.all([
          analyticsAPI.getOfficeAnalytics(user.officeId, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }),
          goalsAPI.getGoals(user.officeId),
        ]);

        if (analyticsRes?.metrics) {
          setMetrics(analyticsRes.metrics);
        }
        if (goalsRes?.goals) {
          setGoals(goalsRes.goals);
        }
      } catch (error) {
        console.error('Failed to load LOA data:', error);
        // Set default goals on error
        setGoals({
          dailyContacts: 50,
          dailySales: 3,
          dailyRevenue: 360,
          weeklyContacts: 250,
          weeklySales: 15,
          weeklyRevenue: 1800,
          monthlyContacts: 1000,
          monthlySales: 60,
          monthlyRevenue: 7200,
          contactsPerSale: 7,
          presentationsPerSale: 3,
          stopsPerContact: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.officeId]);

  const handleSaveGoals = async () => {
    if (!user?.officeId) return;
    
    setSaving(true);
    try {
      await goalsAPI.updateGoals(user.officeId, goals);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save goals:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGoalChange = (field: string, value: string) => {
    setGoals((prev: any) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Calculate actual LOA metrics
  const actualContactsPerSale = metrics?.sales > 0 ? (metrics.contacts / metrics.sales).toFixed(1) : '0';
  const actualPresPerSale = metrics?.sales > 0 ? (metrics.presentations / metrics.sales).toFixed(1) : '0';
  const actualStopsPerContact = metrics?.contacts > 0 ? (metrics.stops / metrics.contacts).toFixed(1) : '0';

  // Calculate gaps
  const contactsGap = parseFloat(actualContactsPerSale) - goals.contactsPerSale;
  const presGap = parseFloat(actualPresPerSale) - goals.presentationsPerSale;
  const stopsGap = parseFloat(actualStopsPerContact) - goals.stopsPerContact;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">LOA Analyzer</h2>
          <p className="text-gray-600">Set goals and analyze Law of Averages metrics</p>
        </div>

        {/* Current Performance vs Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LOA Metrics Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="size-5 text-blue-600" />
              <h3 className="text-lg font-semibold">LOA Performance (Last 30 Days)</h3>
            </div>
            
            <div className="space-y-6">
              {/* Contacts per Sale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Contacts / Sale</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">Goal: {goals.contactsPerSale}</span>
                    <span className="text-xs text-gray-600">Actual: {actualContactsPerSale}</span>
                    <Badge variant={contactsGap <= 0 ? "default" : "destructive"}>
                      {contactsGap > 0 ? '+' : ''}{contactsGap.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${contactsGap <= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (goals.contactsPerSale / parseFloat(actualContactsPerSale)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Presentations per Sale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Presentations / Sale</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">Goal: {goals.presentationsPerSale}</span>
                    <span className="text-xs text-gray-600">Actual: {actualPresPerSale}</span>
                    <Badge variant={presGap <= 0 ? "default" : "destructive"}>
                      {presGap > 0 ? '+' : ''}{presGap.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${presGap <= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (goals.presentationsPerSale / parseFloat(actualPresPerSale)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Stops per Contact */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Stops / Contact</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">Goal: {goals.stopsPerContact}</span>
                    <span className="text-xs text-gray-600">Actual: {actualStopsPerContact}</span>
                    <Badge variant={stopsGap <= 0 ? "default" : "destructive"}>
                      {stopsGap > 0 ? '+' : ''}{stopsGap.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stopsGap <= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (goals.stopsPerContact / parseFloat(actualStopsPerContact)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Total Contacts</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.contacts || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Sales</p>
                <p className="text-xl font-bold text-blue-600">{metrics?.sales || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Close Rate</p>
                <p className="text-xl font-bold text-green-600">{metrics?.closeRate || 0}%</p>
              </div>
            </div>
          </Card>

          {/* Goal Setting Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-green-600" />
                <h3 className="text-lg font-semibold">Set Office Goals</h3>
              </div>
              {user.role === 'owner' || user.role === 'cydcor' ? (
                <Button 
                  onClick={handleSaveGoals} 
                  disabled={saving || saved}
                  size="sm"
                  className="gap-2"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saved ? 'Saved!' : 'Save Goals'}
                </Button>
              ) : (
                <Badge variant="secondary">View Only</Badge>
              )}
            </div>

            {user.role === 'owner' || user.role === 'cydcor' ? (
              <div className="space-y-6">
                {/* LOA Ratios */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">LOA Ratios</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="contactsPerSale" className="text-xs">Contacts per Sale</Label>
                      <Input
                        id="contactsPerSale"
                        type="number"
                        value={goals.contactsPerSale}
                        onChange={(e) => handleGoalChange('contactsPerSale', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="presPerSale" className="text-xs">Presentations per Sale</Label>
                      <Input
                        id="presPerSale"
                        type="number"
                        value={goals.presentationsPerSale}
                        onChange={(e) => handleGoalChange('presentationsPerSale', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stopsPerContact" className="text-xs">Stops per Contact</Label>
                      <Input
                        id="stopsPerContact"
                        type="number"
                        value={goals.stopsPerContact}
                        onChange={(e) => handleGoalChange('stopsPerContact', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Daily Goals */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Daily Targets</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dailyContacts" className="text-xs">Contacts</Label>
                      <Input
                        id="dailyContacts"
                        type="number"
                        value={goals.dailyContacts}
                        onChange={(e) => handleGoalChange('dailyContacts', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dailySales" className="text-xs">Sales</Label>
                      <Input
                        id="dailySales"
                        type="number"
                        value={goals.dailySales}
                        onChange={(e) => handleGoalChange('dailySales', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Weekly Goals */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Weekly Targets</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="weeklyContacts" className="text-xs">Contacts</Label>
                      <Input
                        id="weeklyContacts"
                        type="number"
                        value={goals.weeklyContacts}
                        onChange={(e) => handleGoalChange('weeklyContacts', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weeklySales" className="text-xs">Sales</Label>
                      <Input
                        id="weeklySales"
                        type="number"
                        value={goals.weeklySales}
                        onChange={(e) => handleGoalChange('weeklySales', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Monthly Goals */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Monthly Targets</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="monthlyContacts" className="text-xs">Contacts</Label>
                      <Input
                        id="monthlyContacts"
                        type="number"
                        value={goals.monthlyContacts}
                        onChange={(e) => handleGoalChange('monthlyContacts', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlySales" className="text-xs">Sales</Label>
                      <Input
                        id="monthlySales"
                        type="number"
                        value={goals.monthlySales}
                        onChange={(e) => handleGoalChange('monthlySales', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Daily Targets</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Contacts: <span className="font-bold">{goals.dailyContacts}</span></div>
                    <div>Sales: <span className="font-bold">{goals.dailySales}</span></div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Weekly Targets</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Contacts: <span className="font-bold">{goals.weeklyContacts}</span></div>
                    <div>Sales: <span className="font-bold">{goals.weeklySales}</span></div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Monthly Targets</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Contacts: <span className="font-bold">{goals.monthlyContacts}</span></div>
                    <div>Sales: <span className="font-bold">{goals.monthlySales}</span></div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}