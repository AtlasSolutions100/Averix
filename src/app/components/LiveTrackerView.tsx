import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Plus, Minus, Save, RotateCcw, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { entriesAPI, storesAPI } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useTracker, type TrackerState } from "@/contexts/TrackerContext";
import type { User } from "@/app/App";

interface LiveTrackerViewProps {
  user: User;
}

export function LiveTrackerView({ user }: LiveTrackerViewProps) {
  const [stores, setStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { 
    tracker, 
    increment, 
    decrement, 
    resetTracker, 
    selectedStore, 
    setSelectedStore,
    loadTodayData 
  } = useTracker();

  // Load stores
  useEffect(() => {
    const loadStores = async () => {
      try {
        const { stores: storesList } = await storesAPI.getStores();
        setStores(storesList || []);
        if (storesList && storesList.length > 0) {
          setSelectedStore(storesList[0].id);
        }
      } catch (error: any) {
        console.error('Failed to load stores:', error);
        toast.error("Failed to load stores");
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, []);

  // Load today's data if it exists
  useEffect(() => {
    if (!selectedStore) return;
    loadTodayData(user.id);
  }, [selectedStore, user.id]);

  const handleSave = async () => {
    if (!selectedStore) {
      toast.error("Please select a store");
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await entriesAPI.submit({
        storeId: selectedStore,
        date: today,
        stops: tracker.stops,
        contacts: tracker.contacts,
        presentations: tracker.presentations,
        addressChecks: tracker.addressChecks,
        creditChecks: tracker.creditChecks,
        sales: tracker.sales,
        applications: tracker.products, // Map products to applications in database
        hoursWorked: 0,
        revenue: 0,
      });

      toast.success("Progress saved!", {
        description: `${tracker.sales} sales recorded`,
        icon: <CheckCircle2 className="size-4" />,
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error("Failed to save", {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset today's counters? This won't delete saved data.")) {
      resetTracker();
      toast.info("Counters reset");
    }
  };

  // Calculate rates
  const stopRate = tracker.contacts > 0 ? ((tracker.stops / tracker.contacts) * 100).toFixed(1) : "0.0";
  const presentationRate = tracker.stops > 0 ? ((tracker.presentations / tracker.stops) * 100).toFixed(1) : "0.0";
  const closeRate = tracker.contacts > 0 ? ((tracker.sales / tracker.contacts) * 100).toFixed(1) : "0.0";

  const CounterButton = ({ 
    label, 
    value, 
    field, 
    color = "blue" 
  }: { 
    label: string; 
    value: number; 
    field: keyof TrackerState; 
    color?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-500/10 border-blue-500/20 text-foreground",
      green: "bg-green-500/10 border-green-500/20 text-foreground",
      purple: "bg-purple-500/10 border-purple-500/20 text-foreground",
      orange: "bg-orange-500/10 border-orange-500/20 text-foreground",
    }[color] || "bg-blue-500/10 border-blue-500/20 text-foreground";

    return (
      <Card className={`p-4 ${colorClasses} border-2`}>
        <p className="text-sm font-medium mb-3">{label}</p>
        <div className="flex items-center justify-between gap-3 mb-3">
          <Button
            size="icon"
            variant="outline"
            onClick={() => decrement(field)}
            className="h-10 w-10 rounded-full"
          >
            <Minus className="size-4" />
          </Button>
          
          <div className="text-4xl font-bold tabular-nums min-w-[60px] text-center">
            {value}
          </div>
          
          <Button
            size="icon"
            onClick={() => increment(field)}
            className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </Card>
    );
  };

  if (loadingStores) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Live Tracker</h2>
          <p className="text-sm text-muted-foreground">Track your LOA metrics in real-time</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Store Selection */}
      <Card className="p-4 bg-card border-border">
        <label className="text-sm font-medium mb-2 block text-foreground">Current Store</label>
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger>
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} - {s.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div>
          <p className="text-xs text-blue-400">Stop Rate</p>
          <p className="text-2xl font-bold text-foreground">{stopRate}%</p>
        </div>
        <div>
          <p className="text-xs text-blue-400">Presentation Rate</p>
          <p className="text-2xl font-bold text-foreground">{presentationRate}%</p>
        </div>
        <div>
          <p className="text-xs text-blue-400">Close Rate</p>
          <p className="text-2xl font-bold text-foreground">{closeRate}%</p>
        </div>
      </div>

      {/* Counters */}
      <div className="space-y-3">
        <CounterButton label="1. Contacts" value={tracker.contacts} field="contacts" color="blue" />
        <CounterButton label="2. Stops" value={tracker.stops} field="stops" color="blue" />
        <CounterButton label="3. Presentations" value={tracker.presentations} field="presentations" color="green" />
        <CounterButton label="4. Address Checks" value={tracker.addressChecks} field="addressChecks" color="purple" />
        <CounterButton label="5. Credit Checks" value={tracker.creditChecks} field="creditChecks" color="purple" />
        <CounterButton label="6. Sales" value={tracker.sales} field="sales" color="orange" />
        <CounterButton label="7. Products" value={tracker.products} field="products" color="orange" />
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border shadow-lg lg:relative lg:shadow-none lg:border-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90 h-12 shadow-lg shadow-primary/20"
            disabled={saving}
          >
            <Save className="size-4 mr-2" />
            {saving ? "Saving..." : "Save Progress"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-12 bg-secondary/50 hover:bg-secondary border-border"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}