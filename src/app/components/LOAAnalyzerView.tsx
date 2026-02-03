import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, Target, TrendingUp, Save, CheckCircle2, Users, ArrowRight } from "lucide-react";
import { analyticsAPI, goalsAPI } from "@/services/api";
import type { User } from "@/app/App";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

interface LOAAnalyzerViewProps {
  user: User;
}

interface RepLOAData {
  userId: string;
  name: string;
  contacts: number;
  stops: number;
  presentations: number;
  addressChecks: number;
  creditChecks: number;
  sales: number;
  products: number;
  revenue: number;
  closeRate: string;
  contactsPerSale: string;
  presentationsPerSale: string;
  stopsPerContact: string;
}

export function LOAAnalyzerView({ user }: LOAAnalyzerViewProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [repData, setRepData] = useState<RepLOAData[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  
  // Default goals structure
  const defaultGoals = {
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
  };
  
  const [goals, setGoals] = useState<any>(defaultGoals);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.officeId) return;
      
      try {
        // Load last 30 days analytics
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        const [analyticsRes, leaderboardRes, goalsRes] = await Promise.all([
          analyticsAPI.getOfficeAnalytics(user.officeId, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }),
          analyticsAPI.getLeaderboard(user.officeId, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }),
          goalsAPI.getGoals(user.officeId),
        ]);

        if (analyticsRes?.metrics) {
          setMetrics(analyticsRes.metrics);
        }
        
        if (leaderboardRes?.leaderboard) {
          setRepData(leaderboardRes.leaderboard);
        }
        
        if (goalsRes?.loaTargets) {
          // Use LOA targets if available, otherwise use default goals
          setGoals({ ...defaultGoals, ...goalsRes.loaTargets });
        } else if (goalsRes?.goals) {
          // Fallback to regular goals object for backward compatibility
          setGoals({ ...defaultGoals, ...goalsRes.goals });
        }
      } catch (error) {
        console.error('Failed to load LOA data:', error);
        // Set default goals on error
        setGoals(defaultGoals);
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
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate actual rates
  const actualContactsPerSale = metrics?.contacts && metrics?.sales ? (metrics.contacts / metrics.sales).toFixed(1) : '0';
  const actualPresPerSale = metrics?.presentations && metrics?.sales ? (metrics.presentations / metrics.sales).toFixed(1) : '0';
  const actualStopsPerContact = metrics?.stops && metrics?.contacts ? (metrics.stops / metrics.contacts).toFixed(1) : '0';

  // Calculate gaps
  const contactsGap = parseFloat(actualContactsPerSale) - goals.contactsPerSale;
  const presGap = parseFloat(actualPresPerSale) - goals.presentationsPerSale;
  const stopsGap = parseFloat(actualStopsPerContact) - goals.stopsPerContact;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">LOA Analyzer</h2>
          <p className="text-muted-foreground">Analyze rep performance and Law of Averages metrics</p>
        </div>

        {/* Rep LOA Table */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Rep LOA Performance (Last 30 Days)</h3>
          </div>

          {repData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="size-12 mx-auto mb-3 opacity-50" />
              <p>No rep data available for the selected period</p>
              <p className="text-sm mt-2">Reps need to submit daily entries to appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Rep</TableHead>
                    <TableHead className="text-center font-semibold">Contacts</TableHead>
                    <TableHead className="text-center font-semibold">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowRight className="size-3" />
                        Stops
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowRight className="size-3" />
                        Presentations
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowRight className="size-3" />
                        Address Checks
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowRight className="size-3" />
                        Credit Checks
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowRight className="size-3" />
                        Sales
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowRight className="size-3" />
                        Products
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">Close Rate</TableHead>
                    <TableHead className="text-center font-semibold">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repData.map((rep) => (
                    <TableRow key={rep.userId}>
                      <TableCell className="font-medium">{rep.name}</TableCell>
                      <TableCell className="text-center">{rep.contacts}</TableCell>
                      <TableCell className="text-center">{rep.stops}</TableCell>
                      <TableCell className="text-center">{rep.presentations}</TableCell>
                      <TableCell className="text-center">{rep.addressChecks}</TableCell>
                      <TableCell className="text-center">{rep.creditChecks}</TableCell>
                      <TableCell className="text-center font-semibold text-primary">{rep.sales}</TableCell>
                      <TableCell className="text-center">{rep.products}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={parseFloat(rep.closeRate) >= 10 ? "default" : "secondary"} 
                               className={parseFloat(rep.closeRate) >= 10 ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                          {rep.closeRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium text-green-400">
                        ${rep.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Current Performance vs Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LOA Metrics Card */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-6">
              <Target className="size-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Office LOA Performance (Last 30 Days)</h3>
            </div>
            
            <div className="space-y-6">
              {/* Contacts per Sale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Contacts / Sale</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Goal: {goals.contactsPerSale}</span>
                    <span className="text-xs text-muted-foreground">Actual: {actualContactsPerSale}</span>
                    <Badge variant={contactsGap <= 0 ? "default" : "destructive"} className={contactsGap <= 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                      {contactsGap > 0 ? '+' : ''}{contactsGap.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${contactsGap <= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (goals.contactsPerSale / parseFloat(actualContactsPerSale)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Presentations per Sale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Presentations / Sale</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Goal: {goals.presentationsPerSale}</span>
                    <span className="text-xs text-muted-foreground">Actual: {actualPresPerSale}</span>
                    <Badge variant={presGap <= 0 ? "default" : "destructive"} className={presGap <= 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                      {presGap > 0 ? '+' : ''}{presGap.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${presGap <= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (goals.presentationsPerSale / parseFloat(actualPresPerSale)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Stops per Contact */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Stops / Contact</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Goal: {goals.stopsPerContact}</span>
                    <span className="text-xs text-muted-foreground">Actual: {actualStopsPerContact}</span>
                    <Badge variant={stopsGap <= 0 ? "default" : "destructive"} className={stopsGap <= 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                      {stopsGap > 0 ? '+' : ''}{stopsGap.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stopsGap <= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (goals.stopsPerContact / parseFloat(actualStopsPerContact)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Contacts</p>
                <p className="text-xl font-bold text-foreground">{metrics?.contacts || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Sales</p>
                <p className="text-xl font-bold text-primary">{metrics?.sales || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Close Rate</p>
                <p className="text-xl font-bold text-green-400">{metrics?.closeRate || 0}%</p>
              </div>
            </div>
          </Card>

          {/* Goal Setting Card */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-green-400" />
                <h3 className="text-lg font-semibold text-foreground">Set Office Goals</h3>
              </div>
              {user.role === 'owner' || user.role === 'cydcor' ? (
                <Button 
                  onClick={handleSaveGoals} 
                  disabled={saving || saved}
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
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
                <Badge variant="secondary" className="bg-secondary text-foreground">View Only</Badge>
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
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 text-blue-400">Daily Targets</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Contacts: <span className="font-bold text-foreground">{goals.dailyContacts}</span></div>
                    <div className="text-muted-foreground">Sales: <span className="font-bold text-foreground">{goals.dailySales}</span></div>
                  </div>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 text-green-400">Weekly Targets</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Contacts: <span className="font-bold text-foreground">{goals.weeklyContacts}</span></div>
                    <div className="text-muted-foreground">Sales: <span className="font-bold text-foreground">{goals.weeklySales}</span></div>
                  </div>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 text-purple-400">Monthly Targets</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Contacts: <span className="font-bold text-foreground">{goals.monthlyContacts}</span></div>
                    <div className="text-muted-foreground">Sales: <span className="font-bold text-foreground">{goals.monthlySales}</span></div>
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